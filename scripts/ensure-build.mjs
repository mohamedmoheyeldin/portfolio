import { existsSync, readFileSync } from 'node:fs';

// Rebuild when dist is missing or holds the GitHub Pages subpath build (`pnpm verify` ends with one).
const index = new URL('../dist/index.html', import.meta.url);
if (!existsSync(index) || readFileSync(index, 'utf8').includes('/portfolio/assets/')) {
  await import('./build.mjs');
}
