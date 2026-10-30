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
    Pages --> UI["site/ui.tsx<br/>icons · ResumeMenu · Label · Tags"]
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
- `src/main.tsx` imports the stylesheet and `client/enhance.ts`. In development only (there is no prerender step under `pnpm dev`) it first renders `App` with React; that branch sits behind `import.meta.env.DEV`, so production bundles contain no React. Production JavaScript is about 14 KB (under 6 KB gzipped).
- `client/enhance.ts` adds: the theme toggle (system by default, a saved choice overrides, `theme-color` follows, View Transitions crossfade when motion is allowed); copy-address buttons; the current section marked in the header; closing the phone menu after a jump; a plain-link fallback where the popover API is missing; Core Web Vitals observers; the self-test runner; and `html.sc-ready` for the Scrollcraft harness.
- Without JavaScript every page is complete: content, links, the resume and phone menus (native `popover`), `<details>` disclosures and the contact links all work. JS-only controls (`.js-only`) are hidden; the self-test states that it needs JavaScript.
- The theme is applied before first paint by an inline script in `index.html` (`html.dark-mode`, saved in `localStorage` as `theme`).

## The page self-test (signature move)

`src/lib/selftest.ts` exports 16 checks, each `{ id, name, run }`. The server render lists their names; `enhance.ts` runs them in order when the visitor presses "Run the checks", writing the result and measured value into each row and a summary into a `role="status"` line. Every check reads the live page: heading order, image alt text, accessible names of links and buttons, duplicate ids, in-page link targets, HTTPS on external links, `HEAD` requests to the four resume files, WCAG contrast of every ink token on every ground token in the current theme, horizontal overflow, 24 px target size, a walk of the stylesheets confirming every animation sits inside `prefers-reduced-motion: no-preference` (and, with reduced motion on, that none run), the theme against the saved or system choice, language/title/description/canonical, transferred bytes from Resource Timing, layout shift and LCP from `PerformanceObserver`. Checks a browser cannot measure (LCP and CLS outside Chromium) report "not measurable here" rather than passing.

## Project storytelling

Work projects reference an experience ID; case studies show employer, role, dates and end customer. The three featured projects on home carry a diagram from `src/content/flows.ts`: an ordered list of steps plus side notes, each restating a documented `approach` or `systems` entry (the source index is commented beside each step) and captioned as a diagram of the documented design. The evidence label on every result (User-reported, Public source, Documented responsibility) is derived from the record by `evidenceSource()`, never typed.

## Design system

`src/styles/site.css`, in cascade layers `tokens, base, layout, components, motion`:

- **Tokens.** Grounds (`--paper` People, `--grid` Systems, `--surface`, `--surface-2`), ink (`--ink`, `--ink-2`, `--ink-3`), lines (`--line`, `--line-strong`, `--seam`), one accent hue in two lightnesses (`--accent` with hover, ink, soft and line), status (`--pass`, `--fail`, `--warn`), three elevations and an edge light, type scale with `clamp()`, a 4px space scale, radii and easing. All colours are hex so print tooling and the self-test read them directly. `:root.dark-mode` redefines them; dark also sets type slightly heavier and looser.
- **Layout.** `.split` paints the two grounds meeting at the viewport centre with a 1px seam; `.split-row` places two columns of at most `--half` (42rem) either side. Below 900px each side becomes its own band and the seam turns horizontal.
- **Components.** Buttons (`.btn`, primary, quiet, icon, large), popover menus, the header, hero, self-test panel, project index, project split and compact row, flow diagram, career roles with year marks on the seam, capability lists, the close and its routes, the audit offer, footer, page heads, case-study parts, project table and credential grid.
- **Motion.** Native CSS in the `motion` layer, entirely inside `prefers-reduced-motion: no-preference`; scroll-driven parts also inside `@supports (animation-timeline: view())`. The resting state is the visible state. See the design brief.

## Document pipeline

`career.json` → `scripts/generate-resumes.py` → PDF / DOCX / Markdown / job-board text in `public/resume/`.

The generator reads the light-theme `--ink`, `--ink-3` and `--accent` hex tokens from `src/styles/site.css` for print colour, with Inter from `assets/fonts` and print-specific sizes. There is no Resume page: resume buttons open a popover with the one-page and full resume in PDF and Word, the close lists all four files as links, and `/resume/` redirects to the detailed PDF for older links.

## Routes

`/`, `/experience/`, `/experience/<slug>/` for six projects, and `404.html`. Legacy `/work/`, `/work/<slug>/` and `/about/` redirect to the matching `/experience/` URL, preserving query and fragment, with a no-JavaScript refresh. `/resume/` redirects to the detailed PDF. Only canonical routes appear in the sitemap. The GitHub Pages build (`--pages`) uses the `/portfolio/` base and is checked by `scripts/check-pages-build.mjs`.

## Credentials

`src/content/credential-images.json` maps public verification links to issuer badge images (validated for path and intrinsic size). Experience shows them grouped by issuer, uncropped (`object-fit: contain`), lazy-loaded with alt text, with year-only issue dates and verification links. Expiration dates stay in the record and are omitted from the site and resumes.
