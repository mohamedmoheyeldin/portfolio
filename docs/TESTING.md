# Testing

## Standard verification

```bash
pnpm verify
```

This aliases the complete `pnpm quality` gate.

## Test layers

- `pnpm check` runs strict TypeScript diagnostics and content schema validation.
- `pnpm build` creates the standard static production output.
- `pnpm test:pages` builds with `/portfolio/` as the base path and validates the packaged GitHub Pages output.

## September 30, 2026 release review

- Node 24.19.0 / pnpm 11.22.0: `pnpm verify` and `pnpm build:cloudflare` passed.
- Production preview on port 4323: nine HTML documents matched built output; 173 local links, assets, and anchors resolved. Canonical/description metadata, four case-study section contracts, the homepage copy, seven resume downloads, and the missing-route HTTP 404 passed.
- Resume PDFs: one-page version remains one page; detailed version remains two. All rendered pages were visually reviewed. Word files passed structural/content checks, but visual pagination is unverified because the bundled LibreOffice renderer is unavailable.
- Browser interaction, responsive layout, keyboard navigation, and console behavior were not exercised, following the no-auto-browser policy.
- Historical Booz Allen title timing remains unresolved in the source record. The existing requested title was preserved.
- No production deployment, commit, or push was performed for this update.

## October 1, 2026 responsive review

- Reviewed the shared header, project/toolkit menus, case studies, resume cards, contact section, and footer against the 420px, 720px, 1000px, and 1280px CSS breakpoints.
- Tablet headers use two rows; phone layouts stack content and wrap download buttons.
- Fixed wrapping for the footer credit, tablet contact layout, phone contact spacing, and resume grid sizing. Project menu anchors now resolve in static HTML as well as the interactive explorer.
- `pnpm verify`, `pnpm build:cloudflare`, and local production HTTP checks passed.
- The user requested code and build checks only. Browser viewport rendering, touch, keyboard interactions, and physical iOS/Android devices were not tested. These checks do not confirm visual behavior on every device.

## Change guidance

- Content, component, layout, style, or metadata changes: run `pnpm verify`.
- Deployment-only changes: also run the specific `build:cloudflare` or `build:pages` command for that target.
- Resume or career-data changes: inspect generated PDF/DOCX artifacts in addition to automated checks when the change affects document layout.
- Browser test dependencies and suites were removed at the user's request. Do not open browsers or call browser automation unless explicitly requested. Use build and HTTP checks by default and report visual review as unverified. When the user requests browser review, confirm the connection matches their chosen browser/profile before inspecting navigation, filtering, downloads, keyboard access, mobile layouts, and console errors. Build checks do not establish browser or accessibility coverage.
