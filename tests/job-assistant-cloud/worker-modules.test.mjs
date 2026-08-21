import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';

import { authorizationUrl, extractMessage, buildMimeMessage, isMessageWithinLimit } from '../../workers/job-assistant/src/gmail.mjs';
import { verifiedAnalysis } from '../../workers/job-assistant/src/openai.mjs';
import { AUTOMATION_MODES, automationMode, canCreateDraft, canSend, deterministicDecision, retryDelaySeconds, senderTrust, shouldReply, verifiedDecision } from '../../workers/job-assistant/src/policy.mjs';
import { verifiedResumeHtml, artifactKey } from '../../workers/job-assistant/src/resume.mjs';
import { decodeBase64Url, decryptJson, encodeBase64Url, encryptJson, safeEmail } from '../../workers/job-assistant/src/security.mjs';

const projectRoot = resolve(import.meta.dirname, '../..');
const [profile] = JSON.parse(await readFile(resolve(projectRoot, 'src/content/career.json'), 'utf8'));

test('keeps the public snapshot separate and routes private AI payloads through AI Gateway', async () => {
  const worker = await readFile(resolve(projectRoot, 'workers/job-assistant/src/index.mjs'), 'utf8');
  const openai = await readFile(resolve(projectRoot, 'workers/job-assistant/src/openai.mjs'), 'utf8');
  const gmail = await readFile(resolve(projectRoot, 'workers/job-assistant/src/gmail.mjs'), 'utf8');
  const migration = await readFile(resolve(projectRoot, 'workers/job-assistant/migrations/0001_initial.sql'), 'utf8');

  assert.match(worker, /path === '\/api\/public-snapshot'/);
  assert.ok(worker.indexOf("path === '/api/public-snapshot'") < worker.indexOf('verifyAccess(request, env)'));
  assert.match(openai, /gateway\.ai\.cloudflare\.com/);
  assert.match(openai, /'cf-aig-collect-log-payload': 'false'/);
  assert.match(openai, /'cf-aig-skip-cache': 'true'/);
  assert.equal(openai.includes('env.OPENAI_API_KEY'), false);
  assert.match(gmail, /auth\/gmail\.modify/);
  assert.match(gmail, /removeLabelIds: \['INBOX'\]/);
  assert.equal(gmail.includes('auth/gmail.readonly'), false);
  assert.equal(gmail.includes('auth/gmail.compose'), false);
  assert.equal(gmail.includes('auth/gmail.send'), false);
  assert.match(migration, /account_email TEXT PRIMARY KEY/);
  assert.match(migration, /connected_at TEXT NOT NULL/);
  assert.match(migration, /UNIQUE INDEX IF NOT EXISTS idx_application_items_account_message/);
  assert.match(migration, /archived_at TEXT/);
  assert.match(worker, /await findSentMessage[\s\S]*await sendDraft/);
  assert.match(worker, /lease_expires_at/);
  assert.match(worker, /automation\.retry_scheduled/);
  assert.match(worker, /await archiveThread/);
  assert.match(worker, /gmail\.thread\.archived/);
  assert.match(worker, /manual_review\.routed/);
  assert.match(worker, /await labelThread/);
  assert.match(worker, /status='needs-review'/);
  assert.match(migration, /CREATE TABLE IF NOT EXISTS manual_review_items/);
});

test('deterministic policy overrides AI for configured employers and automated alerts', () => {
  const employer = deterministicDecision({ sender: 'Manager <lead@example.org>', subject: 'Update', body: 'Hello' }, { CURRENT_EMPLOYER_DOMAINS: 'example.org' });
  assert.equal(employer.category, 'current-employer');
  assert.equal(shouldReply(employer), false);

  const alert = deterministicDecision({ sender: 'jobs-alerts@vendor.test', subject: 'Daily job alert', body: 'Unsubscribe' });
  assert.equal(alert.category, 'automated-alert');
  assert.equal(alert.action, 'archive-only');
});

test('sensitive document requests are routed for attention and retries back off', () => {
  const decision = verifiedDecision({ relevant: true, category: 'job', action: 'reply-with-resume', requestedDocuments: ['Driver license'], confidence: 99 }, { sender: 'human@example.com' }, { AUTOMATION_MODE: 'FULL_CONFIGURED_AUTOMATION', AUTOMATION_SENDER_DOMAINS: 'example.com' });
  assert.equal(decision.action, 'needs-review');
  assert.equal(decision.requiresHumanReview, true);
  assert.ok(decision.reasonCodes.includes('SENSITIVE_DOCUMENT_REQUEST'));
  assert.equal(decision.needsResume, false);
  assert.equal(retryDelaySeconds(1), 60);
  assert.equal(retryDelaySeconds(20), 21_600);
});

test('automation defaults off and only configured low-impact trusted mail can send', () => {
  const message = {
    sender: 'Recruiter <human@example.com>', replyTo: 'human@example.com',
    authenticationResults: 'mx.google.com; dkim=pass header.d=example.com; spf=pass',
  };
  const analysis = {
    relevant: true, category: 'new-job-opportunity', action: 'reply-with-resume',
    requestedDocuments: [], confidence: 97, reasonCodes: [], requiresHumanReview: false,
  };
  assert.equal(automationMode({}), AUTOMATION_MODES.OFF);
  assert.equal(senderTrust(message).trusted, true);

  const disabled = verifiedDecision(analysis, message, {});
  assert.equal(disabled.action, 'needs-review');
  assert.equal(canCreateDraft({}, disabled), false);

  const safeEnv = { AUTOMATION_MODE: AUTOMATION_MODES.SAFE };
  const safe = verifiedDecision(analysis, message, safeEnv);
  assert.equal(safe.automationAllowed, true);
  assert.equal(canCreateDraft(safeEnv, safe), true);
  assert.equal(canSend(safeEnv, safe), true);
  assert.equal(canSend({ AUTOMATION_MODE: AUTOMATION_MODES.DRAFT_ONLY }, { ...safe, automationAllowed: true }), false);
});

test('high-impact decisions and mismatched reply addresses always need attention', () => {
  const authenticated = {
    sender: 'Recruiter <human@example.com>', replyTo: 'human@example.com',
    authenticationResults: 'dmarc=pass header.from=example.com',
  };
  const base = { relevant: true, action: 'reply-without-resume', requestedDocuments: [], confidence: 99, reasonCodes: [], requiresHumanReview: false };
  const interview = verifiedDecision({ ...base, category: 'interview-scheduling' }, authenticated, { AUTOMATION_MODE: AUTOMATION_MODES.FULL });
  assert.equal(interview.action, 'needs-review');
  assert.ok(interview.reasonCodes.includes('HIGH_IMPACT_CATEGORY'));

  const mismatch = verifiedDecision({ ...base, category: 'follow-up' }, { ...authenticated, replyTo: 'attacker@evil.test' }, { AUTOMATION_MODE: AUTOMATION_MODES.FULL });
  assert.equal(mismatch.action, 'needs-review');
  assert.ok(mismatch.reasonCodes.includes('REPLY_TO_MISMATCH'));
});

test('oversized Gmail messages are rejected before body analysis', () => {
  assert.equal(isMessageWithinLimit({ sizeEstimate: 512_000 }, 512_000), true);
  assert.equal(isMessageWithinLimit({ sizeEstimate: 512_001 }, 512_000), false);
  const decision = deterministicDecision({ oversized: true, subject: 'Large message', sender: 'human@example.com' });
  assert.equal(decision.action, 'needs-review');
  assert.ok(decision.reasonCodes.includes('MESSAGE_TOO_LARGE'));
});

test('encrypts OAuth token JSON with AES-GCM and rejects the wrong key', async () => {
  const key = encodeBase64Url(crypto.getRandomValues(new Uint8Array(32)));
  const otherKey = encodeBase64Url(crypto.getRandomValues(new Uint8Array(32)));
  const encrypted = await encryptJson({ refresh_token: 'private-token', expires_at: 123 }, key);
  assert.equal(JSON.stringify(encrypted).includes('private-token'), false);
  assert.deepEqual(await decryptJson(encrypted, key), { refresh_token: 'private-token', expires_at: 123 });
  await assert.rejects(decryptJson(encrypted, otherKey));
});

test('cloud resume HTML accepts only canonical highlights and skills', () => {
  const knownHighlight = profile.experience[0].highlights[0];
  const analysis = verifiedAnalysis({
    company: 'Example Co', role: 'Senior SDET', selectedHighlights: [knownHighlight, 'Invented metric'], selectedSkills: ['Playwright', 'Invented tool'],
  }, profile);
  const html = verifiedResumeHtml(profile, analysis);
  assert.match(html, /Senior SDET/);
  assert.match(html, /Playwright/);
  assert.equal(html.includes('Invented metric'), false);
  assert.equal(html.includes('Invented tool'), false);
  assert.match(artifactKey('mail-1', analysis), /^resumes\/mail-1\/.+\.pdf$/);
});

test('cloud Gmail parser and MIME builder preserve the thread and block header injection', () => {
  const data = new TextEncoder().encode('Remote Playwright role');
  const message = extractMessage({
    id: 'mail-1', threadId: 'thread-1', internalDate: '1760000000000',
    payload: { headers: [{ name: 'From', value: 'Recruiter <recruiter@example.com>' }, { name: 'Subject', value: 'Role' }, { name: 'Message-ID', value: '<source@example.com>' }], mimeType: 'text/plain', body: { data: encodeBase64Url(data) } },
  });
  assert.equal(message.body, 'Remote Playwright role');
  const mime = buildMimeMessage({ to: message.replyTo, subject: 'Re: Role', body: 'Hello', threadId: message.threadId, messageId: '<reply@example.com>', inReplyTo: message.rfc822MessageId });
  assert.equal(mime.threadId, 'thread-1');
  const decodedMime = new TextDecoder().decode(decodeBase64Url(mime.raw));
  assert.match(decodedMime, /Message-ID: <reply@example\.com>/);
  assert.match(decodedMime, /In-Reply-To: <source@example\.com>/);
  assert.equal(safeEmail(message.replyTo), 'recruiter@example.com');
  assert.throws(() => safeEmail('victim@example.com\r\nBcc: attacker@example.com'));
});

test('Google OAuth requests Drive file access only when Sheets or Drive support is enabled', () => {
  const base = { GOOGLE_CLIENT_ID: 'client', GOOGLE_REDIRECT_URI: 'https://example.com/callback' };
  assert.equal(decodeURIComponent(authorizationUrl(base, 'state')).includes('auth/drive.file'), false);
  assert.equal(decodeURIComponent(authorizationUrl({ ...base, GOOGLE_SHEETS_SPREADSHEET_ID: 'configured' }, 'state')).includes('auth/drive.file'), true);
});
