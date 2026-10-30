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
- All routes share the chrome in `src/components/site/chrome.tsx`: a static masthead, the `Page` wrapper (section tracking, the bottom-right dock with the index sheet, and the trace provider from `trace.tsx`), and the closing plate. Pages pass their section list to `Page`. Use `TraceChip` for any tool name and `useTraceState(tools)` for anything that should light up when one of its tools is traced. Put long detail in native `<details>` so it works without JavaScript.
- Untitled UI components live under `src/components/base/`; the portfolio uses the free MIT source distribution only. See `docs/UNTITLED-UI.md` for provenance.
- Use `pnpm dev --host 127.0.0.1 --port 4322` for a local review server. Stop the running Vite process with Ctrl+C before reusing its port.
- Development and preview servers do not open a browser. Share the local URL and let the user open it. Browser automation requires an explicit request; the configured Chrome DevTools connection uses a separate temporary Brave Origin profile.
- After `pnpm verify`, restore the root deployment build with `pnpm build:cloudflare` because the final check builds `/portfolio/` output.
- Keep public content confidentiality-safe and supported by the canonical data; do not invent metrics or claims.

## Scrollcraft

The design follows the Scrollcraft skill (`scroll-craft` 0.3.1). It is installed once per machine, outside this repository:

- Source: `C:\Projects\scrollcraft\scroll-craft` (an unmodified copy of upstream `plugins/nateherk-design/skills/scroll-craft` at `75d81f7`; maintenance notes in `C:\Projects\scrollcraft\START-HERE.txt`).
- Claude Code loads it as a personal skill through the junction `%USERPROFILE%\.claude\skills\scroll-craft`. Invoke it with `/scroll-craft`. Do not also install the `nateherk-design` plugin; that loads a second copy.
- Workspace: `C:\Projects\.scrollcraft.json` points at `C:\Projects\scrollcraft\workspace` (builds, lab shots, `FINGERPRINTS.md`, and `playwright-core`, `axe-core` and `lighthouse` for verification). This repo carries none of them.
- No engine files are copied into the site. The portfolio uses the skill's process and taste floor with native CSS; its sections carry `data-sc-act` markers and the page adds `html.sc-ready` after hydration so the skill's `shoot.mjs` harness can walk them.

Preflight and harness (set `SCROLLCRAFT_CHROME` to Brave, the only Chromium browser on this machine):

```powershell
$env:SCROLLCRAFT_CHROME = "C:\Program Files\BraveSoftware\Brave-Origin\Application\brave.exe"
cd C:\Projects\scrollcraft\workspace
node ..\scroll-craft\scripts\doctor.mjs
node ..\scroll-craft\scripts\serve.mjs --root C:\Projects\portfolio\dist --port 4600
node ..\scroll-craft\scripts\shoot.mjs --url http://127.0.0.1:4600/ --out lab\portfolio-poster\desktop
node builds\portfolio-poster\functional.mjs   # functional, trace, keyboard, phone dock, no-JS, reduced motion, axe (both themes)
node builds\portfolio-poster\pages.mjs        # screenshots 375 to 1920px, both themes, overflow and CLS sweep
```

## Dependency compatibility

Direct dependencies are a used subset of the official Untitled UI Vite starter. React, React Aria, Tailwind, TypeScript, and Vite are required by that stack. Node types match Node 24. Astro, cross-env, Fontsource, and Wrangler are not app dependencies. Deployment uses a separate pinned pnpm dlx command.

## Deployment authorization

Local verification does not authorize deployment. Cloudflare and GitHub Pages each have distinct build commands documented in `README.md` and `docs/CLOUDFLARE.md`.

## Resume generation

Resume content uses `compactHighlights` and `highlights` in the shared career record. Keep the VA customer line in both formats. The detailed document starts earlier employment on page two; inspect pagination after content changes. Portable Markdown and plain-text copies are under `public/resume/`; reconcile them when changing the career record. The website offers the plain-text version for job-board forms.

Install Python 3.10+ and the document-only requirements with `python -m pip install -r scripts/requirements-resume.txt`. Run `pnpm install --frozen-lockfile`, then `pnpm resume:generate`. The generator reads the current Untitled UI light-theme tokens, Inter fonts, and career JSON and replaces all seven files under `public/resume`: both PDF, DOCX, and Markdown variants plus job-board text. Verified credentials share issuer and date metadata in print, with a public verification link on each title. Run `pnpm build:cloudflare` afterward so local downloads serve the new files.

Visually inspect both PDFs and render the DOCX files with an available document renderer before claiming Word pagination is verified. Python document packages are separate from the website dependencies.

## Code map and project notes

The project is maintained with Claude Code, a Graphify code map, and Obsidian notes (see "How this project is maintained" in the README).

- Build the map once with `graphify extract . --code-only` (or `/graphify .` inside Claude Code), then run `graphify hook install` so it is rebuilt after every commit, checkout, and merge.
- Before a multi-file change, check impact with `graphify affected "<symbol>"` or `graphify query "<question>"`. The map is for orientation; read the real files before editing.
- `graphify-out/` is local output and is ignored by Git.
- Update README.md and the relevant document in this folder in the same pull request as the change.
