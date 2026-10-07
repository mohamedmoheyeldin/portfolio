# Portfolio — mohamedmoheyeldin.com

React 19 + Vite 8 portfolio and multi-format resume platform (free Untitled UI components, Tailwind CSS v4), prerendered to static HTML and deployed to Cloudflare at https://mohamedmoheyeldin.com/. Shared defaults: `C:\Projects\CLAUDE.md`. The detailed project rules live in `AGENTS.md` (shared with Codex) and are imported at the end of this file; where they are more specific, they take priority over this summary.

## Setup

- Node.js 24 (`.nvmrc`) and pnpm 11.22.0 (`packageManager` in `package.json`). The machine default is Node 26; switch first with `fnm use 24`.
- Install: `pnpm install --frozen-lockfile`. Use pnpm only.

## Commands

| Task | Command |
|---|---|
| Dev server | `pnpm dev` (keep `open: false`; never pass `--open`) |
| Types + content schema | `pnpm check` |
| Full gate (run after changes) | `pnpm verify` |
| Production build for Cloudflare | `pnpm build:cloudflare` |
| Deploy dry run | `pnpm dlx wrangler@4.144.0 deploy --dry-run` |
| Regenerate all resume formats | `pnpm resume:generate` (Python; `scripts/requirements-resume.txt`) |

CI (`.github/workflows/ci.yml`, "Quality gates") runs `pnpm quality` on Node 24 for pull requests. It does not deploy.

## Layout

- `src/content/career.json` — canonical career facts, validated by `scripts/validate-content.mjs`
- `src/content/credential-images.json` — credential badge images, validated by the same script
- `src/lib/career.ts` — typed access to the career record
- `src/components/Portfolio.tsx` — page composition; `src/components/base/` — Untitled UI source components
- `src/entry-server.tsx` + `scripts/build.mjs` — static prerendering of every route and legacy redirect
- `src/styles/theme.css` — upstream theme tokens; `src/styles/global.css` — portfolio layout
- `public/resume/` — generated resume outputs; `docs/` — architecture, provenance, Cloudflare, Untitled UI notes
- `wrangler.jsonc` — Cloudflare Worker `portfolio` (static assets from `./dist`, custom domain)
- `.mcp.json` — project-scoped Untitled UI MCP for Claude Code (development tooling only; no credentials)

## Boundaries

- Do not open browser windows or tabs, or use Chrome DevTools, unless explicitly asked. Verify with builds and HTTP checks and say when visual checks were not run.
- Career facts are canonical: never invent employers, titles, dates, metrics, or outcomes. Regenerate every resume format together after career changes.
- Design from the official Untitled UI website and source only (not Context7). Do not add browser test runners, WSL, Docker, or local AI models.
- `main` is production. Application Studio work stays on the `application-studio` branch; its generated `workers/studio/worker-configuration.d.ts` is ignored here.

## Publishing and the live site

- The public site is static: Cloudflare Workers Static Assets serves `./dist` for the `portfolio` Worker. There is no application server.
- Cloudflare's Git integration builds with `pnpm run build:cloudflare` and deploys with `pnpm dlx wrangler@4.144.0 deploy` whenever `main` changes, so any push or merge to `main` is a production release. Feature branches, including `application-studio`, are never production.
- Release flow (only on an explicit request): work on a branch, run `pnpm verify` and the deploy dry run, open a pull request into `main`, wait for CI, then merge. Manual fallback: `pnpm deploy:cloudflare` (needs a Cloudflare login).
- Verify without a browser: `curl.exe -sI https://mohamedmoheyeldin.com/` and fetch the changed page or resume file. State plainly when visual verification was not done.

## Release limits

- Do not commit, push, open pull requests, merge to `main`, deploy (Cloudflare or GitHub Pages), or generate release artifacts unless explicitly requested.

## Detailed rules

@AGENTS.md
