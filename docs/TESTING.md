# Testing

## October 1, 2026 interview preparation companion

- Added repository-only interview and technical walkthrough guides; no website routes, career facts or resume outputs changed in this update. Existing Application Studio work was preserved.
- Verified 32 local source/sibling-repository links in the new guides, UTF-8 decoding and whitespace. The canonical 80-question bank remains in the career project.
- Node 24.19.0 / pnpm 11.22.0: pnpm verify passed, including 12 Studio tests, TypeScript/content validation, root build and GitHub Pages subpath checks. The current application build reports a JavaScript chunk above 500 kB; this documentation change does not alter that bundle.
- Browser interaction, native document rendering and live AI were not exercised. No deployment, commit or push was performed.
- Restored the root build with pnpm build:cloudflare after verification. Confirmed the interview guides are absent from built public assets; git diff --check passed.

## Application Studio preview

- `pnpm test:studio`: backend consent/input limits, disabled/unconfigured behavior, cross-origin rejection, private-route denial, provider response shape, budget exhaustion, SQL quota cap/reset, and template fact preservation.
- `pnpm verify`: includes those tests, strict frontend TypeScript, content schema checks, production prerendering, and Studio `/portfolio/` navigation packaging checks.
- `pnpm studio:bundle`: Wrangler dry-run validates the separate Worker module and bindings; it does not publish or exercise a provider.
- With the disabled local Studio Worker running on port 8787, `node scripts/check-studio-http.mjs` exercises all six pages, assets, public status, private denials, disabled generation and unknown API routes. Set `STUDIO_TEST_ORIGIN` for a different local port; this check expects AI to be disabled and must not target production.
- Public AI is disabled by default. Live AI, owner login/MFA, Google OAuth and actual email/job actions are not verified or connected. Sample interactions require a browser review before release; no browser is opened automatically.
- First preview validation: 10 Studio tests, TypeScript/content checks, root and `/portfolio/` builds, Worker dry-run, and all seven local HTTP routes passed. Rebuilding while Wrangler was running caused a Windows asset-watcher failure; stopping and restarting the Worker restored the HTTP checks. No live AI request or external account mutation was performed.

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
