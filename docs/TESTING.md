# Testing

## October 30, 2026 casebook redesign

Run from `C:\Projects\scrollcraft\workspace\builds\portfolio-deck` against `dist` served on port 4600 (headless Brave Origin, `playwright-core`, `axe-core` and `lighthouse` from the workspace). pnpm was not on PATH in the session that built it, so the package scripts were run directly with Node 26: `tsc --noEmit`, `scripts/validate-content.mjs`, `scripts/build.mjs`, `scripts/build.mjs --pages` and `scripts/check-pages-build.mjs` (the same steps `pnpm verify` runs).

**Functional suite (`functional.mjs`): 17 of 17 passed.** The diff-build suite adapted to this build (the palette and diff checks removed) plus two new checks for the case deck: at 1440x900 the deck stacks, all three tabs are the topmost element at their centres once the third sheet lands, no sheet body is clipped, and the first tab (clicked while stuck) returns to the first sheet's own place; at 1024x640, on a 390px phone and without JavaScript no sheet is sticky. Also covered: headings, titles and console errors on six pages; navigation; theme (system, toggle, persistence, `theme-color`, applied before scripts); the four resume files (signatures checked); contact routes and copy; the self-test at 375, 768, 1440 and 1920px in both themes and against planted defects; keyboard (skip link, 25 visible focus stops, popover with Enter and Escape); the phone menu; no-JS; reduced motion; an overflow and CLS sweep at 375 to 1920px on six pages; credential images; axe-core WCAG 2.0/2.1/2.2 A and AA plus best practice on four pages in light and dark, after the self-test runs, on a phone and with the phone menu open.

Defects the runs found, all fixed: the sticky sheets' bottom margins sat inside the stack's content box, so earlier sheets were pushed 126px up and their tabs scrolled out of view (the pauses moved onto the in-flow anchors and the end hold onto a spacer); the transparent tab row of the top sheet intercepted clicks meant for earlier tabs (pointer events now pass through it); tab anchors were offset twice (`scroll-padding` plus `scroll-margin`); axe flagged the tabs' `aria-label` for not containing their visible text (replaced with visually hidden trailing text).

**Scrollcraft harness (`shoot.mjs`, desktop):** no dead scroll across 32 positions; contact sheet reviewed.

**Visual review.** Viewport frames at fixed scroll positions (`frames.mjs`) at 1440x900 in light and dark through the cover, each stacking step, the full tab index, supporting work, career, capabilities and the closing sheet; 390x844 phone frames; Experience and a case study in both themes. Changes made from the review: the cover was rebuilt so the claim spans the width and the case tabs sit on the first screen's bottom edge; the sheet layout was rebalanced (problem moved beside the result) so sheets fit 1280x800 as well as 1440x900; the career band is tinted for rhythm; the closing address keeps its copy button on the same line.

**Lighthouse (lab, local server, not field data):** home 100 / 100 / 100 / 100 (performance, accessibility, best practices, SEO) on mobile and desktop; LCP 1.2 s mobile and 0.3 s desktop, CLS 0, TBT 0 ms.

**Not covered:** a real phone (touch scrolling and Safari's sticky behaviour were not tried on a device); browsers other than Chromium; field Core Web Vitals.

## October 30, 2026 diff redesign

Run from `C:\Projects\scrollcraft\workspace\builds\portfolio-diff` against `dist` served on port 4600 (headless Brave Origin, `playwright-core` and `axe-core` from the workspace). pnpm was not on PATH in the session that built it, so the package scripts were run directly with Node 26: `tsc --noEmit`, `scripts/validate-content.mjs`, `scripts/build.mjs`, `scripts/build.mjs --pages` and `scripts/check-pages-build.mjs` (the same steps `pnpm verify` runs), all passing.

**Functional suite (`functional.mjs`): 17 of 17 passed.** The split-build suite adapted to this build (the self-test now runs on the portfolio case study; the close no longer collapses) plus two new checks: the command palette (Ctrl K opens it with the input focused, typing filters, the active option is exposed through `aria-activedescendant`, Escape closes, Enter navigates, "/" opens it, the empty state shows) and the workflow diff (Before and After filter the lines, Diff restores both, `aria-pressed` follows). Includes axe-core WCAG 2.0/2.1/2.2 A and AA plus best practice on four pages in light and dark, after the self-test has run, on a phone and with the phone menu open; the overflow and CLS sweep at 375 to 1920px; keyboard, no-JS and reduced-motion runs.

Defects the first runs found, all fixed: the phone menu button showed on desktop (a later rule overrode its hide); credential cards overflowed 71px at 375px (implicit grid columns sized to the badge image); the case-study result value overflowed 5px at 1280px; the icon-only search button had no name on phones, then a label/content mismatch (the label is now visually hidden text, the shortcut hint `aria-hidden`).

**Visual review.** Full-page and first-screen shots at 1440 and 390px in light and dark for home, Experience and two case studies, plus close-ups of the loop, a featured project, compact rows, career, how I work, the contact plate, the open palette, and a featured project on a phone. Changes made from the review: station text aligned to the top of each station; the result and diff now lead the detail on phones; the Source link matches its button's size; facts sit two to a row on phones; the hero name is larger on phones.

**Lighthouse (lab, local server, not field data):** home 100 / 100 / 100 / 100 (performance, accessibility, best practices, SEO) on mobile and desktop, LCP 1.2 s mobile, CLS 0, TBT 0 ms; Claims Document Assistant case study 99 / 100 / 100 / 100 on mobile (LCP 2.0 s) and 100 across on desktop.

**Not verified.** Real phones and touch scrolling; Firefox and Safari engines; screen readers beyond axe; INP (needs field data); the Cloudflare deploy.

## October 30, 2026 split redesign (superseded)

Browser tools stay out of this repository: `playwright-core`, `axe-core` and `lighthouse` are installed in the Scrollcraft workspace (`C:\Projects\scrollcraft\workspace`) and drive headless Brave Origin. Scripts: `builds\portfolio-split\functional.mjs`, `snap.mjs` and `sections.mjs` (see `DEVELOPMENT.md`). Build with `pnpm build` before serving `dist`: `pnpm verify` ends on the `/portfolio/` subpath build.

**Repo gates.** `pnpm verify` (TypeScript strict, content schema, production build, GitHub Pages subpath packaging) passed on pnpm 11.22.0 / Node 26.12.1. There is no linter, formatter or unit-test suite in this repo. The Cloudflare deploy dry run was not run.

**Functional suite: 15 of 15 passed.** One `h1`, no skipped heading levels, a title and description on six pages including a case study per kind and the 404, with no console errors and no failed requests; header navigation with the current page and section marked, back and forward; theme follows the system, toggles, persists, updates `theme-color`, and the saved choice applies with every script blocked; the resume popover lists four files and each is served with a PDF or Word signature; Email me is a `mailto:` with a subject and LinkedIn and GitHub are on every page, and Copy writes the address to the clipboard; the project index jumps under the sticky header, titles open case studies and the pager cycles; the self-test runs on demand and every check passes at 375, 768, 1440 and 1920px in both themes; planted defects (a duplicate id, an unnamed button, an image without alt) are caught by the self-test; keyboard (skip link first, visible focus on the first 25 stops, the resume popover opens on Enter and closes on Escape); phone at 390px (menu opens, jumps to Contact and closes, the heading clears the header, no overflow); no JavaScript (content, popover menus and details work, JS-only controls hidden, the self-test says it needs JavaScript); reduced motion (no running animations, full opacity, the close rests collapsed); no horizontal overflow and CLS under 0.1 on six pages at 375, 390, 768, 1024, 1280, 1440 and 1920px; every credential badge loads with alt text; axe-core WCAG 2.0/2.1/2.2 A and AA plus best practice on four pages in light and dark, after the self-test has run, on a phone, and with the phone menu open.

Defects the first run found, all fixed: horizontal overflow of 2 to 6px at 375px while the Systems half's entrance animation played (first caught by the page's own self-test; the hero now clips horizontal overflow); smooth scrolling stopped 52px short of long anchor jumps beside scroll-driven animations (smooth scrolling removed); the Email me button in the phone menu lost its colours to a menu-link rule (contrast failure in axe); the local server labels PDFs generically, so the suite checks file signatures instead of content types.

**Visual review.** Full-page and first-screen shots at 1440 and 390px in light and dark for home, Experience and the Claims Document Assistant case study, plus close-ups of the header, self-test (before and after running), a featured project, compact rows, career, capabilities and the close, at 1440 light, 1024 dark and 390 dark. Changes made from the review: the header was over-full at 1440px (resume moved out of the header), the Systems label in the header sat high (a project-label rule matched it), too much space under section heads, the close now rests in its resolved state, the role line is held to the People side at 1024px, and the result leads the Systems band on phones.

**Scrollcraft harness.** `shoot.mjs` at 1440x900, 390x844 and with reduced motion: no dead scroll; the contact sheets were read, including mid-entry rows and the close mid-collapse.

**Lighthouse (lab, local static server, not field data).** Home, Experience and the Claims Document Assistant case study: 100/100/100/100 (performance, accessibility, best practices, SEO) on mobile and desktop. Mobile LCP 1.1 s, desktop 0.3 s, CLS 0, TBT 0 ms on all three. JavaScript 14 KB (under 6 KB gzipped, down from 567 KB), CSS 29 KB (from 122 KB), fonts 80 KB.

**Resumes.** Regenerated after correcting the portfolio project's description (it no longer uses Untitled UI); only that line changed in the text formats. The one-page PDF was rendered and read: one page, new ink and accent colours. The Word files were not opened in Word.

**Not verified.** Real phones and touch scrolling; Firefox and Safari engines (scroll-driven animation needs Chrome/Edge 115+, Safari 26+ or Firefox with the feature; elsewhere the page shows its static state, and the self-test reports LCP and CLS as not measurable outside Chromium); screen readers beyond axe; INP (needs field data); the Cloudflare deploy.

## October 30, 2026 workbench redesign

Browser tools stay out of this repository: `playwright-core`, `axe-core` and `lighthouse` are installed in the Scrollcraft workspace (`C:\Projects\scrollcraft\workspace`) and drive headless Brave Origin. Scripts: `builds\portfolio-workbench\functional.mjs`, `pages.mjs` and `review.mjs` (see `DEVELOPMENT.md`). Build with `pnpm build` before serving `dist`: `pnpm verify` ends on the `/portfolio/` subpath build, whose asset paths do not resolve from the root.

**Repo gates.** `pnpm verify` (TypeScript strict, content schema, production build, GitHub Pages subpath packaging) passed on pnpm 11.22.0 / Node 26.12.1; `git diff --check` is clean. There is no linter, formatter or unit-test suite in this repo.

**Functional suite: 16 of 16 passed.** One `h1` and no skipped heading levels on home, Experience and two case studies, with no console errors and no failed requests; sidebar outline, project and page links with the current section and page marked, and back/forward; theme follows the system, toggles from the status bar, updates `theme-color`, and the saved choice applies before any script module runs (checked with all JS requests blocked); the resume menu and all four PDF/DOCX files; email, LinkedIn and GitHub links on every page, and the composer's `mailto:` carries the chosen topic and the encoded message; index row jump, document title to case study, pager; the inspector (one tag per fact, at least 30 on home, the metric path present, the status bar total matches, every switch in sync, Esc clears); the rule-check demo (sample passes; a broken NPI and an expired referral flag two checks and mark both inputs; a zero amount flags a third; the reply names the problem; Reset restores); the batch demo (999 SSNs, 555-01xx phones, example.com emails, a checksum and gzip size, a new batch changes the rows); the Experience explorer with hash and history; keyboard (skip link first, visible focus on the first 25 tab stops, the inspector from Enter); phone at 390px (no sidebar, the menu sheet jumps to Career and closes, the heading clears the sticky top bar, no horizontal overflow); no JavaScript (disclosures, top-bar links, sidebar outline on desktop, plain resume link, the composer as a native `mailto:` GET form with `subject` and `body` fields, prerendered rule results, no status bar); reduced motion (no CSS animations, full opacity, no transforms); axe-core WCAG 2.0/2.1/2.2 A and AA plus best practice in light and dark themes on four pages, on home with the inspector on, and on home at 390px. The first run found one real defect, fixed: repeated `region` landmarks named "Problem" and "What I did" in every project document (now plain groups).

**Visual and responsive review.** Full-page screenshots at 1440 and 390px in light and dark, first-screen shots at 375, 768, 1024 and 1920px for home, Experience and the Claims Document Assistant case study, and section close-ups (index, two project documents, practice, career, stack, contact, the inspector on, dark project documents, Experience head and explorer) were read. Defects found in the rendered output and fixed: list markers missing (Tailwind preflight), the five-column flow figure cramped inside a project document (now a stepper), rule names running into their text, the status bar overflowing while inspecting, OpenAI badge images escaping their frame, the case-study facts row wrapping into a broken grid, and horizontal overflow at 375 to 390px from screen-reader-only text inside horizontal scrollers (absolutely positioned spans escaped their unpositioned scroll box) and from an auto-sized grid column in the Experience head. Final sweep: no horizontal overflow at any width; CLS 0.026 or less on every page and width.

**Lighthouse (lab, headless Brave, local static server, no throttling beyond Lighthouse defaults).** Home mobile: performance 98, accessibility 100, best practices 100, SEO 100 (LCP 1.8 s, CLS 0, TBT 10 ms). Home desktop: 100/100/100/100 (LCP 0.4 s, CLS 0.013). Experience mobile: 98/100/100/100 (LCP 1.8 s). Claims Document Assistant mobile: 100/100/100/100 (LCP 1.5 s). These are lab results, not field data; INP was not measured.

**Feel check (from the screenshots, against the brief).** Overview: oriented, as intended. Work index: in control. Project documents: absorbed; the rule-check demo is the one place the page answers back, which holds as the peak, though it is an interaction rather than the largest visual change. How I work: clear. Career: grounded. Stack: precise. Contact: invited. Changed after the check: the overview's bottom padding was cut so the index arrives sooner, and the flow figure became a stepper so the demo below it is not crowded.

**Not covered.** Real phones (iOS Safari, Android Chrome) were not tested; only headless Chromium-based Brave. The composer's hand-off to a mail client was checked by its composed `mailto:` URL, not by opening a mail client. Visual checks were headless screenshots, not an interactive browser session.

## October 30, 2026 poster redesign

Browser tools stay out of this repository: `playwright-core`, `axe-core` and `lighthouse` are installed in the Scrollcraft workspace (`C:\Projects\scrollcraft\workspace`) and drive headless Brave Origin. Scripts: `builds\portfolio-poster\functional.mjs` and `builds\portfolio-poster\pages.mjs` (see `DEVELOPMENT.md`).

**Repo gates.** `pnpm verify` (TypeScript strict, content schema, production build, GitHub Pages subpath packaging) and `pnpm build:cloudflare` passed on pnpm 11.22.0 / Node 26.12.1; `git diff --check` is clean. There is no linter, formatter or unit-test suite in this repo.

**Functional suite: 14 of 14 passed.** One `h1` and no skipped heading levels on home, Experience and two case studies, with no console errors and no failed requests; masthead navigation with back/forward; theme follows the system, toggles, and the saved choice applies before any script module runs (checked with all JS requests blocked); both resume menus and all four PDF/DOCX files; email, LinkedIn and GitHub links in the closing plate on every page, and "Email me" is a mailto link; register jump, spread to case study, pager; the trace (Playwright lights the VA Claims spread and exactly one role, dims the banking project, lists jump links, syncs the chip in the spread, clears on Esc); the Experience explorer with hash and history; keyboard (skip link first, visible focus on the first 19 tab stops, a trace from Enter); phone (no dock over the poster, dock appears, index sheet jumps to Career without covering its heading, no horizontal overflow); no JavaScript (disclosures present, no dock, stack links tools to projects, plain resume link); reduced motion (no CSS animations, full opacity); axe-core WCAG 2.0/2.1/2.2 A and AA plus best practice in light and dark themes. The first run found one real defect, fixed: Label in Name on the home masthead link (`aria-label` did not contain its visible text).

**Visual and responsive review.** Full-page screenshots at 1440 and 390px in light and dark, and first-screen shots at 375, 768, 1024 and 1920px, for home, Experience and the Claims Document Assistant case study; all were read. Defects found in the rendered output and fixed: tertiary buttons and the "Email me" link on the plate rendering dark (Untitled UI's `--text-color-*` aliases resolve at `:root`, so `.plate` restates them; tertiary controls use `.plate-ghost`); project verbs, the wordmark and "Email me" overflowing by 8 to 9px at 375 and 390px (phone sizes reduced); dead space beside long project text on wide screens (the result panel and role years are now sticky). Final sweep: no horizontal overflow at any width, CLS 0.001 or less on every page.

**Scrollcraft harness.** `shoot.mjs` on home at 1440×900, 390×844 and with reduced motion: no dead scroll; frames read, including mid-wipe verbs and the method focus states.

**Lighthouse (lab, local static server, not field data).** Mobile: home 99/100/100/100 (performance, accessibility, best practices, SEO), LCP 1.7s, CLS 0, TBT 0ms; case study 100 across, LCP 1.4s; Experience 98/100/100/100, LCP 1.8s, TBT 10ms. Desktop home 100 across, LCP 0.4s. JavaScript is 165 KB gzipped (171 KB before), CSS 20 KB, fonts 138 KB.

**Not verified.** Real phones and touch scrolling; Firefox and Safari engines; screen readers beyond axe; INP (needs field data). Scroll-driven animation needs Chrome/Edge 115+, Safari 26+ or Firefox 159+; elsewhere the page shows its static state.

## October 30, 2026 editorial redesign (superseded)

The user explicitly asked for Playwright, visual, accessibility and Lighthouse testing for this redesign. The browser tools stay out of this repository: they are installed in the Scrollcraft workspace (`C:\Projects\scrollcraft\workspace`: `playwright-core`, `axe-core`, `lighthouse`) and drive headless Brave Origin (`C:\Program Files\BraveSoftware\Brave-Origin\Application\brave.exe`; there is no Chrome or Edge on this machine). No visible browser window was opened.

**Repo gates.** `pnpm verify` and `pnpm build:cloudflare` passed (pnpm 11.22.0 on Node 26.12.1, which satisfies `engines`; CI covers Node 24). `scripts/check-pages-build.mjs` now expects each home entry to link straight to its case study (`/experience/<slug>/`) and carry `id="entry-<slug>"`, in place of the old `#project-<slug>` explorer hashes. TypeScript is strict with unused-local checks; there is no separate linter or formatter in this repo.

**Functional suite** (`workspace/builds/portfolio-editorial/functional.mjs`, 14 checks, all passing). It covers: one `h1` and no skipped heading levels on home, Experience and two case studies, with no console errors; masthead navigation with back/forward; theme toggle and persistence across reload; reading depth (hides and restores detail, persists, keeps the reader's place within 2px); the resume menu offering both versions, with all four PDF/DOCX files served; colophon email, LinkedIn and GitHub links on every page; home entry to case study and the pager; the Experience explorer selection, hash and history; the keyboard path (skip link first, visible focus on the first 15 tab stops, depth control by arrow keys); the phone reading bar opening the contents and jumping to a chapter without covering its heading, with no horizontal overflow; no JavaScript (every detail renders, no reading bar, plain resume link); reduced motion (no CSS animations, full opacity); and axe-core with WCAG 2.0/2.1/2.2 A and AA plus best practice in both themes. The first run found 4 failures, all fixed: Label in Name on `aria-label`ed links, a 1,896px jump when changing depth, a 48px jump from the depth note re-rendering, and a test that counted a color transition as an animation.

**Visual QA.** Full-page screenshots at 375, 768, 1440 and 1920px in light and dark themes for home, Experience and the Claims Document Assistant case study, with reduced motion so the resting layout is checked. All had zero horizontal overflow and no console errors. Defects found and fixed in rendered output: the dark accent rendering gray (Untitled maps `text-brand-secondary` to neutral-300 in dark), opaque Untitled nav-item boxes on the masthead, career years overlapping titles, case-study chapter numerals shrunk by a paragraph rule, missing space above case-study chapter rules, a lone imprint cell wrapping, and a public-source label on a user-reported result. Full-page captures taller than 16,384px repeat the top of the page; that is a Chromium capture limit, not the page.

**Scrollcraft harness.** `doctor.mjs` passes (only the optional kie.ai key is missing, and kie.ai is not used). `shoot.mjs` ran on home at 1440×900, 390×844 and with reduced motion: no dead scroll in any pass, no console errors, and the contact sheets and individual frames were read (intermediate states include the evidence rule part-drawn and the folio progress line). The harness's contrast and cue checks measure engine elements only, so they report nothing on this native-CSS page; contrast is covered by axe instead.

**Lighthouse (lab, not field data).** Before = production (`main`) on Cloudflare; after = this build behind a local gzip server (`127.0.0.1`, near-zero latency, so the after numbers flatter the network). Mobile: home 100/100/100/100 (performance, accessibility, best practices, SEO), LCP 0.9s, CLS 0.002, TBT 0ms; case study 100 across, LCP 0.9s; Experience 100 across, CLS 0.007. Desktop home: before 86 performance with CLS 0.177; after 100 with CLS 0.004. Production mobile case study was 96 with LCP 1.6s. Self-hosting the fonts was the decisive change: with the Google Fonts stylesheet the first local mobile run scored 88 to 90. JavaScript is 171 KB gzipped before and after; CSS is 19 KB. No real-user (field) data exists for this branch.

**Re-run before commit.** `pnpm verify` and `pnpm build:cloudflare` passed again, the functional suite passed 14 of 14, and `shoot.mjs` found no dead scroll at 1440×900, 390×844 or with reduced motion. A further full-page sweep (360, 820 and 1440px; light and dark; home, Experience and two case studies) showed no horizontal overflow and cumulative layout shift of 0.014 or less on every page. One defect was found and fixed: the colophon's inline PDF and Word resume menus rendered at the button scale (smaller, bold, gray in the dark plate) instead of matching the sentence's links; they now inherit the sentence size and use the accent.

**Not verified.** Real phones (iOS Safari, Android Chrome) and touch scrolling; Firefox and Safari engines (all browser checks used Chromium); screen readers beyond axe's automated semantics; INP, which needs field data. Scroll-driven animation needs Chrome/Edge 115+, Safari 26+ or Firefox 159+; elsewhere the page shows its static state.

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
- Browser test dependencies are not part of this repository, at the user's request. The redesign's browser suite lives in the Scrollcraft workspace (see the October 30, 2026 section) and runs headless only when browser testing is requested. Do not open visible browser windows unless explicitly requested. Use build and HTTP checks by default and report visual review as unverified. When the user requests browser review, confirm the connection matches their chosen browser/profile before inspecting navigation, filtering, downloads, keyboard access, mobile layouts, and console errors. Build checks do not establish browser or accessibility coverage.
