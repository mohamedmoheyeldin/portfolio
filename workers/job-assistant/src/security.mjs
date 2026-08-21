const encoder = new TextEncoder();
const decoder = new TextDecoder();

export function decodeBase64Url(value) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  return Uint8Array.from(atob(normalized), (character) => character.charCodeAt(0));
}

export function encodeBase64Url(value) {
  const bytes = value instanceof Uint8Array ? value : new Uint8Array(value);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function parseJwt(token) {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Access token is malformed.');
  return {
    header: JSON.parse(decoder.decode(decodeBase64Url(parts[0]))),
    payload: JSON.parse(decoder.decode(decodeBase64Url(parts[1]))),
    signingInput: encoder.encode(`${parts[0]}.${parts[1]}`),
    signature: decodeBase64Url(parts[2]),
  };
}

export async function verifyAccess(request, env) {
  const hostname = new URL(request.url).hostname;
  if ((hostname === '127.0.0.1' || hostname === 'localhost') && env.LOCAL_ACCESS_EMAIL) return env.LOCAL_ACCESS_EMAIL;
  const token = request.headers.get('cf-access-jwt-assertion');
  if (!token) throw new Response('Cloudflare Access authentication is required.', { status: 403 });
  const parsed = parseJwt(token);
  if (parsed.header.alg !== 'RS256' || !parsed.header.kid) throw new Response('Unsupported Access token.', { status: 403 });
  const jwksResponse = await fetch(`${env.ACCESS_TEAM_DOMAIN}/cdn-cgi/access/certs`, { cf: { cacheTtl: 3600, cacheEverything: true } });
  if (!jwksResponse.ok) throw new Response('Unable to validate Cloudflare Access.', { status: 503 });
  const jwks = await jwksResponse.json();
  const jwk = jwks.keys?.find((candidate) => candidate.kid === parsed.header.kid);
  if (!jwk) throw new Response('Access signing key was not found.', { status: 403 });
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  const valid = await crypto.subtle.verify({ name: 'RSASSA-PKCS1-v1_5' }, key, parsed.signature, parsed.signingInput);
  const audiences = Array.isArray(parsed.payload.aud) ? parsed.payload.aud : [parsed.payload.aud];
  const now = Math.floor(Date.now() / 1000);
  if (!valid || parsed.payload.iss !== env.ACCESS_TEAM_DOMAIN || !audiences.includes(env.ACCESS_AUD) || parsed.payload.exp <= now) {
    throw new Response('Cloudflare Access token is invalid or expired.', { status: 403 });
  }
  if (!parsed.payload.email || parsed.payload.email.toLowerCase() !== env.OWNER_EMAIL.toLowerCase()) {
    throw new Response('This account is not authorized for the application assistant.', { status: 403 });
  }
  return parsed.payload.email;
}

async function encryptionKey(secret) {
  const bytes = decodeBase64Url(secret);
  if (bytes.byteLength !== 32) throw new Error('TOKEN_ENCRYPTION_KEY must be 32 random bytes encoded as base64url.');
  return crypto.subtle.importKey('raw', bytes, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

export async function encryptJson(value, secret) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await encryptionKey(secret), encoder.encode(JSON.stringify(value)));
  return `${encodeBase64Url(iv)}.${encodeBase64Url(ciphertext)}`;
}

export async function decryptJson(value, secret) {
  const [iv, ciphertext] = value.split('.');
  if (!iv || !ciphertext) throw new Error('Encrypted token payload is malformed.');
  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: decodeBase64Url(iv) }, await encryptionKey(secret), decodeBase64Url(ciphertext));
  return JSON.parse(decoder.decode(plaintext));
}

export function safeEmail(value) {
  if (/\r|\n/.test(value)) throw new Error('Email address contains an unsafe line break.');
  const match = value.match(/<([^>]+)>/) ?? value.match(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/);
  const email = match?.[1] ?? match?.[0];
  if (!email) throw new Error('A safe email address could not be determined.');
  return email;
}
