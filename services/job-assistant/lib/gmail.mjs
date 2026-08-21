import { readJson, writePrivateJson } from './store.mjs';
import { requireEnvironment, serviceOrigin, tokenPath } from './config.mjs';

const gmailBase = 'https://gmail.googleapis.com/gmail/v1/users/me';

export function decodeBase64Url(value = '') {
  return Buffer.from(value.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
}

function headerValue(headers, name) {
  return headers.find((header) => header.name.toLowerCase() === name.toLowerCase())?.value ?? '';
}

function findTextPart(part) {
  if (part.mimeType === 'text/plain' && part.body?.data) return decodeBase64Url(part.body.data);
  for (const child of part.parts ?? []) {
    const text = findTextPart(child);
    if (text) return text;
  }
  if (part.body?.data) return decodeBase64Url(part.body.data).replace(/<[^>]+>/g, ' ');
  return '';
}

export function extractMessage(message) {
  const headers = message.payload?.headers ?? [];
  return {
    id: message.id,
    threadId: message.threadId,
    sender: headerValue(headers, 'From'),
    replyTo: headerValue(headers, 'Reply-To') || headerValue(headers, 'From'),
    subject: headerValue(headers, 'Subject') || '(No subject)',
    receivedAt: new Date(Number(message.internalDate)).toISOString(),
    body: findTextPart(message.payload ?? {}).replace(/\s+/g, ' ').trim().slice(0, 18_000),
  };
}

function oauthConfig() {
  return {
    clientId: requireEnvironment('GOOGLE_CLIENT_ID'),
    clientSecret: requireEnvironment('GOOGLE_CLIENT_SECRET'),
    redirectUri: `${serviceOrigin}/oauth/google/callback`,
  };
}

export function googleAuthorizationUrl(state) {
  const { clientId, redirectUri } = oauthConfig();
  const parameters = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'true',
    state,
    scope: [
      'openid',
      'email',
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.compose',
      'https://www.googleapis.com/auth/gmail.send',
    ].join(' '),
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${parameters}`;
}

export async function exchangeAuthorizationCode(code) {
  const { clientId, clientSecret, redirectUri } = oauthConfig();
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri, grant_type: 'authorization_code' }),
  });
  if (!response.ok) throw new Error(`Google token exchange failed: ${response.status} ${await response.text()}`);
  const tokens = await response.json();
  tokens.expires_at = Date.now() + (tokens.expires_in * 1000);
  await writePrivateJson(tokenPath, tokens);
  return tokens;
}

async function accessToken() {
  const tokens = await readJson(tokenPath);
  if (!tokens) throw new Error('Gmail is not connected.');
  if (tokens.access_token && Date.now() < (tokens.expires_at ?? 0) - 60_000) return tokens.access_token;
  if (!tokens.refresh_token) throw new Error('Google refresh token is missing; reconnect Gmail.');
  const { clientId, clientSecret } = oauthConfig();
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, refresh_token: tokens.refresh_token, grant_type: 'refresh_token' }),
  });
  if (!response.ok) throw new Error(`Google token refresh failed: ${response.status}`);
  const refreshed = await response.json();
  const updated = { ...tokens, ...refreshed, refresh_token: tokens.refresh_token, expires_at: Date.now() + (refreshed.expires_in * 1000) };
  await writePrivateJson(tokenPath, updated);
  return updated.access_token;
}

async function gmailRequest(path, options = {}) {
  const response = await fetch(`${gmailBase}${path}`, {
    ...options,
    headers: { authorization: `Bearer ${await accessToken()}`, 'content-type': 'application/json', ...(options.headers ?? {}) },
  });
  if (!response.ok) throw new Error(`Gmail API failed: ${response.status} ${await response.text()}`);
  return response.json();
}

export async function getGmailProfile() {
  return gmailRequest('/profile');
}

export async function listRelevantMessages(query, maxResults = 15) {
  const listing = await gmailRequest(`/messages?${new URLSearchParams({ q: query, maxResults: String(maxResults) })}`);
  const messages = await Promise.all((listing.messages ?? []).map(({ id }) => gmailRequest(`/messages/${id}?format=full`)));
  return messages.map(extractMessage);
}

function base64Url(value) {
  return Buffer.from(value).toString('base64url');
}

function safeEmail(value) {
  if (/[\r\n]/.test(value)) throw new Error('Reply address contains an unsafe line break.');
  const match = value.match(/<([^>]+)>/) ?? value.match(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/);
  const email = match?.[1] ?? match?.[0];
  if (!email) throw new Error('A safe reply address could not be determined.');
  return email;
}

export function buildMimeMessage({ to, subject, body, threadId, attachment }) {
  const boundary = `portfolio-assistant-${crypto.randomUUID()}`;
  const lines = [
    `To: ${safeEmail(to)}`,
    `Subject: ${subject.replace(/[\r\n]/g, ' ')}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    '', `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '', body, '',
  ];
  if (attachment) lines.push(
    `--${boundary}`,
    'Content-Type: application/pdf',
    `Content-Disposition: attachment; filename="${attachment.name.replace(/[\r\n"]/g, '')}"`,
    'Content-Transfer-Encoding: base64',
    '', attachment.data.toString('base64').match(/.{1,76}/g)?.join('\r\n') ?? '', '',
  );
  lines.push(`--${boundary}--`);
  return { raw: base64Url(lines.join('\r\n')), threadId };
}

export async function createDraft(message) {
  return gmailRequest('/drafts', { method: 'POST', body: JSON.stringify({ message }) });
}

export async function sendDraft(draftId) {
  return gmailRequest('/drafts/send', { method: 'POST', body: JSON.stringify({ id: draftId }) });
}
