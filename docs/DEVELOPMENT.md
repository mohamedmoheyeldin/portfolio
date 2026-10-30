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
- All routes render inside `Page` from `src/components/site/layout.tsx`: the header, the page, the close (contact) and the footer. Compose sections from `.section` / `.wrap` / `.section-head` and the existing components; a new project diagram belongs in `src/content/flows.ts` with the source field of each station commented.
- Pages render to static HTML at build time; the browser runs only `src/client/enhance.ts`. Do not add React state or effects to page components: they never run in production. Add behaviour to `enhance.ts` through `data-*` attributes, and keep the page complete without it (native `popover`, `<details>`, plain links).
- Use the tokens in `src/styles/site.css` (both themes are defined there); do not hard-code colours. New claims about the page belong in `src/lib/selftest.ts` only if they are measured live.
- Use `pnpm dev --host 127.0.0.1 --port 4322` for a local review server. Stop the running Vite process with Ctrl+C before reusing its port.
- Development and preview servers do not open a browser. Share the local URL and let the user open it. Browser automation requires an explicit request; the configured Chrome DevTools connection uses a separate temporary Brave Origin profile.
- After `pnpm verify`, restore the root deployment build with `pnpm build:cloudflare` because the final check builds `/portfolio/` output.
- Keep public content confidentiality-safe and supported by the canonical data; do not invent metrics or claims.

## Scrollcraft

The design follows the Scrollcraft skill (`scroll-craft` 0.3.1). It is installed once per machine, outside this repository:

- Source: `C:\Projects\scrollcraft\scroll-craft` (an unmodified copy of upstream `plugins/nateherk-design/skills/scroll-craft` at `75d81f7`; maintenance notes in `C:\Projects\scrollcraft\START-HERE.txt`).
- Claude Code loads it as a personal skill through the junction `%USERPROFILE%\.claude\skills\scroll-craft`. Invoke it with `/scroll-craft`. Do not also install the `nateherk-design` plugin; that loads a second copy.
- Workspace: `C:\Projects\.scrollcraft.json` points at `C:\Projects\scrollcraft\workspace` (builds, lab shots, `FINGERPRINTS.md`, and `playwright-core`, `axe-core` and `lighthouse` for verification). This repo carries none of them.
- No engine files are copied into the site. The portfolio uses the skill's process and taste floor with native CSS; its sections carry `data-sc-act` markers and `enhance.ts` adds `html.sc-ready` once it has run so the skill's `shoot.mjs` harness can walk them.

Preflight and harness (set `SCROLLCRAFT_CHROME` to Brave, the only Chromium browser on this machine):

```powershell
$env:SCROLLCRAFT_CHROME = "C:\Program Files\BraveSoftware\Brave-Origin\Application\brave.exe"
cd C:\Projects\scrollcraft\workspace
node ..\scroll-craft\scripts\doctor.mjs
node ..\scroll-craft\scripts\serve.mjs --root C:\Projects\portfolio\dist --port 4600
node ..\scroll-craft\scripts\shoot.mjs --url http://127.0.0.1:4600/ --out builds\portfolio-signal\lab\desk
node builds\portfolio-signal\functional.mjs   # navigation, theme, resumes, contact, work, the schematic picker and its fallbacks, self-test (4 widths x 2 themes), planted defects, keyboard, phone, no-JS, reduced motion, overflow + CLS sweep, credentials, axe
node builds\portfolio-signal\snap.mjs builds\portfolio-signal\shots http://127.0.0.1:4600 / /experience/   # screenshots, both themes, desktop and phone
```

## Dependency compatibility

Direct dependencies are React and React DOM (build-time rendering), Vite with its React plugin, and TypeScript with type packages; see `docs/DEPENDENCIES.md`. Node types match Node 24. Astro, cross-env, Fontsource, and Wrangler are not app dependencies. Deployment uses a separate pinned pnpm dlx command.

## Deployment authorization

Local verification does not authorize deployment. Cloudflare and GitHub Pages each have distinct build commands documented in `README.md` and `docs/CLOUDFLARE.md`.

## Resume generation

Resume content uses `compactHighlights` and `highlights` in the shared career record. Keep the VA customer line in both formats. The detailed document starts earlier employment on page two; inspect pagination after content changes. Portable Markdown and plain-text copies are under `public/resume/`; reconcile them when changing the career record. The website offers the plain-text version for job-board forms.

Install Python 3.10+ and the document-only requirements with `python -m pip install -r scripts/requirements-resume.txt`, then run `pnpm resume:generate`. To run without installing into a Python: `uv run --no-project --with-requirements scripts/requirements-resume.txt python scripts/generate-resumes.py src/content/career.json public/resume`. The generator reads the light-theme `--ink`, `--ink-3` and `--accent` tokens from `src/styles/site.css`, Inter fonts, and career JSON and replaces all seven files under `public/resume`: both PDF, DOCX, and Markdown variants plus job-board text. Verified credentials share issuer and date metadata in print, with a public verification link on each title. Run `pnpm build:cloudflare` afterward so local downloads serve the new files.

Visually inspect both PDFs and render the DOCX files with an available document renderer before claiming Word pagination is verified. Python document packages are separate from the website dependencies.

## Code map and project notes

The project is maintained with Claude Code, a Graphify code map, and Obsidian notes (see "How this project is maintained" in the README).

- Build the map once with `graphify extract . --code-only` (or `/graphify .` inside Claude Code), then run `graphify hook install` so it is rebuilt after every commit, checkout, and merge.
- Before a multi-file change, check impact with `graphify affected "<symbol>"` or `graphify query "<question>"`. The map is for orientation; read the real files before editing.
- `graphify-out/` is local output and is ignored by Git.
- Update README.md and the relevant document in this folder in the same pull request as the change.
