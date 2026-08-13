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
- Playwright owns primary journeys, responsive checks, and automated accessibility analysis.
- Cypress is complementary and currently checks progressive-enhancement behavior only.
- PDF and DOCX generation are intentionally separate renderers sharing a future typed resume view model.

## Design flexibility

The current tokens are neutral placeholders, not a design direction. The final brand phase can change typography, color, rhythm, borders, imagery, and motion while preserving semantic token names and content hierarchy.

## Planned document pipeline

`career.json` → validated Astro content → channel selector → shared resume view model → PDF renderer / DOCX renderer

The first baseline includes the content source, shared presentation contract, and printable HTML route. Automated PDF and DOCX artifact generation belongs to the next implementation phase after the visual direction and resume variants are approved.
