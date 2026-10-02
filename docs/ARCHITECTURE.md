# Portfolio platform architecture

The canonical `/experience/` page combines projects and employment context with professional approach, skills, and education. The former `/about/` page is a compatibility redirect, excluded from the sitemap. Its generated redirect preserves query strings and fragments with JavaScript and includes a no-JavaScript refresh and link. Individual project routes remain available.

## Purpose

This repository is one personal-brand system with three presentation channels:

1. a semantic, prerendered React website;
2. a searchable PDF resume produced with ReportLab;
3. an editable Word resume produced by a dedicated DOCX renderer.

All channels must consume the same schema-validated career record. They can select, order, and format facts for their medium, but cannot maintain separate copies of career history.

## Baseline boundaries

The shared header contains personal branding, primary navigation, and a contact link. The live experience clock was removed at the user’s request; there is no ticking interval or date-duration display in the header.

- Vite 8.x, React 19, strict TypeScript, semantic HTML, and Tailwind CSS v4.
- Static output for Cloudflare Workers Static Assets and the custom domain.
- Free Untitled UI React components supply buttons and links, navigation items and disclosure triggers, badges, featured icons, tooltip support, icons, and theme tokens. Components render to static HTML through React server rendering at build time. The application hydrates after static HTML loads; the Work page uses React state for project and detail-section selection, with hash links and browser history support. See `UNTITLED-UI.md` for the component inventory and source adaptations.
- `src/components/Portfolio.tsx` shares page composition. Routes retain static content collection reads, route generation, and page metadata. There is no client router or application server.
- Automated validation covers TypeScript diagnostics, content schemas, production builds, and subpath packaging. UI workflows and accessibility are reviewed with an available browser tool; no browser test framework is installed.
- The standalone Python resume generator reads the same career JSON and renders PDF and DOCX downloads.

## Project storytelling

Work projects reference a canonical experience ID. Cards and detail pages link to that employer's section in the online resume; experience entries link back to their projects. Independent work has a separate resume section and no employer association. Schema validation rejects missing or invalid work-to-experience references.

Career-derived projects are stored beside the canonical career record and rendered through static detail routes. Their challenge, approach, outcome, toolkit, and disclosure fields are schema-validated. The project layer may reorganize documented responsibilities into a clearer narrative, but it cannot invent metrics or expose client-sensitive details.

Independently shareable case-study routes own their page-specific title and description and intentionally omit the site-wide social image when no project-specific primary image exists.

## Design flexibility

The web presentation uses Untitled UI's light theme, blue accents, Inter loaded as in the official Untitled UI Vite starter, and simple sections composed from upstream components. Layout styles live in `src/styles/global.css`; upstream semantic tokens live in `src/styles/theme.css`. PDF and DOCX generation resolves the light-theme text and brand colors from these same tokens, with Inter and print-specific type sizes.

## Document pipeline

`career.json` → `scripts/generate-resumes.py` → PDF / DOCX downloads

The repository publishes one-page and detailed PDF/DOCX artifacts from the canonical content source through the dedicated resume generator. Web, PDF, and Word may format and select facts differently, but career history remains owned by the shared record.

Case studies also validate audience, systems, decisions, evidence links, and FDE relevance. Evidence distinguishes user-reported career results from public source code. The portfolio walkthrough documents static rendering and explicitly states that no runtime API or database exists.

Resume generation also regenerates concise/detailed Markdown and job-board plain text to keep downloadable formats aligned. Compact highlights select existing facts; the portfolio project uses its canonical resumeSummary.

### Work explorer presentation

The Experience introduction is followed by a five-credential strip before the professional experience heading. Official OpenAI Academy iframe URLs are derived from canonical public verification links. A responsive grid displays five, three, two, or one preview per row; each 4:3 wrapper scales the supplied 800×600 viewport using `ResizeObserver`. The portfolio owns readable titles, year-only issue captions, and verification links outside the frames; the issuer owns the cross-origin contents. The Learning section shows credential titles, issuers, issue years and verification links. Expiration dates are retained as canonical facts but omitted from the portfolio's own listings and all resume formats. Static text and links remain usable before hydration and without JavaScript.

The project selector is a wrapping top menu above one full-width detail panel at every screen size. Embedded case studies show the employer, historical role, dates, and customer once. Three controls group the full content into Overview (problem and results), Implementation (contribution, systems, tools, and walkthrough), and Evidence. Disclosure notes remain visible in all three views. Direct project routes and server-rendered content remain available without JavaScript.

Legacy `/work/` and `/work/<project>/` URLs redirect to the corresponding `/experience/` URLs, preserving query and fragment. `/about/` redirects to `/experience/`. Only canonical Experience routes appear in navigation and the sitemap.
