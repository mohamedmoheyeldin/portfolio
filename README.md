# Mohamed Moheyeldin — Portfolio Platform

A clean Astro 7 foundation for a unified personal brand across a website portfolio, PDF resume, and editable Word resume.

## Status

This is a complete, multi-route portfolio experience with a premium editorial design, schema-validated career content, project-first case studies, a print-ready resume library, automated quality gates, and Cloudflare Workers hosting.

## Local setup

```bash
corepack enable
pnpm install
pnpm exec playwright install chromium
pnpm verify
pnpm dev
```

## Architecture

- `src/content/career.json` — canonical draft career facts
- `src/content.config.ts` — schema validation
- `src/styles/tokens.css` — provisional cross-format design decisions
- `src/pages/index.astro` — premium portfolio home experience
- `src/pages/work.astro` — project-first case-study index and supporting career record
- `src/pages/work/[slug].astro` — source-grounded project detail pages
- `src/pages/about.astro` — principles, toolkit, and education
- `src/pages/resume/index.astro` — browser and print/PDF resume baseline
- `src/lib/presentations.ts` — shared web/PDF/DOCX presentation contract
- `src/layouts/BaseLayout.astro` — canonical, social, icon, and structured metadata
- `docs/` — architecture, provenance, and open design brief

See [Architecture](docs/ARCHITECTURE.md), [Content provenance](docs/CONTENT_PROVENANCE.md), and [Design brief](docs/DESIGN_BRIEF.md).

## Quality gates

```bash
pnpm check              # Astro and strict TypeScript diagnostics
pnpm build              # Static production output
pnpm test:e2e           # Primary Playwright journeys and accessibility
pnpm test:e2e:cypress   # Complementary progressive-enhancement check
pnpm test:pages         # GitHub Pages subpath packaging check
pnpm verify             # Complete local gate (alias for pnpm quality)
```

The quality gate checks every major route for automated accessibility issues, validates case-study journeys and resume downloads, and confirms search/social metadata plus sitemap and robots output.

See [Development](docs/DEVELOPMENT.md) and [Testing](docs/TESTING.md) for contributor workflow and test-layer details.

## Deployment

Cloudflare Workers Static Assets is the production host. Pushes to `main` are built through Cloudflare's Git integration. Use `pnpm run build:cloudflare` and `pnpm exec wrangler deploy` in Cloudflare's build settings. See [Cloudflare deployment](docs/CLOUDFLARE.md).

The Sites plugin deployment uses `pnpm run build:sites` to package the same static Astro output behind a minimal Cloudflare-compatible asset worker.
