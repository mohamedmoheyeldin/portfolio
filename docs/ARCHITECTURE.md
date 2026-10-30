# Portfolio platform architecture

## Purpose

One personal-brand system with three presentation channels:

1. a semantic, statically rendered website;
2. a searchable PDF resume produced with ReportLab;
3. an editable Word resume produced by a dedicated DOCX renderer.

All channels consume the same schema-validated career record (`src/content/career.json`). They may select, order and format facts for their medium, but never keep separate copies of career history.

## Rendering: React at build time, no framework in the browser

```mermaid
flowchart TB
  subgraph build["Build (scripts/build.mjs)"]
    App["App.tsx<br/>routes + titles + descriptions"] --> Pages["site/home · experience · case-study"]
    Pages --> Layout["site/layout.tsx<br/>Header · Close · Footer"]
    Pages --> UI["site/ui.tsx<br/>icons · ResumeMenu · EvidenceTag · Pipeline"]
    Pages --> Flows["content/flows.ts"]
    Pages --> Checks["lib/selftest.ts (names)"]
    App --> SSR["renderToString"] --> HTML["dist/**/index.html<br/>+ metadata, JSON-LD, sitemap, redirects"]
  end
  subgraph browser["Browser"]
    Main["main.tsx"] --> Enhance["client/enhance.ts"]
    Enhance --> Run["lib/selftest.ts (runs)"]
  end
  HTML --> browser
```

- `scripts/build.mjs` runs the Vite client build, then loads `src/entry-server.tsx` through Vite's SSR loader and writes every route, `404.html`, the sitemap, `robots.txt` and the legacy redirects. Each page carries its title, description, canonical, Open Graph tags and, on home, `ProfilePage` JSON-LD.
- `src/main.tsx` imports the stylesheet and `client/enhance.ts`. In development only (there is no prerender step under `pnpm dev`) it first renders `App` with React; that branch sits behind `import.meta.env.DEV`, so production bundles contain no React. Production JavaScript is about 15 KB (about 6 KB gzipped).
- `client/enhance.ts` adds: the theme toggle (system by default, a saved choice overrides, `theme-color` follows, View Transitions crossfade when motion is allowed); copy-address buttons; the current section marked in the header; closing menus after a jump and placing them under their button where CSS anchor positioning is missing; a plain-link fallback where the popover API is missing; the hero schematic picker; Core Web Vitals observers; the self-test runner; and `html.sc-ready` for the Scrollcraft harness.
- Without JavaScript every page is complete: content, links, the resume and phone menus (native `popover`), `<details>` disclosures and the contact links all work. JS-only controls (`.js-only`: theme toggle, copy buttons, the self-test button) are hidden; every part of the hero schematic is listed with its text; the self-test states that it needs JavaScript.
- The theme is applied before first paint by an inline script in `index.html` (`html.dark-mode`, saved in `localStorage` as `theme`).

## The schematic (signature move)

`Schematic` in `ui.tsx` draws the six documented parts of VA Claims Workflows (the three steps and three "alongside" entries in `flows.ts`) as two inline SVGs from one geometry table: a wide layout beside the hero copy and a tall one below 560px. Each part is a `g.sn[data-node]`; the paths carry a second, `pathLength="100"` copy (`.sn-signal`) that is invisible at rest. The SVGs are `aria-hidden`; the ordered list under them carries every part as a button and its text, so the content is complete without JavaScript. `initSchematic` in `enhance.ts` turns the list into a disclosure picker: one button `aria-expanded`, the other texts `hidden`, and the matching `.sn` groups get `.is-on` in both layouts; click, keyboard focus and `pointerenter` on a part of the diagram all select. Where motion is welcome it advances every 2.6s for two rounds (in time with the CSS signal, which runs twelve times) and stops for good on the first interaction.

## Work tiles and the career bar

`Work` in `home.tsx` renders the six projects as tiles on a CSS grid (six columns on wide screens: 4 + 2, then pairs). `TileFigure` draws one HTML figure per project from its documented metric label or flow (the source is commented per case); figures are `aria-hidden` because the result text carries the facts. `Career` computes each role's share of the months since the first role started (to `experienceAsOf`) at build time and writes it as SVG `x` and `width` percentages, so the bar is to scale with no inline style.

## The page self-test

Shown on the Portfolio & Career Content System case study (`#selftest`) and linked from every footer. `src/lib/selftest.ts` exports 16 checks, each `{ id, name, run }`. The server render lists their names; `enhance.ts` runs them in order when the visitor presses "Run the checks", writing the result and measured value into each row and a summary into a `role="status"` line. Every check reads the live page: heading order, image alt text, accessible names of links and buttons, duplicate ids, in-page link targets, HTTPS on external links, `HEAD` requests to the four resume files, WCAG contrast of every ink token on every ground token in the current theme, horizontal overflow, 24 px target size, a walk of the stylesheets confirming every animation sits inside `prefers-reduced-motion: no-preference` (and, with reduced motion on, that none run), the theme against the saved or system choice, language/title/description/canonical, transferred bytes from Resource Timing, layout shift and LCP from `PerformanceObserver`. Checks a browser cannot measure (LCP and CLS outside Chromium) report "not measurable here" rather than passing.

## Project storytelling

Work projects reference an experience ID; case studies show employer, role, dates and end customer. The three featured projects carry a pipeline diagram from `src/content/flows.ts` on their case study (VA Claims Workflows also drives the hero schematic): numbered stations on one rail plus what runs alongside, each restating a documented `approach` or `systems` entry (the source index is commented beside each step) and captioned as a diagram of the documented design. The evidence label on every result (User-reported, Public source, Documented responsibility) is derived from the record by `evidenceSource()`, never typed.

## Design system

`src/styles/site.css`, in cascade layers `tokens, base, layout, components, pages, motion`:

- **Tokens.** Grounds (`--paper` for the page, `--grid` for tinted bands, `--surface` for tiles and cards, `--surface-2` for panels inside them), ink (`--ink`, `--ink-2`, `--ink-3`), lines (`--line`, `--line-strong`), one teal accent in two lightnesses (`--accent` with hover, ink, soft and line), meaning colours (`--pass`, `--fail` and their soft grounds, for self-test results only), three elevations and an edge light, the top bar background, `--dot` for diagram grounds, `--glow` for the hero light, `--band` for the closing band, type scale with `clamp()`, a 4px space scale, `--bar-h` for the top bar, radii and easing. All colours are hex so print tooling and the self-test read them directly. `:root.dark-mode` redefines them; dark also sets type slightly heavier and looser.
- **Layout.** `.wrap` (82rem plus gutters), `.section` and `.section--tint` bands, `.section-head` (with a two-column `--split` variant), and per-component grids that collapse to one column on phones.
- **Components and pages.** Buttons (`.btn`, primary, quiet, icon, small, large), popover menus, the top bar with its reading line, status pill, results and evidence tags, the pipeline, bullets and steps, copy and route lists; then the hero and its results row, the schematic and picker, the work grid and its figures, the career bar, capabilities and toolkit, the closing band (which rescopes the tokens for light type on teal) and audit offer, the Experience timeline, footer, page heads with a table of contents or fact sheet, case-study parts, project table, credential grid, pager and self-test panel.
- **Motion.** Native CSS in the `motion` layer, entirely inside `prefers-reduced-motion: no-preference`; scroll-driven parts also inside `@supports (animation-timeline: view())`. The resting state is the visible state. See the design brief.

## Document pipeline

`career.json` → `scripts/generate-resumes.py` → PDF / DOCX / Markdown / job-board text in `public/resume/`.

The generator reads the light-theme `--ink`, `--ink-3` and `--accent` hex tokens from `src/styles/site.css` for print colour, with Inter from `assets/fonts` and print-specific sizes. There is no Resume page: resume buttons open a popover with the one-page and full resume in PDF and Word, the close lists all four files as links, and `/resume/` redirects to the detailed PDF for older links.

## Routes

`/`, `/experience/`, `/experience/<slug>/` for six projects, and `404.html`. Legacy `/work/`, `/work/<slug>/` and `/about/` redirect to the matching `/experience/` URL, preserving query and fragment, with a no-JavaScript refresh. `/resume/` redirects to the detailed PDF. Only canonical routes appear in the sitemap. The GitHub Pages build (`--pages`) uses the `/portfolio/` base and is checked by `scripts/check-pages-build.mjs`.

## Credentials

`src/content/credential-images.json` maps public verification links to issuer badge images (validated for path and intrinsic size). Experience shows them grouped by issuer, uncropped (`object-fit: contain`), lazy-loaded with alt text, with year-only issue dates and verification links. Expiration dates stay in the record and are omitted from the site and resumes.
