import careerRecords from '../../../src/content/career.json' with { type: 'json' };
import { analyzeMessage } from './openai.mjs';
import { artifactKey, renderPdf, verifiedResumeHtml } from './resume.mjs';
import { archiveThread, authorizationUrl, buildMimeMessage, createDraft, exchangeCode, findDraft, findSentMessage, getMessage, getOrCreateLabel, getProfile, labelThread, listMessages, refreshTokens, sendDraft } from './gmail.mjs';
import { AUTOMATION_MODES, automationMode, canCreateDraft, canSend, deterministicDecision, retryDelaySeconds, shouldReply, verifiedDecision } from './policy.mjs';
import { decryptJson, encryptJson, safeEmail, verifyAccess } from './security.mjs';
import { appendActivity } from './sheets.mjs';

const profile = careerRecords.find((record) => record.id === 'profile');

function json(value, status = 200, headers = {}) {
  return Response.json(value, { status, headers: { 'cache-control': 'no-store', ...headers } });
}

function basePath(env, pathname) {
  return pathname.startsWith(env.API_BASE_PATH) ? pathname.slice(env.API_BASE_PATH.length) || '/' : pathname;
}

function requireSameOrigin(request, env) {
  const origin = request.headers.get('origin');
  if (origin !== env.APP_ORIGIN) throw new Response('Cross-origin mutation is not allowed.', { status: 403 });
}

async function bodyJson(request) {
  if (Number(request.headers.get('content-length') ?? 0) > 32_000) throw new Response('Request is too large.', { status: 413 });
  return request.headers.get('content-length') === '0' ? {} : request.json().catch(() => ({}));
}

function allowedAccounts(env) {
  return (env.GMAIL_ACCOUNT_EMAILS || env.GMAIL_ACCOUNT_EMAIL || '').split(',').map((value) => value.trim().toLowerCase()).filter(Boolean);
}

function requireAllowedAccount(env, value) {
  const account = String(value || '').trim().toLowerCase();
  if (!allowedAccounts(env).includes(account)) throw new Response('This Gmail account is not configured for the application system.', { status: 403 });
  return account;
}

async function audit(env, action, itemId = null, detail = null) {
  await env.DB.prepare('INSERT INTO audit_events (owner_email, item_id, action, detail, created_at) VALUES (?1, ?2, ?3, ?4, ?5)')
    .bind(env.OWNER_EMAIL, itemId, action, detail, new Date().toISOString()).run();
}

async function loadTokens(env, accountEmail) {
  const row = await env.DB.prepare('SELECT encrypted_tokens FROM oauth_tokens WHERE account_email = ?1').bind(accountEmail).first();
  if (!row) throw new Error(`Gmail is not connected for ${accountEmail}.`);
  const current = await decryptJson(row.encrypted_tokens, env.TOKEN_ENCRYPTION_KEY);
  const refreshed = await refreshTokens(env, current);
  if (refreshed.access_token !== current.access_token) await saveTokens(env, accountEmail, refreshed);
  return refreshed;
}

async function saveTokens(env, accountEmail, tokens) {
  const encrypted = await encryptJson(tokens, env.TOKEN_ENCRYPTION_KEY);
  const now = new Date().toISOString();
  await env.DB.prepare(`INSERT INTO oauth_tokens (account_email, owner_email, encrypted_tokens, connected_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?4)
    ON CONFLICT(account_email) DO UPDATE SET encrypted_tokens = excluded.encrypted_tokens, updated_at = excluded.updated_at`)
    .bind(accountEmail, env.OWNER_EMAIL, encrypted, now).run();
}

function rowToItem(row) {
  return { ...row, analysis: JSON.parse(row.analysis_json) };
}

async function publicSnapshot(env) {
  const [{ results }, accountRow, sync, reviewed] = await Promise.all([
    env.DB.prepare("SELECT * FROM application_items WHERE json_extract(analysis_json, '$.relevant') = 1 ORDER BY updated_at DESC LIMIT 100").run(),
    env.DB.prepare('SELECT COUNT(*) AS count FROM oauth_tokens').first(),
    env.DB.prepare("SELECT value FROM assistant_state WHERE key = 'last_sync_at'").first(),
    env.DB.prepare("SELECT value FROM assistant_state WHERE key = 'reviewed_count'").first(),
  ]);
  const items = results.map(rowToItem).filter((item) => item.analysis.relevant);
  const accountCount = Number(accountRow?.count ?? 0);
  return {
    mode: accountCount ? 'live' : 'demo',
    lastSyncAt: sync ? `System updated ${new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(sync.value))}` : 'Autonomous monitoring ready',
    stats: {
      reviewed: Number(reviewed?.value ?? 0),
      opportunities: items.filter((item) => item.analysis.kind === 'job').length,
      remote: items.filter((item) => item.analysis.workMode === 'remote').length,
      resumes: items.filter((item) => item.artifact_key).length,
      replies: items.filter((item) => item.sent_at).length,
      archived: items.filter((item) => item.archived_at).length,
      attention: items.filter((item) => item.status === 'needs-review' || item.status === 'quarantined').length,
    },
  };
}

async function syncAccount(env, accountEmail) {
  const enrollment = await env.DB.prepare('SELECT connected_at FROM oauth_tokens WHERE account_email = ?1').bind(accountEmail).first();
  if (!enrollment) throw new Error(`Gmail is not connected for ${accountEmail}.`);
  const messages = await listMessages(await loadTokens(env, accountEmail), env.GMAIL_QUERY, Number(env.AUTOMATION_BATCH_SIZE || 25) * 2);
  const newIds = [];
  for (const message of messages) {
    if (new Date(message.receivedAt) <= new Date(enrollment.connected_at)) continue;
    const itemId = `${accountEmail}:${message.id}`;
    const existing = await env.DB.prepare('SELECT 1 AS found FROM application_items WHERE id = ?1').bind(itemId).first();
    if (existing) continue;
    const deterministic = deterministicDecision(message, env);
    const analysis = deterministic ? {
      ...deterministic, kind: 'other', company: '', role: '', workMode: 'unknown', summary: deterministic.reason,
      selectedHighlights: [], selectedSkills: [], replySubject: '', replyBody: '', requestedDocuments: [],
    } : {};
    const now = new Date().toISOString();
    await env.DB.prepare(`INSERT INTO application_items
      (id, account_email, source_message_id, source_rfc822_id, thread_id, sender, reply_to, subject, received_at, analysis_json, status, priority, created_at, updated_at)
      VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?13)`)
      .bind(itemId, accountEmail, message.id, message.rfc822MessageId, message.threadId, message.sender, message.replyTo, message.subject, message.receivedAt,
        JSON.stringify(analysis), deterministic ? 'analyzed' : 'discovered', deterministic?.priority ?? 50, now).run();
    newIds.push(itemId);
  }
  const now = new Date().toISOString();
  await env.DB.batch([
    env.DB.prepare("INSERT INTO assistant_state (key, value, updated_at) VALUES ('last_sync_at', ?1, ?1) ON CONFLICT(key) DO UPDATE SET value=?1, updated_at=?1").bind(now),
    env.DB.prepare("INSERT INTO assistant_state (key, value, updated_at) VALUES ('reviewed_count', ?1, ?2) ON CONFLICT(key) DO UPDATE SET value=CAST(CAST(value AS INTEGER) + ?1 AS TEXT), updated_at=?2").bind(String(newIds.length), now),
  ]);
  await audit(env, 'inbox.synced', null, `${accountEmail}: ${messages.length} matched, ${newIds.length} new`);
  return newIds;
}

async function getItem(env, itemId) {
  const row = await env.DB.prepare('SELECT * FROM application_items WHERE id = ?1').bind(itemId).first();
  if (!row) throw new Response('Application item was not found.', { status: 404 });
  return rowToItem(row);
}

async function routeToReview(env, itemId, reasonCodes = []) {
  const item = await getItem(env, itemId);
  const labelName = env.NEEDS_ATTENTION_LABEL || 'AI-Career/Needs-Attention';
  const codes = [...new Set(reasonCodes.length ? reasonCodes : item.analysis.reasonCodes || ['MANUAL_REVIEW_REQUIRED'])];
  const now = new Date().toISOString();
  const tokens = await loadTokens(env, item.account_email);
  const label = await getOrCreateLabel(tokens, labelName);
  await labelThread(tokens, item.thread_id, label.id);
  await env.DB.batch([
    env.DB.prepare("UPDATE application_items SET status='needs-review', updated_at=?1, lease_owner=NULL, lease_expires_at=NULL WHERE id=?2").bind(now, itemId),
    env.DB.prepare(`INSERT INTO manual_review_items (id, item_id, reason_codes_json, gmail_label_name, label_applied_at, created_at, updated_at)
      VALUES (?1, ?2, ?3, ?4, ?5, ?5, ?5)
      ON CONFLICT(item_id) DO UPDATE SET reason_codes_json=excluded.reason_codes_json, gmail_label_name=excluded.gmail_label_name,
      label_applied_at=excluded.label_applied_at, updated_at=excluded.updated_at, resolved_at=NULL`)
      .bind(`review:${itemId}`, itemId, JSON.stringify(codes), labelName, now),
  ]);
  await audit(env, 'manual_review.routed', itemId, codes.join(','));
}

function reviewDetail(item) {
  return {
    id: item.id, kind: item.analysis.kind, title: `${item.analysis.role || item.subject} · ${item.analysis.company || 'Unknown company'}`,
    summary: item.analysis.summary, recipient: safeEmail(item.reply_to), status: item.status,
    selectedHighlights: item.analysis.selectedHighlights, selectedSkills: item.analysis.selectedSkills,
    replySubject: item.analysis.replySubject, replyBody: item.analysis.replyBody, requestedDocuments: item.analysis.requestedDocuments,
    hasResume: Boolean(item.artifact_key), hasDocx: false, hasDraft: Boolean(item.draft_id),
  };
}

async function generateResume(env, itemId) {
  const item = await getItem(env, itemId);
  if (!item.analysis.relevant) throw new Response('This message is not a relevant application.', { status: 400 });
  if (!item.analysis.needsResume) {
    await env.DB.prepare("UPDATE application_items SET status='resume-ready', updated_at=?1 WHERE id=?2").bind(new Date().toISOString(), itemId).run();
    await audit(env, 'reply.prepared', itemId, 'This message type requires no resume');
    return;
  }
  const html = verifiedResumeHtml(profile, item.analysis);
  const pdf = await renderPdf(env, html);
  const key = artifactKey(itemId, item.analysis);
  await env.ARTIFACTS.put(key, pdf, { httpMetadata: { contentType: 'application/pdf', contentDisposition: `attachment; filename="${key.split('/').at(-1)}"` } });
  await env.DB.prepare("UPDATE application_items SET artifact_key=?1, status='resume-ready', updated_at=?2 WHERE id=?3").bind(key, new Date().toISOString(), itemId).run();
  await audit(env, 'resume.generated', itemId, 'PDF stored in private R2 bucket');
}

async function makeDraft(env, itemId) {
  const item = await getItem(env, itemId);
  if (!canCreateDraft(env, item.analysis)) throw new Response('Automation policy does not allow draft creation for this item.', { status: 409 });
  if (item.analysis.needsResume && !item.artifact_key) throw new Response('Generate the tailored resume first.', { status: 409 });
  const object = item.artifact_key ? await env.ARTIFACTS.get(item.artifact_key) : null;
  const attachment = object ? { name: item.artifact_key.split('/').at(-1), data: await object.arrayBuffer() } : null;
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(item.id));
  const stableId = [...new Uint8Array(digest)].slice(0, 12).map((value) => value.toString(16).padStart(2, '0')).join('');
  const replyMessageId = item.reply_message_id || `<job-assistant-${stableId}@mohamedmoheyeldin.com>`;
  await env.DB.prepare('UPDATE application_items SET reply_message_id=?1, updated_at=?2 WHERE id=?3').bind(replyMessageId, new Date().toISOString(), itemId).run();
  const tokens = await loadTokens(env, item.account_email);
  const existingDraft = await findDraft(tokens, replyMessageId);
  const draft = existingDraft || await createDraft(tokens, buildMimeMessage({ to: item.reply_to, subject: item.analysis.replySubject, body: item.analysis.replyBody, threadId: item.thread_id, attachment, messageId: replyMessageId, inReplyTo: item.source_rfc822_id }));
  await env.DB.prepare("UPDATE application_items SET draft_id=?1, status='draft-ready', updated_at=?2 WHERE id=?3").bind(draft.id, new Date().toISOString(), itemId).run();
  await audit(env, 'gmail.draft.created', itemId, attachment ? 'Tailored PDF attached' : 'No attachment; identity documents are never automatic');
}

async function deliverDraft(env, itemId) {
  const item = await getItem(env, itemId);
  if (!canSend(env, item.analysis)) throw new Response('Automation policy does not allow sending this item.', { status: 409 });
  if (item.sent_at) return;
  if (!item.draft_id) throw new Response('Create a Gmail draft first.', { status: 409 });
  const tokens = await loadTokens(env, item.account_email);
  const alreadySent = item.reply_message_id ? await findSentMessage(tokens, item.reply_message_id) : null;
  if (!alreadySent) await sendDraft(tokens, item.draft_id);
  const now = new Date().toISOString();
  await env.DB.prepare("UPDATE application_items SET status='sent', sent_at=?1, updated_at=?1 WHERE id=?2").bind(now, itemId).run();
  await audit(env, 'gmail.reply.sent', itemId, safeEmail(item.reply_to));
}

async function logActivity(env, itemId) {
  const item = await getItem(env, itemId);
  if (item.sheet_logged_at) return;
  await appendActivity(await loadTokens(env, item.account_email), env.GOOGLE_SHEETS_SPREADSHEET_ID, item);
  const now = new Date().toISOString();
  await env.DB.prepare("UPDATE application_items SET status='logged', sheet_logged_at=?1, updated_at=?1 WHERE id=?2").bind(now, itemId).run();
  await audit(env, 'activity.logged', itemId, env.GOOGLE_SHEETS_SPREADSHEET_ID ? 'Google Sheet and D1 audit updated' : 'D1 audit updated; Sheets mirror disabled');
}

async function archiveSourceThread(env, itemId, providedTokens) {
  const item = await getItem(env, itemId);
  if (item.archived_at) return;
  const tokens = providedTokens || await loadTokens(env, item.account_email);
  await archiveThread(tokens, item.thread_id);
  const now = new Date().toISOString();
  const terminalStatus = item.status === 'quarantined' ? 'quarantined' : 'complete';
  await env.DB.prepare('UPDATE application_items SET status=?1, archived_at=?2, updated_at=?2 WHERE id=?3').bind(terminalStatus, now, itemId).run();
  await audit(env, 'gmail.thread.archived', itemId, 'INBOX label removed from the entire processed thread');
}

async function analyzeItem(env, itemId) {
  const item = await getItem(env, itemId);
  const message = await getMessage(await loadTokens(env, item.account_email), item.source_message_id, Number(env.GMAIL_MAX_MESSAGE_BYTES || 512_000));
  const decision = deterministicDecision(message, env) || verifiedDecision(await analyzeMessage(env, message, profile), message, env);
  await env.DB.prepare("UPDATE application_items SET analysis_json=?1, status='analyzed', priority=?2, updated_at=?3 WHERE id=?4")
    .bind(JSON.stringify(decision), decision.priority, new Date().toISOString(), itemId).run();
  await audit(env, 'email.analyzed', itemId, `${decision.category}: ${decision.action}; confidence=${decision.confidence}`);
}

async function automateItem(env, itemId) {
  let item = await getItem(env, itemId);
  if (item.status === 'quarantined') {
    if (!item.analysis.category) {
      const fallback = {
        relevant: true, kind: 'other', category: 'uncertain', action: 'needs-review', priority: 100,
        needsResume: false, company: '', role: '', workMode: 'unknown', confidence: 0,
        summary: 'Automation attempts were exhausted.', selectedHighlights: [], selectedSkills: [],
        replySubject: '', replyBody: '', requestedDocuments: [], requiresHumanReview: true,
        automationAllowed: false, reasonCodes: ['AUTOMATION_ATTEMPTS_EXHAUSTED'],
      };
      await env.DB.prepare('UPDATE application_items SET analysis_json=?1 WHERE id=?2').bind(JSON.stringify(fallback), itemId).run();
    }
    await routeToReview(env, itemId, item.analysis.reasonCodes || ['LEGACY_QUARANTINE']);
    return;
  }
  if (item.status === 'discovered') {
    await analyzeItem(env, itemId);
    item = await getItem(env, itemId);
  }
  const replyRequested = ['reply-with-resume', 'reply-without-resume', 'reply-safe-deferral'].includes(item.analysis.action);
  if (item.status === 'analyzed' && (item.analysis.action === 'needs-review' || item.analysis.action === 'quarantine' || item.analysis.requiresHumanReview || (replyRequested && item.analysis.automationAllowed !== true))) {
    await routeToReview(env, itemId, item.analysis.reasonCodes);
    return;
  }
  if (item.status === 'analyzed' && !shouldReply(item.analysis)) {
    await logActivity(env, itemId);
    await archiveSourceThread(env, itemId);
    return;
  }
  if (item.status === 'analyzed') await generateResume(env, itemId);
  item = await getItem(env, itemId);
  if (item.status === 'resume-ready') await makeDraft(env, itemId);
  item = await getItem(env, itemId);
  if (item.status === 'draft-ready' && automationMode(env) === AUTOMATION_MODES.DRAFT_ONLY) {
    await env.DB.prepare("UPDATE application_items SET status='drafted', updated_at=?1 WHERE id=?2").bind(new Date().toISOString(), itemId).run();
    await audit(env, 'gmail.draft.held', itemId, 'DRAFT_ONLY mode prevents delivery');
    return;
  }
  if (item.status === 'draft-ready') await deliverDraft(env, itemId);
  item = await getItem(env, itemId);
  if (item.status === 'sent') await logActivity(env, itemId);
  item = await getItem(env, itemId);
  if (item.status === 'logged') await archiveSourceThread(env, itemId);
}

async function releaseLease(env, itemId) {
  await env.DB.prepare('UPDATE application_items SET lease_owner=NULL, lease_expires_at=NULL WHERE id=?1').bind(itemId).run();
}

async function recordFailure(env, itemId, error) {
  const item = await getItem(env, itemId);
  const attempt = Number(item.attempt_count || 0) + 1;
  const exhausted = attempt >= Number(env.AUTOMATION_MAX_ATTEMPTS || 6);
  const nextAttempt = new Date(Date.now() + retryDelaySeconds(attempt) * 1000).toISOString();
  await env.DB.prepare(`UPDATE application_items SET attempt_count=?1, next_attempt_at=?2, last_error=?3,
    status=CASE WHEN ?4=1 THEN 'needs-review' ELSE status END, lease_owner=NULL, lease_expires_at=NULL, updated_at=?5 WHERE id=?6`)
    .bind(attempt, nextAttempt, error instanceof Error ? error.message.slice(0, 1000) : 'Unexpected automation failure', exhausted ? 1 : 0, new Date().toISOString(), itemId).run();
  await audit(env, exhausted ? 'automation.exhausted' : 'automation.retry_scheduled', itemId, `Attempt ${attempt}; next=${nextAttempt}`);
  if (exhausted) {
    try { await routeToReview(env, itemId, ['AUTOMATION_ATTEMPTS_EXHAUSTED']); }
    catch (reviewError) { console.error('Could not apply the Gmail needs-attention label', reviewError); }
  }
}

async function processQueue(env) {
  const runId = crypto.randomUUID();
  const now = new Date().toISOString();
  const batchSize = Number(env.AUTOMATION_BATCH_SIZE || 25);
  const { results } = await env.DB.prepare(`SELECT id FROM application_items
    WHERE status NOT IN ('complete', 'needs-review', 'drafted')
      AND (next_attempt_at IS NULL OR next_attempt_at <= ?1) AND (lease_expires_at IS NULL OR lease_expires_at <= ?1)
    ORDER BY priority DESC, received_at ASC LIMIT ?2`).bind(now, batchSize).run();
  for (const { id } of results) {
    const leaseExpires = new Date(Date.now() + 5 * 60_000).toISOString();
    const claim = await env.DB.prepare(`UPDATE application_items SET lease_owner=?1, lease_expires_at=?2
      WHERE id=?3 AND (lease_expires_at IS NULL OR lease_expires_at <= ?4)`).bind(runId, leaseExpires, id, now).run();
    if (!claim.meta?.changes) continue;
    try {
      await automateItem(env, id);
      await releaseLease(env, id);
    } catch (error) {
      console.error('Automatic application step failed', error);
      await recordFailure(env, id, error);
    }
  }
}

async function runAutomation(env) {
  const { results } = await env.DB.prepare('SELECT account_email FROM oauth_tokens ORDER BY account_email').run();
  for (const { account_email: accountEmail } of results) {
    try { await syncAccount(env, accountEmail); }
    catch (error) { console.error(`Inbox discovery failed for ${accountEmail}`, error); await audit(env, 'inbox.discovery_failed', null, accountEmail); }
  }
  await processQueue(env);
  return publicSnapshot(env);
}

async function privateSnapshot(env) {
  const [snapshot, accountRow] = await Promise.all([
    publicSnapshot(env),
    env.DB.prepare('SELECT COUNT(*) AS count FROM oauth_tokens').first(),
  ]);
  const accountCount = Number(accountRow?.count ?? 0);
  return { ...snapshot, connected: accountCount > 0, accountCount };
}

async function handle(request, env) {
  const url = new URL(request.url);
  const path = basePath(env, url.pathname);
  if (request.method === 'GET' && path === '/api/public-snapshot') return json(await publicSnapshot(env));

  const ownerEmail = await verifyAccess(request, env);
  if (request.method === 'GET' && path === '/api/snapshot') return json(await privateSnapshot(env));
  if (request.method === 'GET' && path === '/oauth/google/start') {
    const accountEmail = requireAllowedAccount(env, url.searchParams.get('account') || allowedAccounts(env)[0]);
    const state = crypto.randomUUID();
    const expires = new Date(Date.now() + 10 * 60_000).toISOString();
    await env.DB.prepare('INSERT INTO oauth_states (state, owner_email, account_email, expires_at) VALUES (?1, ?2, ?3, ?4)').bind(state, ownerEmail, accountEmail, expires).run();
    return Response.redirect(authorizationUrl(env, state), 302);
  }
  if (request.method === 'GET' && path === '/oauth/google/callback') {
    const stateValue = url.searchParams.get('state');
    const state = stateValue ? await env.DB.prepare('SELECT * FROM oauth_states WHERE state=?1').bind(stateValue).first() : null;
    if (!state || state.owner_email !== ownerEmail || new Date(state.expires_at) < new Date()) throw new Response('OAuth state is invalid or expired.', { status: 400 });
    await env.DB.prepare('DELETE FROM oauth_states WHERE state=?1').bind(stateValue).run();
    const code = url.searchParams.get('code');
    if (!code) throw new Response(url.searchParams.get('error') || 'Google returned no authorization code.', { status: 400 });
    const tokens = await exchangeCode(env, code);
    const gmailProfile = await getProfile(tokens);
    if (gmailProfile.emailAddress.toLowerCase() !== state.account_email) throw new Response('Connected Gmail does not match the selected configured account.', { status: 403 });
    await saveTokens(env, state.account_email, tokens);
    await audit(env, 'gmail.connected', null, state.account_email);
    return new Response('Gmail connected. The scheduled application system will monitor this account automatically.', { headers: { 'content-type': 'text/plain; charset=utf-8' } });
  }
  const itemMatch = path.match(/^\/api\/items\/([^/]+)$/);
  const artifactMatch = path.match(/^\/api\/items\/([^/]+)\/artifact\/(pdf|docx)$/);
  if (request.method === 'GET' && itemMatch) return json(reviewDetail(await getItem(env, decodeURIComponent(itemMatch[1]))));
  if (request.method === 'GET' && artifactMatch) {
    if (artifactMatch[2] !== 'pdf') throw new Response('Cloud deployment currently publishes PDF resumes only.', { status: 404 });
    const item = await getItem(env, decodeURIComponent(artifactMatch[1]));
    const object = item.artifact_key ? await env.ARTIFACTS.get(item.artifact_key) : null;
    if (!object) throw new Response('Resume artifact was not found.', { status: 404 });
    return new Response(object.body, { headers: { 'content-type': 'application/pdf', 'content-disposition': `attachment; filename="${item.artifact_key.split('/').at(-1)}"`, 'cache-control': 'private, no-store' } });
  }
  if (request.method === 'POST') requireSameOrigin(request, env);
  if (request.method === 'POST' && path === '/api/sync') return json(await runAutomation(env));
  const action = path.match(/^\/api\/items\/([^/]+)\/(generate|draft|send)$/);
  if (request.method === 'POST' && action) {
    await bodyJson(request);
    const itemId = decodeURIComponent(action[1]);
    if (action[2] === 'generate') await generateResume(env, itemId);
    if (action[2] === 'draft') await makeDraft(env, itemId);
    if (action[2] === 'send') await deliverDraft(env, itemId);
    return json(reviewDetail(await getItem(env, itemId)));
  }
  throw new Response('Not found', { status: 404 });
}

export default {
  async fetch(request, env) {
    try { return await handle(request, env); }
    catch (error) {
      if (error instanceof Response) return error;
      console.error(error);
      return json({ error: error instanceof Error ? error.message : 'Unexpected Worker error' }, 500);
    }
  },
  async scheduled(_controller, env, context) {
    context.waitUntil(runAutomation(env).catch((error) => console.error('Scheduled application automation failed', error)));
  },
};
