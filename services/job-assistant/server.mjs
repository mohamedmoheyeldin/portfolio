import { randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { relative, resolve } from 'node:path';
import { promisify } from 'node:util';
import { execFile } from 'node:child_process';

import { analyzeMessage } from './lib/openai.mjs';
import { appendAudit, readJson, readState, writePrivateJson } from './lib/store.mjs';
import { buildMimeMessage, createDraft, exchangeAuthorizationCode, getGmailProfile, googleAuthorizationUrl, listRelevantMessages, sendDraft } from './lib/gmail.mjs';
import { toSnapshot } from './lib/snapshot.mjs';
import { artifactDirectory, assistantQuery, careerPath, demoMode, portfolioOrigin, projectRoot, serviceOrigin, servicePort, statePath, tokenPath } from './lib/config.mjs';

const runFile = promisify(execFile);
const oauthStates = new Map();
const sessionToken = randomBytes(32).toString('hex');
const allowedOrigins = new Set([portfolioOrigin, 'http://127.0.0.1:4321', 'http://localhost:4321']);

async function connected() {
  try { await stat(tokenPath); return true; } catch { return false; }
}

function corsHeaders(request) {
  const origin = request.headers.origin;
  return origin && allowedOrigins.has(origin) ? {
    'access-control-allow-origin': origin,
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-allow-headers': 'content-type, x-job-assistant-token',
    'access-control-max-age': '600',
    vary: 'Origin',
  } : {};
}

function respond(request, response, status, value, headers = {}) {
  const body = typeof value === 'string' ? value : JSON.stringify(value);
  response.writeHead(status, { 'content-type': typeof value === 'string' ? 'text/plain; charset=utf-8' : 'application/json; charset=utf-8', ...corsHeaders(request), ...headers });
  response.end(body);
}

async function bodyJson(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 32_000) throw new Error('Request body is too large.');
    chunks.push(chunk);
  }
  return chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {};
}

function authorized(request) {
  const supplied = request.headers['x-job-assistant-token'];
  if (typeof supplied !== 'string' || supplied.length !== sessionToken.length) return false;
  return timingSafeEqual(Buffer.from(supplied), Buffer.from(sessionToken));
}

async function snapshot() {
  const state = await readState(statePath);
  return { ...toSnapshot(state, await connected()), sessionToken };
}

async function syncInbox() {
  const [profileRecord] = await readJson(careerPath, []);
  if (!profileRecord) throw new Error('Canonical career profile is missing.');
  const messages = await listRelevantMessages(assistantQuery);
  const state = await readState(statePath);
  const known = new Map(state.items.map((item) => [item.id, item]));
  for (const message of messages) {
    if (known.has(message.id)) continue;
    const analysis = await analyzeMessage(message, profileRecord);
    known.set(message.id, { ...message, analysis, status: 'needs-review', resumePath: null, docxPath: null, draftId: null });
  }
  const profile = await getGmailProfile();
  state.account = profile.emailAddress;
  state.reviewed += messages.length;
  state.items = [...known.values()].sort((left, right) => right.receivedAt.localeCompare(left.receivedAt)).slice(0, 100);
  state.lastSyncAt = new Date().toISOString();
  await appendAudit(state, 'inbox.synced', null, `${messages.length} messages matched the configured query`);
  await writePrivateJson(statePath, state);
  return { ...toSnapshot(state, true), sessionToken };
}

async function generateResume(itemId) {
  const state = await readState(statePath);
  const item = state.items.find((candidate) => candidate.id === itemId);
  if (!item?.analysis?.relevant) throw new Error('Relevant application item was not found.');
  if (item.analysis.kind === 'confirmation') {
    item.status = 'resume-ready';
    await appendAudit(state, 'reply.prepared', itemId, 'No resume generated for confirmation-only email');
  } else {
    const planPath = resolve(artifactDirectory, `${itemId}.plan.json`);
    await writePrivateJson(planPath, item.analysis);
    const python = process.env.JOB_ASSISTANT_PYTHON ?? 'python3';
    const runtimePath = (path) => python.toLowerCase().endsWith('.exe') ? relative(projectRoot, path) : path;
    const { stdout } = await runFile(python, [runtimePath(resolve(projectRoot, 'scripts/generate-tailored-resume.py')), '--career', runtimePath(careerPath), '--plan', runtimePath(planPath), '--output', runtimePath(resolve(artifactDirectory, itemId))], { cwd: projectRoot });
    const artifacts = JSON.parse(stdout.trim());
    const localArtifactPath = (path) => resolve(projectRoot, path.replaceAll('\\', '/'));
    item.resumePath = localArtifactPath(artifacts.pdf);
    item.docxPath = localArtifactPath(artifacts.docx);
    item.status = 'resume-ready';
    await appendAudit(state, 'resume.generated', itemId, 'PDF and DOCX generated from verified facts');
  }
  await writePrivateJson(statePath, state);
  return item;
}

async function makeDraft(itemId, confirmation) {
  if (confirmation !== 'CREATE GMAIL DRAFT') throw new Error('Draft confirmation phrase is required.');
  const state = await readState(statePath);
  const item = state.items.find((candidate) => candidate.id === itemId);
  if (!item?.analysis?.relevant) throw new Error('Application item was not found.');
  if (item.analysis.requestedDocuments.length && item.analysis.kind === 'confirmation') {
    // Sensitive documents are intentionally never read or attached by this service.
  }
  const attachment = item.resumePath && item.analysis.kind === 'job'
    ? { name: item.resumePath.split('/').at(-1), data: await readFile(item.resumePath) }
    : null;
  const draft = await createDraft(buildMimeMessage({ to: item.replyTo, subject: item.analysis.replySubject, body: item.analysis.replyBody, threadId: item.threadId, attachment }));
  item.draftId = draft.id;
  item.status = 'draft-ready';
  await appendAudit(state, 'gmail.draft.created', itemId, attachment ? 'Tailored resume attached' : 'No attachment');
  await writePrivateJson(statePath, state);
  return { draftId: draft.id, status: item.status };
}

async function deliverDraft(itemId, confirmation) {
  const state = await readState(statePath);
  const item = state.items.find((candidate) => candidate.id === itemId);
  if (!item?.draftId) throw new Error('A Gmail draft must be created first.');
  const recipient = (item.replyTo.match(/<([^>]+)>/) ?? item.replyTo.match(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/))?.[1] ?? item.replyTo.match(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/)?.[0];
  if (!recipient || confirmation !== `SEND TO ${recipient}`) throw new Error(`Exact send confirmation is required for ${recipient ?? 'the recipient'}.`);
  await sendDraft(item.draftId);
  item.status = 'sent';
  await appendAudit(state, 'gmail.draft.sent', itemId, recipient);
  await writePrivateJson(statePath, state);
  return { status: item.status };
}

function reviewDetail(item) {
  const recipient = (item.replyTo.match(/<([^>]+)>/) ?? item.replyTo.match(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/))?.[1]
    ?? item.replyTo.match(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/)?.[0]
    ?? 'unknown recipient';
  return {
    id: item.id,
    kind: item.analysis.kind,
    title: `${item.analysis.role || item.subject} · ${item.analysis.company || 'Unknown company'}`,
    summary: item.analysis.summary,
    recipient,
    status: item.status,
    selectedHighlights: item.analysis.selectedHighlights,
    selectedSkills: item.analysis.selectedSkills,
    replySubject: item.analysis.replySubject,
    replyBody: item.analysis.replyBody,
    requestedDocuments: item.analysis.requestedDocuments,
    hasResume: Boolean(item.resumePath),
    hasDocx: Boolean(item.docxPath),
    hasDraft: Boolean(item.draftId),
  };
}

async function route(request, response) {
  if (request.method === 'OPTIONS') return respond(request, response, 204, '');
  const url = new URL(request.url, serviceOrigin);
  if (request.method === 'GET' && url.pathname === '/') {
    return respond(request, response, 200, `Portfolio Application Copilot is running locally.\n\nOpen ${portfolioOrigin}/assistant/ to use the dashboard.`, { 'cache-control': 'no-store' });
  }
  if (request.method === 'GET' && url.pathname === '/api/snapshot') return respond(request, response, 200, await snapshot(), { 'cache-control': 'no-store' });
  if (request.method === 'GET' && url.pathname === '/oauth/google/start') {
    if (demoMode) throw new Error('OAuth is disabled in demo mode.');
    const state = randomUUID();
    oauthStates.set(state, Date.now() + 10 * 60_000);
    response.writeHead(302, { location: googleAuthorizationUrl(state) });
    return response.end();
  }
  if (request.method === 'GET' && url.pathname === '/oauth/google/callback') {
    const state = url.searchParams.get('state');
    const expiresAt = state ? oauthStates.get(state) : null;
    oauthStates.delete(state);
    if (!expiresAt || expiresAt < Date.now()) throw new Error('OAuth state is invalid or expired.');
    const code = url.searchParams.get('code');
    if (!code) throw new Error(url.searchParams.get('error') ?? 'Google did not return an authorization code.');
    await exchangeAuthorizationCode(code);
    const gmailProfile = await getGmailProfile();
    const stateData = await readState(statePath);
    stateData.account = gmailProfile.emailAddress;
    await appendAudit(stateData, 'gmail.connected', null, gmailProfile.emailAddress);
    await writePrivateJson(statePath, stateData);
    return respond(request, response, 200, `Gmail connected for ${gmailProfile.emailAddress}. You can close this tab and return to the dashboard.`);
  }
  const detailMatch = url.pathname.match(/^\/api\/items\/([^/]+)$/);
  const artifactMatch = url.pathname.match(/^\/api\/items\/([^/]+)\/artifact\/(pdf|docx)$/);
  if ((request.method === 'POST' || detailMatch || artifactMatch) && !authorized(request)) return respond(request, response, 403, { error: 'Local session token is missing or invalid.' });
  if (request.method === 'GET' && detailMatch) {
    const state = await readState(statePath);
    const item = state.items.find((candidate) => candidate.id === detailMatch[1]);
    if (!item) return respond(request, response, 404, { error: 'Application item was not found.' });
    return respond(request, response, 200, reviewDetail(item), { 'cache-control': 'no-store' });
  }
  if (request.method === 'GET' && artifactMatch) {
    const state = await readState(statePath);
    const item = state.items.find((candidate) => candidate.id === artifactMatch[1]);
    const path = artifactMatch[2] === 'pdf' ? item?.resumePath : item?.docxPath;
    if (!path) return respond(request, response, 404, { error: 'Requested resume artifact is not ready.' });
    const data = await readFile(path);
    response.writeHead(200, {
      ...corsHeaders(request),
      'content-type': artifactMatch[2] === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'content-disposition': `attachment; filename="${path.split('/').at(-1)}"`,
      'cache-control': 'no-store',
    });
    return response.end(data);
  }
  if (request.method === 'POST' && url.pathname === '/api/sync') return respond(request, response, 200, await syncInbox());
  const action = url.pathname.match(/^\/api\/items\/([^/]+)\/(generate|draft|send)$/);
  if (request.method === 'POST' && action) {
    const [, itemId, operation] = action;
    const payload = await bodyJson(request);
    if (operation === 'generate') return respond(request, response, 200, await generateResume(itemId));
    if (operation === 'draft') return respond(request, response, 200, await makeDraft(itemId, payload.confirmation));
    if (operation === 'send') return respond(request, response, 200, await deliverDraft(itemId, payload.confirmation));
  }
  return respond(request, response, 404, { error: 'Not found' });
}

const server = createServer((request, response) => {
  route(request, response).catch((error) => {
    console.error(error);
    if (!response.headersSent) respond(request, response, 500, { error: error instanceof Error ? error.message : 'Unexpected service error' });
    else response.end();
  });
});

server.listen(servicePort, '127.0.0.1', () => {
  console.log(`Portfolio Application Copilot: ${serviceOrigin}`);
  console.log(`Dashboard: ${portfolioOrigin}/assistant/`);
  console.log(demoMode ? 'Mode: demo (OAuth disabled)' : 'Mode: local private service');
});
