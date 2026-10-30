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
- `client/enhance.ts` adds: the theme toggle (system by default, a saved choice overrides, `theme-color` follows, View Transitions crossfade when motion is allowed); copy-address buttons; the current section marked in the header; closing menus after a jump and placing them under their button where CSS anchor positioning is missing; a plain-link fallback where the popover API is missing; the case deck guard; Core Web Vitals observers; the self-test runner; and `html.sc-ready` for the Scrollcraft harness.
- Without JavaScript every page is complete: content, links, the resume and phone menus (native `popover`), `<details>` disclosures and the contact links all work. JS-only controls (`.js-only`: theme toggle, copy buttons, the self-test button) are hidden; the case sheets follow one another without stacking; the self-test states that it needs JavaScript.
- The theme is applied before first paint by an inline script in `index.html` (`html.dark-mode`, saved in `localStorage` as `theme`).

## The case deck (signature move)

`Deck` and `Sheet` in `home.tsx` render the three featured projects as `article` sheets inside `[data-deck]`, each preceded by an empty in-flow anchor (`#entry-<slug>`) and each with a folder tab linking to that anchor. CSS places each tab at its own third of the row. Inside `@media (min-width: 900px) and (min-height: 700px)` and only with `html.js`, the sheets become `position: sticky` at `--stick`, every sheet body takes the same height (the screen below the header and tab), and the tab row is transparent, so each earlier tab stays visible above the current sheet. The pauses between sheets are margins on the anchors and the hold at the end is a spacer (`.deck-hold`): a sticky element only stays stuck inside its container's content box, so margins or padding on the sheets would push earlier sheets off. Pointer events pass through the sheets except for their tabs and bodies, so stuck earlier tabs stay clickable. `initDeck` in `enhance.ts` reads `--stacking` and adds `.is-flow` when any sheet body's content is taller than its box (measured again after fonts load and on resize), so a sheet is never clipped. Phones, short screens and pages without JavaScript lay the sheets out one after another.

## The page self-test

Shown on the Portfolio & Career Content System case study (`#selftest`) and linked from every footer. `src/lib/selftest.ts` exports 16 checks, each `{ id, name, run }`. The server render lists their names; `enhance.ts` runs them in order when the visitor presses "Run the checks", writing the result and measured value into each row and a summary into a `role="status"` line. Every check reads the live page: heading order, image alt text, accessible names of links and buttons, duplicate ids, in-page link targets, HTTPS on external links, `HEAD` requests to the four resume files, WCAG contrast of every ink token on every ground token in the current theme, horizontal overflow, 24 px target size, a walk of the stylesheets confirming every animation sits inside `prefers-reduced-motion: no-preference` (and, with reduced motion on, that none run), the theme against the saved or system choice, language/title/description/canonical, transferred bytes from Resource Timing, layout shift and LCP from `PerformanceObserver`. Checks a browser cannot measure (LCP and CLS outside Chromium) report "not measurable here" rather than passing.

## Project storytelling

Work projects reference an experience ID; case studies show employer, role, dates and end customer. The three featured projects carry a pipeline diagram from `src/content/flows.ts` (on their case sheet and case study): numbered stations on one rail plus what runs alongside, each restating a documented `approach` or `systems` entry (the source index is commented beside each step) and captioned as a diagram of the documented design. The evidence label on every result (User-reported, Public source, Documented responsibility) is derived from the record by `evidenceSource()`, never typed.

## Design system

`src/styles/site.css`, in cascade layers `tokens, base, layout, components, pages, motion`:

- **Tokens.** Grounds (`--paper` for the page, `--grid` for tinted bands, `--surface` for sheets, `--surface-2` for panels inside them), ink (`--ink`, `--ink-2`, `--ink-3`), lines (`--line`, `--line-strong`), one teal accent in two lightnesses (`--accent` with hover, ink, soft and line), meaning colours (`--pass`, `--fail` and their soft grounds, for self-test results only), three elevations (the third casts upward for stacked sheets) and an edge light, the island background, type scale with `clamp()`, a 4px space scale, `--stick` and `--tab-h` for the deck, radii and easing. All colours are hex so print tooling and the self-test read them directly. `:root.dark-mode` redefines them; dark also sets type slightly heavier and looser.
- **Layout.** `.wrap` (80rem plus gutters), `.section` and `.section--tint` bands, `.section-head` (with a two-column `--split` variant), and per-component grids that collapse to one column on phones.
- **Components and pages.** Buttons (`.btn`, primary, quiet, icon, small, large), popover menus, the floating island, status pill, results and evidence tags, the pipeline, bullets and steps, copy and route lists; then the cover and its case tabs, the case deck and sheets, supporting rows, the career timeline, capabilities and toolkit, the closing sheet and audit offer, footer, page heads with a table of contents or fact sheet, case-study parts, project table, credential grid, pager and self-test panel.
- **Motion.** Native CSS in the `motion` layer, entirely inside `prefers-reduced-motion: no-preference`; scroll-driven parts also inside `@supports (animation-timeline: view())`. The resting state is the visible state. See the design brief.

## Document pipeline

`career.json` → `scripts/generate-resumes.py` → PDF / DOCX / Markdown / job-board text in `public/resume/`.

The generator reads the light-theme `--ink`, `--ink-3` and `--accent` hex tokens from `src/styles/site.css` for print colour, with Inter from `assets/fonts` and print-specific sizes. There is no Resume page: resume buttons open a popover with the one-page and full resume in PDF and Word, the close lists all four files as links, and `/resume/` redirects to the detailed PDF for older links.

## Routes

`/`, `/experience/`, `/experience/<slug>/` for six projects, and `404.html`. Legacy `/work/`, `/work/<slug>/` and `/about/` redirect to the matching `/experience/` URL, preserving query and fragment, with a no-JavaScript refresh. `/resume/` redirects to the detailed PDF. Only canonical routes appear in the sitemap. The GitHub Pages build (`--pages`) uses the `/portfolio/` base and is checked by `scripts/check-pages-build.mjs`.

## Credentials

`src/content/credential-images.json` maps public verification links to issuer badge images (validated for path and intrinsic size). Experience shows them grouped by issuer, uncropped (`object-fit: contain`), lazy-loaded with alt text, with year-only issue dates and verification links. Expiration dates stay in the record and are omitted from the site and resumes.
