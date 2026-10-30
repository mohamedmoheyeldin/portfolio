# Scrollcraft brief: the poster redesign

> [!NOTE]
> Self-authored under explicit creative delegation. On 2026-10-30 the owner asked again for a complete, visibly bolder redesign using the Scrollcraft skill (`scroll-craft` 0.3.1, upstream `75d81f7`), chose "a new, bolder direction" over refining the editorial build, and later added "I want a better UI". No interview answers or quotations are invented here. Every fact on the page comes from `src/content/career.json`.

This is the third Scrollcraft build on `NewIU`. It replaces the editorial build (folio, reading-depth control, colophon), which replaced the gallery build. Both are rows in the fingerprint registry (`C:\Projects\scrollcraft\workspace\FINGERPRINTS.md`) and this build is gated against both.

## The eight topics (authored decisions)

| Topic | Decision |
|---|---|
| Vibe | Confident, plain, engineered. A poster you can read from across the room, backed by a report you can check up close. References: Swiss and constructivist type posters, a release notes page, a test run summary. |
| Journey | The name, the facts, the work, how it is checked, the career, the stack, the close. |
| Energy | Loud at the poster, loudest in the work (one verb per project at poster scale), quiet through method and career, practical at the stack, loud and still at the close. |
| Feeling and the one moment | See the feeling curve. The moment: pressing a tool and watching the whole page answer where it was used. |
| One thing no other site does | Lets a recruiter check any keyword on the resume against the work in one press. |
| Range | Typographic poster on a cobalt plate. Not editorial, not premium-minimal dark. |
| One world or scenes | Distinct sections with hard cuts. No continuous world. |
| Assets | None to generate (kie.ai is not used; the repo forbids generated artwork, logos and mock interfaces). Real assets: the career record, the case studies, the official credential badges. |

## Grammar: typographic poster

Type is the imagery. The site has no photographs and must not have mock interfaces, so scale contrast does the work media would do: the name at 16vw, then a 16px sentence; a verb at 15vw, then the evidence.

Why the others lost:

- **Gallery / catalog** and **chaptered editorial** are the two previous builds (rows 1 and 2).
- **Filmic one-shot** and **continuous world** need footage or a generated world. There is none, by rule.
- **Live surface** would need a real running product; a fake test runner or dashboard is banned.
- **Split stage** needs one two-sided argument; a career is not a before and after.
- **Rhythmic cutlist** suits energy brands; hard short cuts would hide the evidence.

Grammar rules kept: the wordmark is set in the composition, not as a 14px bar item; no scrub, no scrims, no tilt, no parallax on text, no card rail. One stated deviation: the grammar's default close is the quietest type on the site with a plain link. This close is "Email me" at poster scale instead, because the page's one job is that action; the rest of the close (resume, LinkedIn, GitHub, the audit offer) is set small as running text.

## Journey

1. **Recognition.** The name, the claim, what he does, and the three actions (poster).
2. **Screening.** Now, before, education, credentials, location (facts row).
3. **Proof (peak).** Six projects: verb, result and evidence source, problem, role, decisions, tools, links (selected work).
4. **Method.** Five habits of quality, each tied to a project.
5. **Perspective.** Three roles, each wider in scope.
6. **Range.** Every tool, sized by use, and each one traceable.
7. **Commitment.** Email me, resume, LinkedIn, GitHub (close).

## Feeling curve

| Act | Feeling | What causes it |
|---|---|---|
| Poster | Struck | The name across a cobalt field, its halves sliding in from opposite edges |
| Facts | Oriented | A hard cut to white and one ruled row of plain facts |
| Selected work (peak) | Convinced | Each project announced by one verb wiping in at poster scale, then the result and where its evidence lives, held beside the text while it is read |
| Method | Calm | Five large lines, each at full ink only as it crosses the middle of the screen |
| Career | Grounded | A span bar drawn at the width of each tenure, years held in the margin |
| Stack | Curious | A wall of tool names at different sizes; pressing one lights the work |
| Close | Resolved | The cobalt field again, one action at poster scale, holding still |

**Peak:** selected work. It has the most scroll room, six verbs at poster scale and the only drawn figure. **Tell-someone sentence:** "It's the site where you click any tool on his resume and it shows you exactly where he used it." **Authored silence:** none.

## Score

| Beat | Device | Why |
|---|---|---|
| Poster | `kinetic` (two halves of the name from opposite edges) + recede on exit | The name is the image; it arrives, then steps back as the work starts |
| Facts | static | A cut, not a move |
| Selected work | `reveal` (clip-path wipe across each verb) + drawn evidence rules and pipeline | Each project is a change of subject; a wipe across letterforms is the grammar's reveal |
| Method | `focus` (opacity by position) | One habit at a time, at reading pace, without pinning |
| Career | `draw` (span bar) + wipe on years | Real tenure, drawn to scale |
| Stack | `trace` (the signature) + `in` | Utility first; motion only on arrival |
| Close | static plate | The close holds still |

Five device families, none twice in a row, no pins, no scrub. All native CSS (`animation-timeline: view()`), only under `prefers-reduced-motion: no-preference` inside `@supports`; the resting state is the visible state.

## Signature move: the trace

Every tool name on the page is a control. Press Playwright and the VA Claims Workflows spread and the Booz Allen Hamilton role light up with an accent edge, every other project dims, the same chip lights in each project that names it, and a bar lists the projects as jump links with the employers. Press again, the bar's close button or Esc to clear. It is computed from `technologies` in the career record, so it can only show what the record says. Without JavaScript the names are text and the stack links each tool to its projects.

## Fingerprint gate

| Dimension | This build | vs row 1 (gallery) | vs row 2 (editorial) |
|---|---|---|---|
| Grammar | Typographic poster | differs | differs |
| Nav | Static masthead on the plate; a bottom-right dock (index sheet + Email me) after the poster | differs (fixed top bar) | differs (margin folio, phone reading bar) |
| Hero | Name at composition scale on a full-bleed cobalt plate, kinetic halves | differs (dark parallax band + snapshot card) | differs (paper title page) |
| Act shape | 7 acts, no pins: kinetic, static, reveal, focus, draw, trace, plate | differs (7 with two pins) | differs (6: in, reveal, flow, parallax, in, cut) |
| Close | Cobalt plate, one action at poster scale, the rest as a sentence | differs (dark button band) | differs (colophon running text) |
| Signature | Tool trace | differs | differs |

6 of 6 against each row. Shared with both: a static site, one blue hue and no photographic media, all fixed by the repo's rules; this build changes how the hue is used (a ground at both ends) and the type family.

## Verified, and not

Run headless from the Scrollcraft workspace; results in [TESTING.md](TESTING.md). Real phones (iOS Safari, Android Chrome) and non-Chromium engines were not tested.

## Research references

- Scroll-driven animations: [MDN animation-timeline](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timeline) and [caniuse](https://caniuse.com/mdn-css_properties_animation-timeline); [WebKit bug 327193](https://bugs.webkit.org/show_bug.cgi?id=327193) is why keyframes never use `translate: none`.
- Cross-document view transitions: [Chrome for Developers](https://developer.chrome.com/docs/web-platform/view-transitions/cross-document).
- Fonts and vitals: [web.dev font best practices](https://web.dev/articles/font-best-practices), [Optimize LCP](https://web.dev/articles/optimize-lcp). The name is painted at once and only translated, so it is never a delayed LCP element.
- Archivo: [Google Fonts](https://fonts.google.com/specimen/Archivo), SIL Open Font License 1.1, variable weight and width axes (the width axis is what lets one family carry both a 68% poster line and a 92% claim).
- WCAG 2.2: [2.5.3 Label in Name](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name) (caught by axe on the masthead name and fixed), [2.4.11 Focus Not Obscured](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html) (`scroll-padding-bottom` reserves the phone dock), [2.5.8 Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) (chips are at least 32px tall).
- Toggle buttons: [WAI-ARIA APG button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/) (`aria-pressed` for the trace chips).
- Untitled UI: [dark mode](https://www.untitledui.com/react/docs/dark-mode) and [theming](https://www.untitledui.com/react/docs/theming): semantic tokens re-scoped on a subtree, as `.dark-mode` does.
