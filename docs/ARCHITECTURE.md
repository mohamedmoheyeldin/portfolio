# Portfolio platform architecture

## Purpose

This repository is one personal-brand system with three presentation channels:

1. a semantic, prerendered React website;
2. a searchable PDF resume produced with ReportLab;
3. an editable Word resume produced by a dedicated DOCX renderer.

All channels must consume the same schema-validated career record. They can select, order, and format facts for their medium, but cannot maintain separate copies of career history.

## Baseline boundaries

- Vite 8.x, React 19, strict TypeScript, semantic HTML, and Tailwind CSS v4.
- Static output for Cloudflare Workers Static Assets and the custom domain.
- Free Untitled UI React components supply buttons and links, navigation items and disclosure triggers, button groups, badges, text inputs, featured icons, empty states, tooltip support, icons, and theme tokens. Components render to static HTML through React server rendering at build time. The application hydrates after static HTML loads; search and category filters use React state. See `UNTITLED-UI.md` for the component inventory and source adaptations.
- `src/components/Portfolio.tsx` shares page composition. Routes retain static content collection reads, route generation, and page metadata. There is no client router or application server.
- Automated validation covers TypeScript diagnostics, content schemas, production builds, and subpath packaging. UI workflows and accessibility are reviewed with an available browser tool; no browser test framework is installed.
- The standalone Python resume generator reads the same career JSON and renders PDF and DOCX downloads.

## Project storytelling

Career-derived projects are stored beside the canonical career record and rendered through static detail routes. Their challenge, approach, outcome, toolkit, and disclosure fields are schema-validated. The project layer may reorganize documented responsibilities into a clearer narrative, but it cannot invent metrics or expose client-sensitive details.

Independently shareable case-study routes own their page-specific title and description and intentionally omit the site-wide social image when no project-specific primary image exists.

## Design flexibility

The web presentation uses Untitled UI's light theme, blue accents, Inter loaded as in the official Untitled UI Vite starter, and simple sections composed from upstream components. Layout styles live in `src/styles/global.css`; upstream semantic tokens live in `src/styles/theme.css`. PDF and DOCX generation resolves the light-theme text and brand colors from these same tokens, with Inter and print-specific type sizes.

## Document pipeline

`career.json` → `scripts/generate-resumes.py` → PDF / DOCX downloads

The repository publishes one-page and detailed PDF/DOCX artifacts from the canonical content source through the dedicated resume generator. Web, PDF, and Word may format and select facts differently, but career history remains owned by the shared record.
