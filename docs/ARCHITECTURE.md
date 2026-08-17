# Portfolio platform architecture

## Purpose

This repository is one personal-brand system with three presentation channels:

1. a semantic, static Astro website;
2. a searchable PDF resume produced from print-oriented HTML;
3. an editable Word resume produced by a dedicated DOCX renderer.

All channels must consume the same schema-validated career record. They can select, order, and format facts for their medium, but cannot maintain separate copies of career history.

## Baseline boundaries

- Astro 7.x, strictest TypeScript, semantic HTML, native modern CSS.
- Static output for Cloudflare Workers Static Assets and the custom domain.
- No component framework and no runtime client dependency.
- Playwright owns primary journeys, responsive checks, automated accessibility analysis, metadata validation, route discovery checks, and artifact availability.
- Cypress is complementary and currently checks progressive-enhancement behavior only.
- PDF and DOCX generation are intentionally separate renderers sharing a future typed resume view model.

## Project storytelling

Career-derived projects are stored beside the canonical career record and rendered through static detail routes. Their challenge, approach, outcome, toolkit, and disclosure fields are schema-validated. The project layer may reorganize documented responsibilities into a clearer narrative, but it cannot invent metrics or expose client-sensitive details.

Independently shareable case-study routes own their page-specific title and description and intentionally omit the site-wide social image when no project-specific primary image exists.

## Design flexibility

The current tokens encode the established bright editorial direction, deep navy signal surfaces, and restrained blue-violet accents. Future changes can evolve typography, color, rhythm, borders, imagery, and motion while preserving semantic token names and content hierarchy.

## Document pipeline

`career.json` → validated Astro content → channel selector → shared resume view model → PDF renderer / DOCX renderer

The repository publishes one-page and detailed PDF/DOCX artifacts from the canonical content source through the dedicated resume generator. Web, PDF, and Word may format and select facts differently, but career history remains owned by the shared record.
