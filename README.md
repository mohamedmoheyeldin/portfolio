# Mohamed Moheyeldin — Portfolio Platform

A Vite 8 portfolio with React 19, free Untitled UI components, Tailwind CSS v4, and a shared career record for the website and resume library.

## Status

The `untitledui` redesign includes a new home page, searchable project explorer, four case studies, about page, and resume library. The portfolio itself is featured as an independent engineering project. Production deployment is separate from local review.

## Local setup

```bash
pnpm install --frozen-lockfile
pnpm verify
pnpm dev
```

Use Node.js 24 (see `.nvmrc`) and pnpm 11.22.0. The same commands work in Windows PowerShell and POSIX shells.

## Architecture

- `src/content/career.json` — canonical draft career facts
- `scripts/validate-content.mjs` — schema validation
- `src/styles/theme.css` — upstream Untitled UI theme
- `src/styles/global.css` — responsive portfolio layouts and typography
- `src/components/Portfolio.tsx` — React page composition and interactive work explorer
- `src/components/base/` — free Untitled UI source components

- `scripts/build.mjs` — canonical, social, icon, and structured metadata
- `docs/` — architecture, provenance, and open design brief

See [Architecture](docs/ARCHITECTURE.md), [Content provenance](docs/CONTENT_PROVENANCE.md), and [Design brief](docs/DESIGN_BRIEF.md).

See [Untitled UI integration](docs/UNTITLED-UI.md) for upstream attribution and local adaptations.

## Quality gates

```bash
pnpm check              # strict TypeScript diagnostics and content schema validation
pnpm build              # Static production output
pnpm test:pages         # GitHub Pages subpath packaging check
pnpm verify             # Complete local gate (alias for pnpm quality)
```

The quality gate validates TypeScript and content schemas, builds the site, and checks GitHub Pages subpath packaging. Browser test dependencies and suites have been removed. Navigation, filtering, downloads, responsive layouts, and accessibility require separate browser review.

See [Development](docs/DEVELOPMENT.md) and [Testing](docs/TESTING.md) for contributor workflow and test-layer details.

## Deployment

Cloudflare Workers Static Assets is the production host. Pushes to `main` are built through Cloudflare's Git integration. Use `pnpm run build:cloudflare` and `pnpm dlx wrangler@4.144.0 deploy` in Cloudflare's build settings. See [Cloudflare deployment](docs/CLOUDFLARE.md).
