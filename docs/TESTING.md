# Testing

## October 2, 2026 official credential image previews

- Replaced the five full-page iframe previews with the user's exact four badge image URLs and one certificate image URL from Accredible. All five endpoints returned HTTP 200/image PNG; their numeric IDs were matched to the issuer's public records, and the unaltered images were visually inspected. Badge images are 200×200; the pathway certificate is 600×464 and contains its original issue/expiration text.
- The existing compact 5/3/2/1 grid and placement are preserved. Native images use verified intrinsic dimensions, descriptive alt text, lazy loading, async decoding and `object-fit: contain` within the original 4:3 area. Iframe markup, credential resize observers and scaling CSS are removed. Captions still show `Issued 2026`; Learning and resume expiration-display rules remain intact.
- The existing content gate now validates the presentation image schema, trusted HTTPS endpoints, unique image references/sources, canonical credential references and complete OpenAI Academy coverage. `pnpm verify`, `pnpm build:cloudflare` and `git diff --check` passed. Built-output and local HTTP checks confirm five exact image sources, dimensions, alt text, loading attributes, verification links and section order, with no iframes. All seven served resume downloads still match the existing verified exports by SHA-256.
- Browser page appearance and image loading in a browser remain unverified under the no-auto-browser policy. Asset inspection and HTTP/build checks do not establish responsive visual behavior on a device.

## October 2, 2026 expiration display removal

- The website's own Courses & certifications listings and all seven resume exports omit expiration wording/dates while retaining `Issued 2026`, all five credential titles and public verification links. Exact expiration facts remain in canonical content; issuer-controlled embeds retain their own presentation.
- Export comparisons confirm that only expiration text was removed. Both DOCX document XML files otherwise match exactly, with unchanged hyperlink relationships; Markdown/plain text match after removing that substring, and PDF text matches after whitespace normalization. Both DOCX packages pass integrity, Letter-size and native hyperlink checks.
- Both PDFs were rendered and all three pages visually inspected, with no clipping or overlap: concise remains one page and detailed two. Native Word appearance/pagination remains unverified because the packaged renderer reports missing bundled LibreOffice; no system desktop renderer was used.
- `pnpm verify`, `pnpm build:cloudflare` and `git diff --check` passed. Local HTTP checks confirm expiration text is absent, five official embeds and verification links remain present, and all seven served resume files match the updated exports by SHA-256. Browser appearance remains untested under the no-auto-browser policy.

## October 2, 2026 compact credential previews

- Added all five exact official OpenAI Academy embeds between the Experience introduction and professional experience heading. The 5/3/2/1 responsive grid scales 800×600 iframe viewports; readable titles, `Issued 2026` captions with exact time metadata, and individual outside verification links are prerendered.
- `pnpm verify`, `pnpm build:cloudflare` and `git diff --check` passed. Built-output and local HTTP checks confirm five exact embed sources, titles, dimensions, lazy loading, fullscreen attributes, verification links and the requested section order. Existing Learning metadata remains present, and all seven served resume files match the existing exports by SHA-256.
- All five issuer endpoints returned HTTP 200, without `X-Frame-Options` or a CSP `frame-ancestors` restriction; the portfolio has no blocking `frame-src` header. This confirms transport/header compatibility, not actual cross-origin rendering. Browser appearance, embedded controls, keyboard interactions and runtime resizing remain unverified under the no-auto-browser policy. The issuer controls the details and dates inside its frames.

## October 2, 2026 year-only issue display

- The website and all seven resume formats display `Issued 2026`. Exact issue dates remain in the canonical credential record and the website's time metadata; canonical expiration facts and credential links are preserved. The later expiration-display removal above supersedes the earlier visible expiry labels.
- All seven exports pass credential name/date/link checks. Both PDFs were rendered and all three pages visually inspected: concise remains one page and detailed two, with no clipping or overlap. Both DOCX packages pass integrity, Letter page-size and native hyperlink checks; Word visual pagination remains unverified because bundled LibreOffice is unavailable.
- `pnpm verify`, `pnpm build:cloudflare` and `git diff --check` passed. Local HTTP verification confirms all seven served resume files match the verified exports by SHA-256. This change updates presentation only; employment content and the raw credential dates are unchanged.

## October 2, 2026 five-credential expansion

- The issuer's public credential service and wallet confirm all five OpenAI Academy completion credentials for Mohamed Moheyeldin. Each was issued October 2, 2026 and expires April 2, 2027; all are public, complete, unexpired and not revoked at verification.
- The Experience page displays all five titles with issue and expiration dates and individual canonical verification links. All seven resume formats include the five names, dates and links. Both PDF and DOCX formats use native clickable credential titles; Markdown uses named links and job-board text uses ordinary URLs.
- Grouped shared credential metadata preserves the existing print fonts and all employment content. Rendered and visually inspected every PDF page: concise is one page, detailed is two, with no clipping or overlap. Both DOCX packages pass CRC, Letter page-size, hyperlink label/relationship, and clean-document checks. Native Word appearance and pagination remain unverified because bundled LibreOffice is unavailable.
- Node 24.19.0 / pnpm 11.22.0: `pnpm verify`, `pnpm build:cloudflare` and `git diff --check` passed. Local HTTP verification passed for Experience and both Booz Allen case studies; all five public credential links and dates are present, and all seven served resume files match verified exports by SHA-256.
- The user-confirmed FDE title, other employment titles and all employment dates are preserved. Private sharing keys and tracking fragments are absent. Browser interaction remains untested under the existing no-auto-browser policy; production verification follows publication.

## October 2, 2026 role and credential synchronization

- The user's correction changes the Booz Allen heading to Forward Deployed Engineer (FDE) in the canonical career record, website employment context, and all seven resume downloads. Employer dates and the other employment titles remain unchanged.
- AI Foundations, issued by OpenAI Academy on October 2, 2026, appears in the Experience learning section and all resume formats. The private evidence link is omitted.
- Regenerated both PDF, DOCX, and Markdown variants plus job-board text using the bundled Python runtime. The three career-project text sources match the generated exports byte for byte; generated text uses UTF-8 and LF newlines on Windows.
- Both PDF variants were rendered and every page visually inspected: concise remains one page, detailed remains two, with no clipping or overlap. Both DOCX files pass text, package integrity, Letter page-size, and unchanged-title/date checks. Native Word pagination remains unverified: the packaged renderer reports no bundled LibreOffice.
- Node 24.19.0 / pnpm 11.22.0: pnpm verify and pnpm build:cloudflare passed. Local HTTP checks passed for the Experience page and both Booz Allen case studies; all seven served resume files match the verified exports by SHA-256. The direct project pages and homepage project cards display the employment title from the shared career record.
- Browser interaction remains untested under the existing no-auto-browser policy. Production publication is verified separately from these local checks.

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
