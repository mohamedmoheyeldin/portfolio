import { decodeBase64Url, encodeBase64Url, safeEmail } from './security.mjs';

const decoder = new TextDecoder();
const encoder = new TextEncoder();
const gmailBase = 'https://gmail.googleapis.com/gmail/v1/users/me';

function headerValue(headers, name) {
  return headers.find((header) => header.name.toLowerCase() === name.toLowerCase())?.value ?? '';
}

function findTextPart(part) {
  if (part.mimeType === 'text/plain' && part.body?.data) return decoder.decode(decodeBase64Url(part.body.data));
  for (const child of part.parts ?? []) {
    const text = findTextPart(child);
    if (text) return text;
  }
  if (part.body?.data) return decoder.decode(decodeBase64Url(part.body.data)).replace(/<[^>]+>/g, ' ');
  return '';
}

const metadataHeaders = ['From', 'Reply-To', 'Subject', 'Message-ID', 'Authentication-Results'];

function metadataMessagePath(messageId) {
  const parameters = new URLSearchParams({ format: 'metadata' });
  for (const name of metadataHeaders) parameters.append('metadataHeaders', name);
  return `/messages/${encodeURIComponent(messageId)}?${parameters}`;
}

export function isMessageWithinLimit(message, maxBytes = 512_000) {
  return Number(message.sizeEstimate || 0) <= maxBytes;
}

export function extractMessage(message, { oversized = false } = {}) {
  const headers = message.payload?.headers ?? [];
  return {
    id: message.id,
    threadId: message.threadId,
    sender: headerValue(headers, 'From'),
    replyTo: headerValue(headers, 'Reply-To') || headerValue(headers, 'From'),
    subject: headerValue(headers, 'Subject') || '(No subject)',
    rfc822MessageId: headerValue(headers, 'Message-ID'),
    authenticationResults: headerValue(headers, 'Authentication-Results'),
    receivedAt: new Date(Number(message.internalDate)).toISOString(),
    sizeEstimate: Number(message.sizeEstimate || 0),
    oversized,
    body: oversized ? '' : findTextPart(message.payload ?? {}).replace(/\s+/g, ' ').trim().slice(0, 18_000),
  };
}

export function authorizationUrl(env, state) {
  const scopes = ['openid', 'email', 'https://www.googleapis.com/auth/gmail.modify'];
  if (env.GOOGLE_SHEETS_SPREADSHEET_ID || env.ENABLE_DRIVE_FILE_ACCESS === 'true') scopes.push('https://www.googleapis.com/auth/drive.file');
  return `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: env.GOOGLE_REDIRECT_URI,
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'true',
    state,
    scope: scopes.join(' '),
  })}`;
}

export async function exchangeCode(env, code) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ code, client_id: env.GOOGLE_CLIENT_ID, client_secret: env.GOOGLE_CLIENT_SECRET, redirect_uri: env.GOOGLE_REDIRECT_URI, grant_type: 'authorization_code' }),
  });
  if (!response.ok) throw new Error(`Google token exchange failed: ${response.status}`);
  const tokens = await response.json();
  return { ...tokens, expires_at: Date.now() + tokens.expires_in * 1000 };
}

export async function refreshTokens(env, tokens) {
  if (tokens.access_token && Date.now() < (tokens.expires_at ?? 0) - 60_000) return tokens;
  if (!tokens.refresh_token) throw new Error('Google refresh token is missing; reconnect Gmail.');
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: env.GOOGLE_CLIENT_ID, client_secret: env.GOOGLE_CLIENT_SECRET, refresh_token: tokens.refresh_token, grant_type: 'refresh_token' }),
  });
  if (!response.ok) throw new Error(`Google token refresh failed: ${response.status}`);
  const refreshed = await response.json();
  return { ...tokens, ...refreshed, refresh_token: tokens.refresh_token, expires_at: Date.now() + refreshed.expires_in * 1000 };
}

async function gmailRequest(tokens, path, options = {}) {
  const response = await fetch(`${gmailBase}${path}`, {
    ...options,
    headers: { authorization: `Bearer ${tokens.access_token}`, 'content-type': 'application/json', ...(options.headers ?? {}) },
  });
  if (!response.ok) throw new Error(`Gmail API failed: ${response.status} ${await response.text()}`);
  return response.json();
}

export async function getProfile(tokens) {
  return gmailRequest(tokens, '/profile');
}

export async function listMessages(tokens, query, maxResults = 15) {
  const listing = await gmailRequest(tokens, `/messages?${new URLSearchParams({ q: query, maxResults: String(maxResults) })}`);
  const messages = [];
  for (const { id } of listing.messages ?? []) messages.push(await gmailRequest(tokens, metadataMessagePath(id)));
  return messages.map(extractMessage);
}

export async function getMessage(tokens, messageId, maxBytes = 512_000) {
  const metadata = await gmailRequest(tokens, metadataMessagePath(messageId));
  if (!isMessageWithinLimit(metadata, maxBytes)) return extractMessage(metadata, { oversized: true });
  return extractMessage(await gmailRequest(tokens, `/messages/${encodeURIComponent(messageId)}?format=full`));
}

export async function findSentMessage(tokens, rfc822MessageId) {
  const q = `in:sent rfc822msgid:${rfc822MessageId.replace(/[<>]/g, '')}`;
  const listing = await gmailRequest(tokens, `/messages?${new URLSearchParams({ q, maxResults: '1' })}`);
  return listing.messages?.[0] ?? null;
}

export async function findDraft(tokens, rfc822MessageId) {
  const q = `rfc822msgid:${rfc822MessageId.replace(/[<>]/g, '')}`;
  const listing = await gmailRequest(tokens, `/drafts?${new URLSearchParams({ q, maxResults: '1' })}`);
  return listing.drafts?.[0] ?? null;
}

export function buildMimeMessage({ to, subject, body, threadId, attachment, messageId, inReplyTo }) {
  const boundary = `portfolio-assistant-${crypto.randomUUID()}`;
  const lines = [
    `To: ${safeEmail(to)}`, `Subject: ${subject.replace(/[\r\n]/g, ' ')}`,
    ...(messageId ? [`Message-ID: ${messageId.replace(/[\r\n]/g, '')}`] : []), 'MIME-Version: 1.0',
    ...(inReplyTo ? [`In-Reply-To: ${inReplyTo.replace(/[\r\n]/g, '')}`, `References: ${inReplyTo.replace(/[\r\n]/g, '')}`] : []),
    `Content-Type: multipart/mixed; boundary="${boundary}"`, '', `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"', 'Content-Transfer-Encoding: 8bit', '', body, '',
  ];
  if (attachment) lines.push(
    `--${boundary}`, 'Content-Type: application/pdf',
    `Content-Disposition: attachment; filename="${attachment.name.replace(/[\r\n"]/g, '')}"`,
    'Content-Transfer-Encoding: base64', '', btoa(String.fromCharCode(...new Uint8Array(attachment.data))), '',
  );
  lines.push(`--${boundary}--`);
  return { raw: encodeBase64Url(encoder.encode(lines.join('\r\n'))), threadId };
}

export async function createDraft(tokens, message) {
  return gmailRequest(tokens, '/drafts', { method: 'POST', body: JSON.stringify({ message }) });
}

export async function sendDraft(tokens, draftId) {
  return gmailRequest(tokens, '/drafts/send', { method: 'POST', body: JSON.stringify({ id: draftId }) });
}

export async function getOrCreateLabel(tokens, name) {
  const labels = await gmailRequest(tokens, '/labels');
  const existing = labels.labels?.find((label) => label.name === name);
  if (existing) return existing;
  return gmailRequest(tokens, '/labels', {
    method: 'POST',
    body: JSON.stringify({ name, labelListVisibility: 'labelShow', messageListVisibility: 'show' }),
  });
}

export async function labelThread(tokens, threadId, labelId) {
  return gmailRequest(tokens, `/threads/${encodeURIComponent(threadId)}/modify`, {
    method: 'POST',
    body: JSON.stringify({ addLabelIds: [labelId] }),
  });
}

export async function archiveThread(tokens, threadId) {
  return gmailRequest(tokens, `/threads/${encodeURIComponent(threadId)}/modify`, {
    method: 'POST',
    body: JSON.stringify({ removeLabelIds: ['INBOX'] }),
  });
}
