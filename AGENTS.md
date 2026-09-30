# Repository guidance

## Scope

This is the canonical React/Vite portfolio and multi-format resume platform. The `untitledui` branch uses React, free MIT-licensed Untitled UI components, and Tailwind CSS v4. Career content remains schema-validated and shared by the website and resume outputs.

## Working agreements

- Use Untitled UI's official website and upstream source directly for design decisions and component documentation. The user explicitly excluded Context7 and other design sources for this project. Keep the presentation restrained: no custom mock browser illustrations, code artwork, tilted cards, floating notes, or monogram artwork. Use pnpm exclusively for package operations.

- Use Node.js 24 (also recorded in `.nvmrc`) and the pnpm version declared in `package.json`.
- Keep `@types/node` on Node 24 to match the runtime. TypeScript 6 follows the official Untitled UI Vite starter.
- Work natively from `C:\Projects\portfolio`; do not introduce WSL, Docker, a local AI model, or a .NET SDK unless explicitly requested.
- Install with `pnpm install --frozen-lockfile`.
- Keep package scripts cross-platform so they run from Windows PowerShell as well as CI's Linux shell.
- Run `pnpm verify` after changes. It covers TypeScript checks, production builds, and GitHub Pages subpath packaging. Browser test dependencies were removed at the user's request.
- Do not launch, navigate, reopen, or foreground any browser window or tab unless the user explicitly requests it. This overrides automatic browser-review guidance for this project. Do not invoke Chrome DevTools merely to inspect pages: its configured connection launches a separate Brave Origin automation profile and can show empty windows. Use build checks and HTTP checks by default, provide the local URL as a link, and state when visual checks were not run. If browser interaction is requested, use the browser/profile the user specifies through a verified existing-session connection; never substitute an isolated profile silently. Keep Vite server and preview `open: false`; do not pass `--open`.
- Keep career facts canonical and factual. Do not invent employers, responsibilities, dates, outcomes, or metrics.
- Preserve public/private content boundaries, resume generation, `/portfolio/` portability, accessibility, metadata, and responsive behavior.
- Use shared styles and presentation contracts instead of route-specific duplication.
- `src/components/Portfolio.tsx` owns the portfolio composition; React route composition supplies validated content and metadata. The work explorer hydrates for search and filtering. Keep content and links usable without JavaScript.
- Blue is the permanent brand color. Map the complete brand scale (50–950) to the upstream blue tokens in `src/styles/theme.css`; keep semantic status colors intact. There is no palette picker or runtime theme switching.
- Personal branding uses the linked name Mohamed Moheyeldin only. Keep the favicon blank and omit graphic app icons and branded social images. Employer logos are separate experience identifiers.
- Keep Untitled UI source attribution in `UNTITLED-UI-LICENSE` and `docs/UNTITLED-UI.md`. Preserve strict TypeScript checks when adapting upstream components.
- Use imported Untitled UI components for controls, navigation, disclosures, badges, featured icons, and empty states. Compose portfolio layouts from these primitives and the upstream theme tokens. Keep custom layout CSS in the components layer so it cannot override the components' Tailwind utility styles. Document source adaptations and remaining custom artwork; do not imply custom layouts are upstream templates.
- `pnpm verify` finishes with a subpath build. Run `pnpm build:cloudflare` again before production preview or deployment.
- Do not deploy to Cloudflare or GitHub Pages unless explicitly requested.
- Do not commit, push, open pull requests, or generate release artifacts unless explicitly requested.

## Documentation and tools

- Start with `README.md`, `docs/DEVELOPMENT.md`, and `docs/TESTING.md`.
- `docs/ARCHITECTURE.md` and `docs/CONTENT_PROVENANCE.md` define the key content boundaries.
- Project-scoped Untitled UI MCP: `.codex/config.toml`, official HTTPS endpoint; no credentials needed for free components.

- Keep `components.json` aliases aligned with TypeScript and Vite. Use upstream typography, color, and shadow tokens for portfolio styles; avoid a parallel token system or custom control styles.

- Do not add migration caches, obsolete deployment adapters, empty legacy directories, or unused modules. TypeScript checks reject unused locals and parameters. Keep generated build output and installed dependencies ignored.

- Resume generation: `pnpm resume:generate` uses Python with `scripts/requirements-resume.txt`, installed Tailwind tokens, and `assets/fonts`. Keep PDF/DOCX colors derived from the website theme. Visually verify output; do not imply native documents execute React components.

- Current positioning is Forward Deployed Engineer (FDE). Keep historical employment titles and project roles factual; do not relabel past SDET roles as FDE or invent customer outcomes.
