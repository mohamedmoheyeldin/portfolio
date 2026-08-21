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

## Autonomous application system

The application system is intentionally outside Astro's static runtime. The `/assistant/` route is a public, progressively enhanced architecture showcase. It renders an explicit unavailable state rather than invented totals when runtime telemetry cannot be reached, and it can read only sanitized aggregate values from `/api/assistant/api/public-snapshot`. Production routes that endpoint and Access-protected administration to a separate Worker; D1 owns workflow state and application-encrypted per-mailbox OAuth tokens, R2 owns private PDF artifacts, Cloudflare Browser Rendering produces PDFs, and AI Gateway mediates OpenAI traffic without logging prompt or response payloads. `services/job-assistant/` remains a localhost-only development fallback.

The scheduled Worker processes each enrolled Gmail account independently and advances qualifying new messages through durable discovery, analysis, resume generation, Gmail draft creation, delivery, activity logging, and whole-thread archiving. D1 leases, stage timestamps, stable reply identifiers, Sent-mail reconciliation, and bounded retries prevent overlapping runs and reduce duplicate side effects. Identity documents are excluded from both AI input and automatic attachments. This preserves static hosting, `/portfolio/` subpath packaging, canonical career facts, and public/private boundaries. See [Autonomous Application System](JOB_ASSISTANT.md) for setup and [ADR: Resumable Job Email Automation](ADR-JOB-EMAIL-AUTOMATION.md) for decisions and trade-offs.
