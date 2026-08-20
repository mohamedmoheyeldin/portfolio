# Development

## Setup

```bash
corepack enable
corepack pnpm install --frozen-lockfile
pnpm exec playwright install chromium
```

Use Node.js 24 and the pnpm version declared in `package.json` to match CI.

## Daily workflow

```bash
pnpm dev
pnpm verify
```

For fast feedback, run `pnpm check` while editing. Use `pnpm verify` before handoff because it exercises every local quality gate and the GitHub Pages subpath build.

## Source boundaries

- `src/content/career.json` is the canonical draft career record and must remain schema-valid.
- `src/lib/presentations.ts` controls how canonical content is projected into web, PDF, and DOCX presentations.
- `src/layouts/BaseLayout.astro` owns shared page metadata and structure.
- Reuse `src/components/` and `src/styles/` rather than creating route-local variants for shared behavior.
- Keep public content confidentiality-safe and supported by the canonical data; do not invent metrics or claims.

## Deployment boundaries

Local verification does not authorize deployment. Cloudflare, Sites, and GitHub Pages each have distinct build commands documented in `README.md` and `docs/CLOUDFLARE.md`.
