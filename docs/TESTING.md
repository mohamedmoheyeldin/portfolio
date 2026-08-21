# Testing

## Standard verification

```bash
pnpm verify
```

This aliases the complete `pnpm quality` gate.

## Test layers

- `pnpm check` runs Astro and strict TypeScript diagnostics.
- `pnpm build` creates the standard static production output.
- `pnpm test:e2e` runs desktop and mobile Chromium Playwright journeys and accessibility checks against a local preview.
- `pnpm test:e2e:cypress` runs the complementary Cypress progressive-enhancement check.
- `pnpm test:assistant` verifies local and Cloudflare Gmail parsing, token encryption, fact allowlisting, MIME construction, public-data redaction, and tailored-resume generation contracts.
- `pnpm test:pages` builds with `/portfolio/` as the base path and validates the packaged GitHub Pages output.

## Change guidance

- Content, component, layout, style, or metadata changes: run `pnpm verify`.
- Deployment-only changes: also run the specific `build:cloudflare`, `build:sites`, or `build:pages` command for that target.
- Resume or career-data changes: inspect generated PDF/DOCX artifacts in addition to automated checks when the change affects document layout.
- Gmail/OpenAI/Cloudflare live calls are deliberately not part of repository verification. Run `pnpm assistant:cloud:dry-run`, then complete an Access-protected OAuth sandbox smoke test with test Gmail accounts before enabling automatic delivery.
