# Mohamed Moheyeldin — Portfolio Platform

A clean Astro 7 foundation for a unified personal brand across a website portfolio, PDF resume, and editable Word resume.

## Status

This is an architecture baseline, not a finished visual design. It establishes validated factual content, semantic page structure, shared presentation tokens, a print-ready resume preview, quality gates, and GitHub Pages delivery while keeping the final style open for iteration.

## Local setup

```bash
corepack enable
pnpm install
pnpm exec playwright install chromium
pnpm quality
pnpm dev
```

## Architecture

- `src/content/career.json` — canonical draft career facts
- `src/content.config.ts` — schema validation
- `src/styles/tokens.css` — provisional cross-format design decisions
- `src/pages/index.astro` — semantic website baseline
- `src/pages/resume/index.astro` — browser and print/PDF resume baseline
- `src/lib/presentations.ts` — shared web/PDF/DOCX presentation contract
- `docs/` — architecture, provenance, and open design brief

See [Architecture](docs/ARCHITECTURE.md), [Content provenance](docs/CONTENT_PROVENANCE.md), and [Design brief](docs/DESIGN_BRIEF.md).

## Quality gates

```bash
pnpm check              # Astro and strict TypeScript diagnostics
pnpm build              # Static production output
pnpm test:e2e           # Primary Playwright journeys and accessibility
pnpm test:e2e:cypress   # Complementary progressive-enhancement check
pnpm quality            # Complete local gate
```

## Deployment

Pushes to `main` validate and deploy a fallback build through GitHub Actions at `https://mohamedmoheyeldin.github.io/portfolio/`.

Cloudflare Workers Static Assets is the intended host for the custom domain. Use `pnpm run build:cloudflare` and `pnpm exec wrangler deploy` in Cloudflare's Git build settings. See [Cloudflare deployment](docs/CLOUDFLARE.md).
