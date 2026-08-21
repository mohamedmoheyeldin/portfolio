import { chmod, mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

const emptyState = {
  lastSyncAt: null,
  account: null,
  reviewed: 0,
  items: [],
  audit: [],
};

export async function readJson(path, fallback = null) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch (error) {
    if (error?.code === 'ENOENT') return fallback;
    throw error;
  }
}

export async function writePrivateJson(path, value) {
  await mkdir(dirname(path), { recursive: true, mode: 0o700 });
  const temporaryPath = `${path}.${process.pid}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
  await rename(temporaryPath, path);
  await chmod(path, 0o600);
}

export async function readState(path) {
  return { ...structuredClone(emptyState), ...(await readJson(path, {})) };
}

export async function appendAudit(state, action, itemId = null, detail = null) {
  state.audit = [
    ...(state.audit ?? []),
    { at: new Date().toISOString(), action, itemId, detail },
  ].slice(-250);
  return state;
}
