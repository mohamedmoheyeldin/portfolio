# Development

## Setup

```bash
pnpm install --frozen-lockfile
```

Use Node.js 24 (see `.nvmrc`) and the pnpm version declared in `package.json` to match CI. The project scripts support native Windows PowerShell and POSIX shells.

## Daily workflow

```bash
pnpm dev
pnpm verify
```

For fast feedback, run `pnpm check` while editing. Use `pnpm verify` before handoff because it exercises every local quality gate and the GitHub Pages subpath build.

## Source boundaries

- `src/content/career.json` is the canonical draft career record and must remain schema-valid.
- `scripts/build.mjs` owns shared page metadata and structure.
- Reuse `src/components/` and `src/styles/` rather than creating route-local variants for shared behavior.
- All routes use the same `Header` in `Portfolio.tsx`: a 92px desktop bar aligned to the 1200px content shell, with stable scrollbar space. Keep navigation spacing in the shared stylesheet; at narrow widths the brand and links stack consistently.
- Untitled UI components live under `src/components/base/`; the portfolio uses the free MIT source distribution only. See `docs/UNTITLED-UI.md` for provenance.
- Use `pnpm dev --host 127.0.0.1 --port 4322` for a local review server. Stop the running Vite process with Ctrl+C before reusing its port.
- Development and preview servers do not open a browser. Share the local URL and let the user open it. Browser automation requires an explicit request; the configured Chrome DevTools connection uses a separate temporary Brave Origin profile.
- After `pnpm verify`, restore the root deployment build with `pnpm build:cloudflare` because the final check builds `/portfolio/` output.
- Keep public content confidentiality-safe and supported by the canonical data; do not invent metrics or claims.

## Dependency compatibility

Direct dependencies are a used subset of the official Untitled UI Vite starter. React, React Aria, Tailwind, TypeScript, and Vite are required by that stack. Node types match Node 24. Astro, cross-env, Fontsource, and Wrangler are not app dependencies. Deployment uses a separate pinned pnpm dlx command.

## Deployment authorization

Local verification does not authorize deployment. Cloudflare and GitHub Pages each have distinct build commands documented in `README.md` and `docs/CLOUDFLARE.md`.

## Resume generation

Install Python 3.10+ and the document-only requirements with `python -m pip install -r scripts/requirements-resume.txt`. Run `pnpm install --frozen-lockfile`, then `pnpm resume:generate`. The generator reads the current Untitled UI light-theme tokens, Inter fonts, and career JSON and replaces the four files under `public/resume`. Run `pnpm build:cloudflare` afterward so local downloads serve the new files.

Visually inspect both PDFs and render the DOCX files with an available document renderer before claiming Word pagination is verified. Python document packages are separate from the website dependencies.
