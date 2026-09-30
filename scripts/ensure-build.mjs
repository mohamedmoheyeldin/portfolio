import { existsSync } from 'node:fs';

if (!existsSync(new URL('../dist/index.html', import.meta.url))) {
  await import('./build.mjs');
}
