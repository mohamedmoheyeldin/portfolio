# Mohamed Moheyeldin — Portfolio Platform

A Vite 8 portfolio with React 19, free Untitled UI components, Tailwind CSS v4, and a shared career record for the website and resume library.

## Status

The current portfolio includes Home, Experience with project and toolkit explorers, five case studies, and a resume library with PDF, Word, Markdown, and plain-text formats. The portfolio itself is featured as an independent engineering project.

`main` is the production branch for `https://mohamedmoheyeldin.com/`. Future Application Studio work belongs on `application-studio` and is not part of the current production release.

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

## Application Studio development

This branch now contains the first Application Studio preview at `/application-studio/`: a working template document builder, fictional inbox workflows, editable temporary preferences, automation previews, and connection-status tags. It uses the existing Untitled UI components and blue theme. An optional Cloudflare public AI adapter is implemented and disabled by default. Owner authentication, provider expansion, Google integration, persistent history, and real automation remain planned. See the [setup guide](docs/APPLICATION-STUDIO-SETUP.md) and [full plan](docs/APPLICATION-STUDIO-PLAN.md). Keep Studio on `application-studio` until a separate release request; Cloudflare excludes this branch from automatic portfolio uploads.

## Quality gates

For interview preparation, use the [portfolio companion](docs/INTERVIEW-PREPARATION.md) and [technical walkthrough](docs/INTERVIEW-TECHNICAL-WALKTHROUGH.md). They connect these case studies to the career project's story cards and 80-question practice track. These are local repository guides, not public website content.

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
