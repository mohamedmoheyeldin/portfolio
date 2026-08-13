import { mkdir, readdir, rename, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const dist = resolve('dist');
const client = resolve(dist, 'client');
const server = resolve(dist, 'server');

await mkdir(client, { recursive: true });

for (const entry of await readdir(dist)) {
  if (entry === 'client' || entry === 'server') continue;
  await rename(resolve(dist, entry), resolve(client, entry));
}

await mkdir(server, { recursive: true });
await writeFile(
  resolve(server, 'index.js'),
  `function resolveAssetPath(pathname) {
  if (pathname.endsWith('/')) return pathname + 'index.html';
  const finalSegment = pathname.split('/').pop() ?? '';
  return finalSegment.includes('.') ? pathname : pathname + '/index.html';
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const assetUrl = new URL(resolveAssetPath(url.pathname), url);
    const response = await env.ASSETS.fetch(new Request(assetUrl, request));

    if (response.status !== 404) return response;
    return env.ASSETS.fetch(new Request(new URL('/404.html', url), request));
  },
};
`,
);
