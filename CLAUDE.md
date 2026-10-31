# Portfolio — mohamedmoheyeldin.com

React 19 + Vite 8 portfolio and multi-format resume platform (React renders every page at build time; a custom token stylesheet; one small enhancement script in the browser), prerendered to static HTML and deployed to Cloudflare at https://mohamedmoheyeldin.com/. Shared defaults: the global `~/.claude/CLAUDE.md`. The detailed project rules are at the end of this file; where they are more specific, they take priority over this summary.

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
- `src/components/site/` — the pages (`home.tsx`, `experience.tsx`, `case-study.tsx`), the frame (`layout.tsx`: the top bar, the closing act with contact routes and audit offer, footer), primitives (`ui.tsx`: icons, resume popover, labels, tags, `EvidenceTag`, `Schematic`, `Thread`, `Pipeline`) and helpers (`shared.tsx`); `src/components/Portfolio.tsx` re-exports them and owns the 404 page
- `src/entry-server.tsx` + `scripts/build.mjs` — static prerendering of every route and legacy redirect
- `src/styles/site.css` — the whole design system: hex tokens for both themes, self-hosted font faces, layout, components and motion, in cascade layers; `src/client/enhance.ts` — the only script the site ships; `src/lib/selftest.ts` — the page self-test checks; `src/content/flows.ts` — the three project pipelines (the first also drives the hero schematic)
- `src/assets/fonts/` — self-hosted Instrument Sans (variable weight and width; text and display) and Geist Mono (labels and values) Latin subsets (OFL)
- `public/resume/` — generated resume outputs; `docs/` — architecture, provenance, Cloudflare, design brief, Scrollcraft brief
- `wrangler.jsonc` — Cloudflare Worker `portfolio` (static assets from `./dist`, custom domain)

## Code map and notes

- Graphify map: if `graphify-out/` exists, read `graphify-out/GRAPH_REPORT.md` or run `graphify query "..."` / `graphify affected "..."` before multi-file changes, then open the real files before editing. Git hooks rebuild it on every commit. Never commit `graphify-out/`.
- Keep `README.md` and the matching `docs/` file current in the same change, and update the Obsidian project notes (decisions, todo) after meaningful work, as the global instructions describe.

## Boundaries

- Do not open browser windows or tabs, or use Chrome DevTools, unless explicitly asked. Verify with builds and HTTP checks and say when visual checks were not run.
- Career facts are canonical: never invent employers, titles, dates, metrics, or outcomes. Regenerate every resume format together after career changes.
- Do not add browser test runners to this repo's dependencies, or WSL, Docker, or local AI models. Browser checks live in the Scrollcraft workspace (see Scrollcraft below).
- `main` is production. Application Studio work stays on the `application-studio` branch; its generated `workers/studio/worker-configuration.d.ts` is ignored here.

## Scrollcraft

- The design follows the Scrollcraft skill (`scroll-craft` 0.3.1, upstream `75d81f7`), installed once per machine at `C:\Projects\scrollcraft\scroll-craft` and loaded as a personal skill through the junction `%USERPROFILE%\.claude\skills\scroll-craft`. Invoke it with `/scroll-craft`. Do not also install the `nateherk-design` plugin (it would load a second copy). Maintenance steps are in `C:\Projects\scrollcraft\START-HERE.txt`. Never copy the skill or its engine into this repo; the site uses its process and taste floor with native CSS.
- The brief, grammar, feeling curve, score and signature move are in `docs/SCROLLCRAFT-BRIEF.md`. Its fingerprint is in `C:\Projects\scrollcraft\workspace\FINGERPRINTS.md`; a later redesign must clear the gate against it.
- Verify with the skill's tools from `C:\Projects\scrollcraft\workspace` (set `SCROLLCRAFT_CHROME` to `C:\Program Files\BraveSoftware\Brave-Origin\Application\brave.exe`; build with `pnpm build` first, since `pnpm verify` ends on the `/portfolio/` subpath build): `doctor.mjs`, `serve.mjs --root C:\Projects\portfolio\dist`, `shoot.mjs` (desktop, `--width 390 --height 844`, `--reduced-motion`), then `builds\portfolio-thread\functional.mjs` (navigation, theme, resumes, contact, work, the schematic picker and its fallbacks, the self-test at four widths in both themes and against planted defects, keyboard, phone, no-JS, reduced motion, an overflow and layout-shift sweep at 375 to 1920px, credentials, axe WCAG 2.2 AA; run it from PowerShell, since Git Bash rewrites `/` path arguments), `snap.mjs` (full-page and first-screen shots, both themes, desktop and phone) and `sections.mjs` (single sections). These run headless and only when browser testing is requested. kie.ai is not used.
- Sections carry `data-sc-act` and `enhance.ts` adds `html.sc-ready` once it has run so the harness can walk the page; keep them.

## Publishing and the live site

- The public site is static: Cloudflare Workers Static Assets serves `./dist` for the `portfolio` Worker. There is no application server.
- Cloudflare's Git integration builds with `pnpm run build:cloudflare` and deploys with `pnpm dlx wrangler@4.144.0 deploy` whenever `main` changes, so any push or merge to `main` is a production release. Feature branches, including `application-studio`, are never production.
- Release flow (only on an explicit request): work on a branch, run `pnpm verify` and the deploy dry run, open a pull request into `main`, wait for CI, then merge. Manual fallback: `pnpm deploy:cloudflare` (needs a Cloudflare login).
- Verify without a browser: `curl.exe -sI https://mohamedmoheyeldin.com/` and fetch the changed page or resume file. State plainly when visual verification was not done.

## Release limits

- Do not commit, push, open pull requests, merge to `main`, deploy (Cloudflare or GitHub Pages), or generate release artifacts unless explicitly requested.

## Detailed rules

### Scope

This is the canonical React/Vite portfolio and multi-format resume platform. React renders every route to static HTML at build time; production ships no framework, only `src/client/enhance.ts`. Career content remains schema-validated and shared by the website and resume outputs.

### Working agreements

- `main` is the production portfolio branch. Keep Application Studio planning and implementation on `application-studio`; do not merge or deploy that branch to the production domain without an explicit release request. Its public-demo and private-owner APIs must use separate credentials and enforce owner authorization on the backend. A client mode flag never grants access.

- Bold visual moves are welcome: confident layout, poster-scale type, dark and colored sections, and a striking signature section. Keep it honest: no fake product screenshots or mock UIs presented as real work, and diagrams restate documented fields and say so. Use pnpm exclusively for package operations. Untitled UI, React Aria and Tailwind were removed in the October 30, 2026 split redesign at the user's request for a complete reinvention; do not reintroduce a component library without a clear reason.

- Keep `@types/node` on Node 24 to match the runtime.
- Work natively from `C:\Projects\portfolio`; do not introduce WSL, Docker, a local AI model, or a .NET SDK unless explicitly requested.
- Keep package scripts cross-platform so they run from Windows PowerShell as well as CI's Linux shell.
- Run `pnpm verify` after changes. It covers TypeScript checks, production builds, and GitHub Pages subpath packaging. Browser test dependencies and directories stay out of this repo at the user's request; do not add browser test runners to `package.json`. The headless browser suite lives in the Scrollcraft workspace. Career content and resume downloads also omit the removed testing platform at the user's request.
- Do not launch, navigate, reopen, or foreground any browser window or tab unless the user explicitly requests it. This overrides automatic browser-review guidance for this project. Do not invoke Chrome DevTools merely to inspect pages: its configured connection launches a separate Brave Origin automation profile and can show empty windows. Use build checks and HTTP checks by default, provide the local URL as a link, and state when visual checks were not run. If browser interaction is requested, use the browser/profile the user specifies through a verified existing-session connection; never substitute an isolated profile silently. Keep Vite server and preview `open: false`; do not pass `--open`.
- Keep career facts canonical and factual. Do not invent employers, responsibilities, dates, outcomes, or metrics.
- Completion credentials use `verifiedCredentials` in the canonical career record (exact name, issuer, ISO issue date, nullable ISO expiration date, nullable public evidence URL). Display the issue year only and omit expiration text from the website's own certification listings and all resume formats; retain exact issue and expiration dates in the canonical record and exact issue dates in website time metadata. Keep private credential URLs and access tokens out of source and builds. All resume formats include verified completion credentials and their public verification links; print formats group credentials with the same issuer and issue year (the only date they show) to preserve readable pagination. Detailed professional-development sections also include the existing historical `credentials` strings. Regenerate all seven resume formats after changing shared career or credential facts or their presentation.
- Experience shows credentials in `#learning`, grouped by issuer, each with its badge image. Use the exact official Accredible badge/certificate image URLs mapped to canonical public credential links in `src/content/credential-images.json`. Validate these presentation references and intrinsic dimensions with the existing content check. Keep images uncropped with `object-fit: contain`, descriptive alt text, lazy loading and async decoding; retain readable titles, year-only issue captions and verification links without JavaScript. Keep credential titles, issuers, issue years and verification links in Learning. Issuer image artwork may contain its original full issue/expiration details; do not alter the supplied images. Website-only image changes do not require regenerating unchanged resume exports.
- Preserve public/private content boundaries, resume generation, `/portfolio/` portability, accessibility, metadata, and responsive behavior.
- Use shared styles and presentation contracts instead of route-specific duplication. Keep all styling in `src/styles/site.css` and use its tokens; no inline styles. Keep all text left aligned. Compose sections from `.section` / `.wrap` / `.section-head` and the existing components.
- The site is the thread (October 30, 2026 redesign on the `newAI` branch, ninth Scrollcraft build, after the user asked for the bold poster look of dakshgajjar.com; see `docs/DESIGN_BRIEF.md`, `docs/SCROLLCRAFT-BRIEF.md` and `docs/ARCHITECTURE.md`). The page is a run of full-bleed acts (`.act--dark` near-black, `.act--light` bone; each sets its own tokens; in the dark theme the bone acts are dimmed, not turned dark, so the alternation holds) with headlines in capitals at poster scale. On the home page one coral string (`initString` in `enhance.ts`) is drawn down the whole page in page coordinates as it scrolls, with a ring on its tip: it loops through the hero claim, runs down the right margin, wraps each `data-string-wrap` heading block in a rounded rectangle, swings through each scene word, and arrives at the close as a knot that pulls into a check mark. Without JavaScript the per-act `Thread` segments in the markup stand in (joined at x = 82). Every load of the home page with motion welcome opens on the intro: the signature (`src/content/signature.ts`, Hershey Script restyled into a fast hand) writes itself with a ring on the pen tip, then lifts away; it never takes pointer events, any key, click or scroll skips it, and it plays on every load, like the reference (`html.intro-play`, set by the inline script). Every page renders inside `Page`: a dark top bar (name and role; Work, Experience, Contact in mono capitals; theme; Email me; a scroll reading line; below 860px a popover menu with the links, all four resume files and Email me), the page, the close (`#contact`: the last dark act, where the string's knot pulls into a check mark: the question at poster scale, the address in mono with a copy button, Email me, the resume popover, LinkedIn, GitHub, all four resume files and the AI workflow audit offer), and the footer (Test this page, how the site is built, the professional references notice in a disclosure). Without JavaScript the header is static, popovers still open (native popover API) and JS-only controls are hidden.
- The signatures are the intro signature, the string with its knot and check, and the schematic act. The schematic (`Schematic` in `ui.tsx`, the schematic rules in `site.css`, `initSchematic` in `enhance.ts`): the six documented parts of VA Claims Workflows from `flows.ts` drawn as two decorative SVG layouts (wide, and tall below 560px) above a list that carries every part as text; with JavaScript the list is a disclosure picker (one part expanded and lit at a time; click, keyboard focus or pointing at the diagram picks), and where motion is welcome the diagram assembles as it scrolls in, pulses run along the paths with the scroll, a timed signal runs, and once the diagram is in view the picker steps through the parts twice (a progress line fills under the current tab), then stops, and stops for good on the first interaction. Keep every part readable without JavaScript and keep the caption saying it is a diagram of the documented design. Each project is a scene: a descriptive word fitted to the width by its length (`data-len`; a label, not a product name) with paper cards over it that restate the documented metric (comment the source per card) and stay `aria-hidden`. Pipelines restate documented fields from `src/content/flows.ts` (comment the source per station); never add a station the record does not support.
- The page self-test (`src/lib/selftest.ts`, run by `enhance.ts`) lives on the Portfolio & Career Content System case study (`#selftest`), linked from every footer. Every check must measure the live page; never add a check that is precomputed or always passes. Keep it passing at every width and in both themes (the browser suite asserts this).
- Home: hero (dark: open-to-roles status; the `h1` with the name for screen readers and the claim at poster scale; name, role and experience line; Email me, resume popover, LinkedIn and GitHub), the statement (light), the system act (dark: the schematic), Work (`#work`: a heading act, then six scenes alternating dark and light, each with period, name, description, the scene word and papers, the result, evidence, source and case study link), Career (`#career`, dark: every role on a bar drawn to scale from the record, computed at build time as SVG percentages, then each role with compact highlights), What I bring (`#approach`, light: six capabilities restating documented highlights in two groups either side of an arc with a node level with each, stacked below 1100px; tools by group, credential and education line). Scenes carry `id="entry-<slug>"`. The evidence source is derived from the career record, never typed by hand.
- Experience: page head with Email me, the resume popover and an on-page table of contents; Roles (every highlight, on the timeline); Projects (a table in `nav aria-label="Project case studies"` linking all six case studies with role and evidence); Skills (competencies and skill groups); `#learning` (credentials grouped by issuer with badge images and verification links, then education). Case studies: page head with back link, facts sheet and source button, then parts with the title in a left column (problem, what I did with the pipeline, what changed with result and evidence, systems and trade-offs, tools and related work, the portfolio walkthrough) and a previous/next pager. Keep content and links usable without JavaScript.
- Motion is native CSS only, inside `prefers-reduced-motion: no-preference` and, for scroll-driven parts, `@supports (animation-timeline: view())`. The resting state is the visible state; looping motion must end on its own (the status dot pulses three times, the schematic signal runs twelve times; the thread, poster lines, scene words and papers are scroll-driven); state transitions (the picker) also sit inside the motion guard; never start content hidden outside those guards, never animate layout properties, never use `translate: none` in keyframes (WebKit bug), no smooth scrolling (it stops short beside scroll-driven animations). No scroll cues, no section numbers (project numbers 01 to 06 are references), no em dashes in visible copy.
- Fonts are self-hosted (`src/assets/fonts/`, preloaded in `index.html`) with metric-matched fallback faces in `site.css`. Do not reintroduce a Google Fonts stylesheet; it blocked first paint.
- The palette is the Claude palette since October 30, 2026 (the user asked for "Claude App colors" on the thread redesign, replacing teal): near-black `#141413`, warm cream `#f0eee6` and `#faf9f5`, and coral `#d97757` as `--signal` (the string, primary buttons, live dots, the arc). Coral is too light for text on cream, so the text accent `--accent` is clay `#9c4128` on cream (`#843722` on the dimmed acts) and coral on ink; resumes take the light `--accent`. Green and red (`--pass`, `--fail`) are reserved for self-test results. The only theme choice is light or dark: the header toggle flips `html.dark-mode`, updates `theme-color` (`#f0eee6` / `#141413`), saves the choice in `localStorage` (`theme`), and an inline script in `index.html` applies it (or the system preference) before first paint. Both themes are defined as hex tokens in `site.css`; every ink token must clear 4.5:1 on every ground (the self-test measures it). Use tokens, never raw colours.
- Personal branding uses the linked name Mohamed Moheyeldin only. Keep the favicon blank and omit graphic app icons and branded social images. Identify employers and customers with text; do not include company logo assets. Describe employer/client work through personal contributions rather than claims of intellectual property ownership. The public project label is Data Generator & File Processing; retain its existing ccrs-test-data-tooling slug for link compatibility.
- Build controls from native elements: links and buttons with the `.btn` classes, the popover API for menus, `<details>` for disclosures, `nav`, `dl`, `table`, `figure`, `ol` for diagrams. Icons are inline SVG in `ui.tsx`.
- `pnpm verify` finishes with a subpath build. Run `pnpm build:cloudflare` again before production preview or deployment.

- Keep downloadable resumes at the user-preferred rounded “11 years of experience” wording for the current experience snapshot. The user removed the live experience clock; keep the header focused on personal branding and navigation. Do not add a ticking counter to the website, PDF, Word, or career documents.

### Documentation and tools

- `/experience/` is the consolidated Experience page: projects, employment context, approach, skills, and education. `/about/` redirects to `/experience/`, preserving query and fragment in JavaScript, with a static fallback. Exclude the legacy route from the sitemap. There is no Resume page: the "Resume" buttons (hero, Experience head, close) open a native popover listing the one-page and full resume in PDF and Word; it works without JavaScript, and where the popover API is missing the script turns the button into a link to the detailed PDF. The close and the phone menu also list all four files as links. `/resume/` is a legacy redirect to the detailed PDF that stays out of the sitemap. Employment and project context belongs on Experience.

- Start with `README.md`, `docs/DEVELOPMENT.md`, and `docs/TESTING.md`.
- `docs/ARCHITECTURE.md` and `docs/CONTENT_PROVENANCE.md` define the key content boundaries.

- Keep the `@/` alias aligned between `tsconfig.json` and `vite.config.ts`. Avoid a parallel token system or custom one-off control styles.

- Do not add migration caches, obsolete deployment adapters, empty legacy directories, or unused modules. TypeScript checks reject unused locals and parameters. Keep generated build output and installed dependencies ignored.

- Resume generation: `pnpm resume:generate` uses Python with `scripts/requirements-resume.txt`, installed Tailwind tokens, and `assets/fonts`. Keep PDF/DOCX colors derived from the website theme. Visually verify output; do not imply native documents execute React components.

- Position the profile around customer-facing engineering and FDE-relevant contributions. Do not use transitioning or moving-into language in public copy or resumes. The user's October 2, 2026 correction sets the Booz Allen title to Forward Deployed Engineer (FDE) across website and resumes, superseding the earlier QA Test Engineer presentation. Preserve other employment titles, all dates, and documented customer contributions. Total experience begins September 2015: 11 years as of September 2026, not 11 years of FDE tenure. Keep experienceYears/experienceAsOf and resume summary counts aligned; content validation checks the dated calculation.

- Case-study edits must preserve audience, personal contribution, systems, decisions, and evidence boundaries. Do not describe the static portfolio as an API-backed application. Regenerate PDF, DOCX, Markdown, and job-board text together after career changes.

Legacy `/work/` and `/work/<project>/` URLs redirect to the corresponding `/experience/` URLs, preserving query and fragment. `/about/` redirects to `/experience/`. Only canonical Experience routes appear in navigation and the sitemap.
