import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

if (!existsSync(new URL('../dist/index.html', import.meta.url))) {
  const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
  const result = spawnSync(pnpm, ['build'], { stdio: 'inherit' });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
