# Portfolio — mohamedmoheyeldin.com

React 19 + Vite 8 portfolio and multi-format resume platform (free Untitled UI components, Tailwind CSS v4), prerendered to static HTML and deployed to Cloudflare at https://mohamedmoheyeldin.com/. Shared defaults: the global `~/.claude/CLAUDE.md`. The detailed project rules are at the end of this file; where they are more specific, they take priority over this summary.

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
- `src/components/site/` — the pages (`home.tsx`, `experience.tsx`, `case-study.tsx`), shared chrome (`chrome.tsx`: masthead, folio, reading-depth control, colophon) and helpers (`shared.tsx`); `src/components/Portfolio.tsx` re-exports them; `src/components/base/` — Untitled UI source components
- `src/entry-server.tsx` + `scripts/build.mjs` — static prerendering of every route and legacy redirect
- `src/styles/theme.css` — upstream theme tokens; `src/styles/global.css` — `--pf-*` token aliases, self-hosted font faces, portfolio layout and motion
- `src/assets/fonts/` — self-hosted Inter and Newsreader Latin subsets (OFL)
- `public/resume/` — generated resume outputs; `docs/` — architecture, provenance, Cloudflare, Untitled UI notes
- `wrangler.jsonc` — Cloudflare Worker `portfolio` (static assets from `./dist`, custom domain)
- `.mcp.json` — project-scoped Untitled UI MCP for Claude Code (development tooling only; no credentials)

## Code map and notes

- Graphify map: if `graphify-out/` exists, read `graphify-out/GRAPH_REPORT.md` or run `graphify query "..."` / `graphify affected "..."` before multi-file changes, then open the real files before editing. Git hooks rebuild it on every commit. Never commit `graphify-out/`.
- Keep `README.md` and the matching `docs/` file current in the same change, and update the Obsidian project notes (decisions, todo) after meaningful work, as the global instructions describe.

## Boundaries

- Do not open browser windows or tabs, or use Chrome DevTools, unless explicitly asked. Verify with builds and HTTP checks and say when visual checks were not run.
- Career facts are canonical: never invent employers, titles, dates, metrics, or outcomes. Regenerate every resume format together after career changes.
- Design from the official Untitled UI website and source only (not Context7). Do not add browser test runners to this repo's dependencies, or WSL, Docker, or local AI models. Browser checks live in the Scrollcraft workspace (see Scrollcraft below).
- `main` is production. Application Studio work stays on the `application-studio` branch; its generated `workers/studio/worker-configuration.d.ts` is ignored here.

## Scrollcraft

- The design follows the Scrollcraft skill (`scroll-craft` 0.3.1, upstream `75d81f7`), installed once per machine at `C:\Projects\scrollcraft\scroll-craft` and loaded as a personal skill through the junction `%USERPROFILE%\.claude\skills\scroll-craft`. Invoke it with `/scroll-craft`. Do not also install the `nateherk-design` plugin (it would load a second copy). Maintenance steps are in `C:\Projects\scrollcraft\START-HERE.txt`. Never copy the skill or its engine into this repo; the site uses its process and taste floor with native CSS.
- The brief, grammar, feeling curve, score and signature move are in `docs/SCROLLCRAFT-BRIEF.md`. Its fingerprint is in `C:\Projects\scrollcraft\workspace\FINGERPRINTS.md`; a later redesign must clear the gate against it.
- Verify with the skill's tools from `C:\Projects\scrollcraft\workspace` (set `SCROLLCRAFT_CHROME` to `C:\Program Files\BraveSoftware\Brave-Origin\Application\brave.exe`): `doctor.mjs`, `serve.mjs --root C:\Projects\portfolio\dist`, `shoot.mjs` (desktop, `--width 390 --height 844`, `--reduced-motion`), then `builds\portfolio-editorial\functional.mjs` (functional, keyboard, no-JS, reduced-motion and axe WCAG 2.2 AA checks). These run headless and only when browser testing is requested. kie.ai is not used.
- Chapters carry `data-sc-act` and `Page` adds `html.sc-ready` after mount so the harness can walk the page; keep them.

## Publishing and the live site

- The public site is static: Cloudflare Workers Static Assets serves `./dist` for the `portfolio` Worker. There is no application server.
- Cloudflare's Git integration builds with `pnpm run build:cloudflare` and deploys with `pnpm dlx wrangler@4.144.0 deploy` whenever `main` changes, so any push or merge to `main` is a production release. Feature branches, including `application-studio`, are never production.
- Release flow (only on an explicit request): work on a branch, run `pnpm verify` and the deploy dry run, open a pull request into `main`, wait for CI, then merge. Manual fallback: `pnpm deploy:cloudflare` (needs a Cloudflare login).
- Verify without a browser: `curl.exe -sI https://mohamedmoheyeldin.com/` and fetch the changed page or resume file. State plainly when visual verification was not done.

## Release limits

- Do not commit, push, open pull requests, merge to `main`, deploy (Cloudflare or GitHub Pages), or generate release artifacts unless explicitly requested.

## Detailed rules

### Scope

This is the canonical React/Vite portfolio and multi-format resume platform. The `untitledui` branch uses React, free MIT-licensed Untitled UI components, and Tailwind CSS v4. Career content remains schema-validated and shared by the website and resume outputs.

### Working agreements

- `main` is the production portfolio branch. Keep Application Studio planning and implementation on `application-studio`; do not merge or deploy that branch to the production domain without an explicit release request. Its public-demo and private-owner APIs must use separate credentials and enforce owner authorization on the backend. A client mode flag never grants access.

- Use Untitled UI's official website and upstream source directly for design decisions and component documentation. The user explicitly excluded Context7 and other design sources for this project. Keep the presentation restrained: no custom mock browser illustrations, code artwork, tilted cards, floating notes, or monogram artwork. Use pnpm exclusively for package operations.

- Keep `@types/node` on Node 24 to match the runtime. TypeScript 6 follows the official Untitled UI Vite starter.
- Work natively from `C:\Projects\portfolio`; do not introduce WSL, Docker, a local AI model, or a .NET SDK unless explicitly requested.
- Keep package scripts cross-platform so they run from Windows PowerShell as well as CI's Linux shell.
- Run `pnpm verify` after changes. It covers TypeScript checks, production builds, and GitHub Pages subpath packaging. Browser test dependencies and directories stay out of this repo at the user's request; do not add browser test runners to `package.json`. The headless browser suite lives in the Scrollcraft workspace. Career content and resume downloads also omit the removed testing platform at the user's request.
- Do not launch, navigate, reopen, or foreground any browser window or tab unless the user explicitly requests it. This overrides automatic browser-review guidance for this project. Do not invoke Chrome DevTools merely to inspect pages: its configured connection launches a separate Brave Origin automation profile and can show empty windows. Use build checks and HTTP checks by default, provide the local URL as a link, and state when visual checks were not run. If browser interaction is requested, use the browser/profile the user specifies through a verified existing-session connection; never substitute an isolated profile silently. Keep Vite server and preview `open: false`; do not pass `--open`.
- Keep career facts canonical and factual. Do not invent employers, responsibilities, dates, outcomes, or metrics.
- Completion credentials use `verifiedCredentials` in the canonical career record (exact name, issuer, ISO issue date, nullable ISO expiration date, nullable public evidence URL). Display the issue year only and omit expiration text from the website's own certification listings and all resume formats; retain exact issue and expiration dates in the canonical record and exact issue dates in website time metadata. Keep private credential URLs and access tokens out of source and builds. All resume formats include verified completion credentials and their public verification links; print formats group credentials with the same issuer and issue year (the only date they show) to preserve readable pagination. Detailed professional-development sections also include the existing historical `credentials` strings. Regenerate all seven resume formats after changing shared career or credential facts or their presentation.
- The Experience title page ends with a compact credential strip before the Projects chapter. Use the exact official Accredible badge/certificate image URLs mapped to canonical public credential links in `src/content/credential-images.json`. Validate these presentation references and intrinsic dimensions with the existing content check. Keep images uncropped with `object-fit: contain`, descriptive alt text, lazy loading and async decoding; retain readable titles, year-only issue captions and verification links without JavaScript. Keep credential titles, issuers, issue years and verification links in Learning. Issuer image artwork may contain its original full issue/expiration details; do not alter the supplied images. Website-only image changes do not require regenerating unchanged resume exports.
- Preserve public/private content boundaries, resume generation, `/portfolio/` portability, accessibility, metadata, and responsive behavior.
- Use shared styles and presentation contracts instead of route-specific duplication. Keep portfolio layout rules in the main components layer of `src/styles/global.css`; reuse its layout variables for section spacing, heading gaps, card padding, and reading width. Keep long narrative text left aligned and short section introductions centered. See `docs/UNTITLED-UI.md` for the current layout conventions.
- The site is set as an editorial feature (October 30, 2026 redesign; see `docs/DESIGN_BRIEF.md` and `docs/ARCHITECTURE.md`). Every page is a `Page` with chapters: a static masthead, a title page, numbered chapters with a large numeral in the margin column, and the colophon (contact as running text plus one "Email me" button, the AI workflow audit offer, and the professional references notice in a disclosure). On screens 1200px and wider a folio in the margin lists the chapters, shows scroll progress, and holds the reading-depth control, the resume menu and "Email me"; below 1200px, with JavaScript, a reading bar at the bottom edge holds the current chapter (opening a contents sheet with chapters, site links, both resumes and "Email me") and the depth control. Without JavaScript the masthead links stay visible and there is no bar.
- The reading-depth control (Skim, Read, Full; default Read) is the site's signature interaction. `html[data-read]` is set before first paint by the inline script in `index.html` and saved in `localStorage`; blocks carry `data-detail="standard"` or `"full"`, and `data-anchor` marks blocks the reader's place sticks to when the depth changes. Without JavaScript every block renders. Never hide content any other way.
- Home: title page (kicker, two-sentence headline, one-line standfirst, actions, imprint of facts from the career record), 1 The work (all six projects; the first three as alternating spreads, the rest as a ruled list; one label schema: result, evidence source, problem, what I did, role, decisions, evidence, built with; Figure 1 on the Claims Document Assistant), 2 How the work is checked (five stages, each linked to a project), 3 Career, 4 Index of tools (each project tool linked to the entries that used it). Home entries link to standalone case studies and carry `id="entry-<slug>"`. The evidence source (User-reported, Public source, Documented responsibility) is derived from the career record, never typed by hand.
- Experience: title page with the credential strip, 1 Projects (numbered project menu beside one detail panel with Overview, Implementation, and Evidence tabs; a scrolling row on narrow screens; `aria-label="Choose a project"`; `#project-<slug>` hashes with history support; direct-route fallbacks), 2 Work history, 3 Approach, 4 Skills (five broad areas over the 16 detailed categories in the same menu and panel layout, all categories rendered with anchors without JavaScript), 5 Learning. Standalone case studies are chapters (problem, what I did, what changed, systems and trade-offs, evidence, tools) with a numbered folio and previous/next links. Keep employer/role/customer context in the panel without a duplicate experience summary; search and category filters remain removed. Keep content and links usable without JavaScript.
- Motion is native CSS only, inside `prefers-reduced-motion: no-preference` and, for scroll-driven parts, `@supports (animation-timeline: view())`. The resting state is the visible state; never start content hidden outside those guards, never animate layout properties, never use `translate: none` in keyframes (WebKit bug). No scroll cues, no section counters beyond real chapter numbers, no em dashes in visible copy.
- Fonts are self-hosted (`src/assets/fonts/`, preloaded in `index.html`) with metric-matched fallback faces in `global.css`. Do not reintroduce the Google Fonts stylesheet; it blocked first paint.
- Blue is the permanent brand color. Map the complete brand scale (50–950) to the upstream blue tokens in `src/styles/theme.css`; keep semantic status colors intact. The only theme choice is light or dark: a masthead toggle flips the upstream `.dark-mode` tokens, saves the choice in `localStorage`, and an inline script in `index.html` applies it (or the system preference) before first paint. There is no palette picker. Use semantic theme tokens or the `--pf-*` aliases rather than raw `--color-brand-*` values so both themes stay readable; the aliases are the one place raw brand values are mapped (light is the paper edition, dark the night edition).
- Personal branding uses the linked name Mohamed Moheyeldin only. Keep the favicon blank and omit graphic app icons and branded social images. Identify employers and customers with text; do not include company logo assets. Describe employer/client work through personal contributions rather than claims of intellectual property ownership. The public project label is Data Generator & File Processing; retain its existing ccrs-test-data-tooling slug for link compatibility.
- Keep Untitled UI source attribution in `UNTITLED-UI-LICENSE` and `docs/UNTITLED-UI.md`. Preserve strict TypeScript checks when adapting upstream components.
- Use imported Untitled UI components for controls, navigation, disclosures, badges, featured icons, and empty states. Compose portfolio layouts from these primitives and the upstream theme tokens. Keep custom layout CSS in the components layer so it cannot override the components' Tailwind utility styles. Document source adaptations and remaining custom artwork; do not imply custom layouts are upstream templates.
- `pnpm verify` finishes with a subpath build. Run `pnpm build:cloudflare` again before production preview or deployment.

- Keep downloadable resumes at the user-preferred rounded “11 years of experience” wording for the current experience snapshot. The user removed the live experience clock; keep the header focused on personal branding and navigation. Do not add a ticking counter to the website, PDF, Word, or career documents.

### Documentation and tools

- `/experience/` is the consolidated Experience page: projects, employment context, approach, skills, and education. `/about/` redirects to `/experience/`, preserving query and fragment in JavaScript, with a static fallback. Exclude the legacy route from the sitemap. There is no Resume page: the masthead, title-page and folio "Resume" buttons and the colophon's PDF and Word links open an Untitled UI dropdown to choose the one-page or full (detailed) resume; without JavaScript they link straight to the detailed file. `/resume/` is a legacy redirect to the detailed PDF that stays out of the sitemap. Employment and project context belongs on Experience.

- Start with `README.md`, `docs/DEVELOPMENT.md`, and `docs/TESTING.md`.
- `docs/ARCHITECTURE.md` and `docs/CONTENT_PROVENANCE.md` define the key content boundaries.

- Keep `components.json` aliases aligned with TypeScript and Vite. Use upstream typography, color, and shadow tokens for portfolio styles; avoid a parallel token system or custom control styles.

- Do not add migration caches, obsolete deployment adapters, empty legacy directories, or unused modules. TypeScript checks reject unused locals and parameters. Keep generated build output and installed dependencies ignored.

- Resume generation: `pnpm resume:generate` uses Python with `scripts/requirements-resume.txt`, installed Tailwind tokens, and `assets/fonts`. Keep PDF/DOCX colors derived from the website theme. Visually verify output; do not imply native documents execute React components.

- Position the profile around customer-facing engineering and FDE-relevant contributions. Do not use transitioning or moving-into language in public copy or resumes. The user's October 2, 2026 correction sets the Booz Allen title to Forward Deployed Engineer (FDE) across website and resumes, superseding the earlier QA Test Engineer presentation. Preserve other employment titles, all dates, and documented customer contributions. Total experience begins September 2015: 11 years as of September 2026, not 11 years of FDE tenure. Keep experienceYears/experienceAsOf and resume summary counts aligned; content validation checks the dated calculation.

- Case-study edits must preserve audience, personal contribution, systems, decisions, and evidence boundaries. Do not describe the static portfolio as an API-backed application. Regenerate PDF, DOCX, Markdown, and job-board text together after career changes.

Legacy `/work/` and `/work/<project>/` URLs redirect to the corresponding `/experience/` URLs, preserving query and fragment. `/about/` redirects to `/experience/`. Only canonical Experience routes appear in navigation and the sitemap.
