# Repository guidance

## Scope

This is the canonical Astro portfolio and multi-format resume platform. Career content is schema-validated and projected into web, PDF, and DOCX presentations.

## Working agreements

- Use Node.js 24 and the pnpm version declared in `package.json`.
- Install with `corepack pnpm install --frozen-lockfile`, then install Chromium with `pnpm exec playwright install chromium` when browser dependencies are missing.
- Run `pnpm verify` after changes. It covers Astro/TypeScript checks, builds, Playwright, Cypress, and GitHub Pages subpath packaging.
- Keep career facts canonical and factual. Do not invent employers, responsibilities, dates, outcomes, or metrics.
- Preserve public/private content boundaries, resume generation, `/portfolio/` portability, accessibility, metadata, and responsive behavior.
- Use shared styles and presentation contracts instead of route-specific duplication.
- Do not deploy to Cloudflare, Sites, or GitHub Pages unless explicitly requested.

## Documentation and tools

- Start with `README.md`, `docs/DEVELOPMENT.md`, and `docs/TESTING.md`.
- `docs/ARCHITECTURE.md` and `docs/CONTENT_PROVENANCE.md` define the key content boundaries.
- The project-scoped Astro Docs MCP in `.codex/config.toml` is development-only. Keep credentials and private endpoints out of it.
