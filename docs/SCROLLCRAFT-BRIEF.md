# Scrollcraft brief: the editorial redesign

> [!NOTE]
> Self-authored under explicit creative delegation. On 2026-10-30 the owner asked for a complete redesign that uses the Scrollcraft skill (`scroll-craft` 0.3.1, upstream `75d81f7`) and gave the agent creative authority. No interview answers or quotations are invented here. Every fact on the page comes from `src/content/career.json`.

This replaces the earlier gallery/catalog build on this branch (dark hero bands, hiring-snapshot card, role-fit ledger). That build is recorded as row 1 in the Scrollcraft fingerprint registry so this one could be gated against it.

## The eight topics (authored decisions)

| Topic | Decision |
|---|---|
| Vibe | Precise, plain-spoken, printed. A technical report you trust because every claim names its source. References: a well-set engineering handbook, a newspaper's long-read layout, a test report's results table. |
| Journey | Title page, then the work, then how the work is checked, then the career behind it, then the index of tools, then the colophon with the ways to get in touch. |
| Energy | Calm at the title page, highest in the work, quiet through method and career, practical in the index, settled at the close. |
| Feeling and the one moment | See the feeling curve. The moment: switching the page from the skim to the full write-up and watching every chapter change at once. |
| One thing no other site does | Lets the visitor choose how much to read, once, for the whole site. |
| Range | Editorial. Paper ground, a serif display face, a real measure, hairlines instead of cards. Not premium-minimal dark. |
| One world or scenes | Distinct chapters with hard cuts. No continuous world. |
| Assets | None to generate (no kie.ai, and the repo forbids generated artwork, logos and mock illustrations). Real assets: the career record, the case studies, and the official credential badge images. |

## Grammar: chaptered editorial

The visitor's question is "can this person do the work, and can I check it". The answer is long-form substance: problems, decisions, tests and evidence. That is what the chaptered editorial grammar is for.

Why the others lost:

- **Filmic one-shot** and **continuous world** need footage or a generated world. There is none, by rule.
- **Live surface** would need a real running product on the page. The site is static, and a fake test runner or dashboard is banned.
- **Typographic poster** carries one sentence. A hiring decision needs evidence, not a slogan.
- **Gallery / catalog** was the previous build. Using it again would fail the fingerprint gate.
- **Split stage** needs a two-sided argument. A career is not a before-and-after.
- **Rhythmic cutlist** suits energy brands. Short hard cuts would hide the evidence.

Grammar rules kept: no fixed marketing bar (a static masthead plus a folio in the margin), the hero is a title page with no media, hard changes of ground between chapters, media in its own column with a caption, no spotlight, no magnetic button, the close is a colophon with the call to action set as running text.

## Journey

1. **Recognition.** Who he is, what he builds and checks (title page).
2. **Proof (peak).** Six case studies: problem, what he did, how it was checked, the result and where the evidence lives (chapter 1, The work).
3. **Method.** How quality is built in, from requirements to release evidence (chapter 2).
4. **Perspective.** The career: three roles, each with a wider scope than the last (chapter 3).
5. **Range.** Every tool, indexed to the projects that used it (chapter 4).
6. **Commitment.** Email, resume, LinkedIn, GitHub (colophon).

## Feeling curve

| Act | Feeling | What causes it |
|---|---|---|
| Title page | Oriented | A name, a role and a plain two-line claim on paper, the lines set in one by one |
| The work (peak) | Convinced | A hard cut to the white surface and a one-line-per-project register, then the lead case study opens as a full spread; the evidence rule draws under each result as it passes |
| Method | Calm | Five stages in one ruled row, no motion beyond a quiet rise |
| Career | Perspective | Large year numerals in the margin drift slower than the text beside them |
| Index | Practical | A dense two-column back-of-book index, every entry a link |
| Colophon | Resolved | A hard cut to the dark ground. The page stops moving and holds the contact line |

**The peak:** the work. It has the most scroll room and the only drawn figure (the Claims Document Assistant pipeline).

**Tell-someone sentence:** "It's the site where you choose how much to read, a skim or the full write-up, and the whole thing rearranges for you."

**Authored silence:** none. Every screen carries copy.

## Score

| Beat | Device | Why |
|---|---|---|
| Title page | `in` (entrance stagger) | A title page is set, not animated; a short stagger is enough |
| The work | `reveal` (clip-path wipe on each evidence rule) + drawn pipeline figure | Opening the evidence is a change of state; the figure draws because a pipeline is a sequence |
| Method | `flow` (rise) | Quiet after the peak |
| Career | `parallax` (year numerals at a slower rate) | Depth from rate difference on real dates, not decoration |
| Index | `in` | Utility; motion would get in the way |
| Colophon | Hard cut, static | The close holds still |

Five device families, none twice in a row. All motion is native CSS (`animation-timeline: view()`), runs only under `prefers-reduced-motion: no-preference` inside `@supports`, and never hides content: the resting state is the visible state.

## Signature move: the reading-depth control

One control in the folio (the reading bar on phones), three stops: **Skim**, **Read** and **Full**. It regrades every chapter of every page at once.

- **Skim**: headlines, the result line, the evidence label and the links.
- **Read** (default): adds the problem, what he did, and the role.
- **Full**: adds decisions, evidence, every career highlight, the systems and trade-offs on case studies, and the index entries no project names.

It is stored in `localStorage`, applied before first paint by the inline script in `index.html` (no flash), and keeps the reader's place when it changes: the chapter at the top of the screen stays at the top. Without JavaScript the control is not shown and every detail renders.

## Fingerprint gate

Against row 1 (the previous build): grammar differs (editorial vs gallery), nav differs (static masthead and margin folio vs fixed bar), hero differs (typographic title page vs dark parallax band with a snapshot card), act shape differs (six acts, `in, reveal, flow, parallax, in, cut` vs seven with two pins), close differs (colophon running text vs dark button band), signature differs. 6 of 6.

## Feel check

Scrolled cold in the rendered build, one word per act: title page *clear*, the work *substantial*, method *quiet*, career *grounded*, index *useful*, colophon *final*. Against the intended curve (oriented, convinced, calm, perspective, practical, resolved) the only gap was the career act, which first read as *crowded* because the year numerals overlapped the titles. The years moved into a shared margin column and the act now reads as intended. The peak is the longest chapter on the home page at every width tested and carries the only drawn figure.

## Verified, and not

`shoot.mjs` found no dead scroll at desktop, phone or reduced motion, and the frames were read; the functional, axe and Lighthouse results are in [TESTING.md](TESTING.md). Real phones (iOS Safari, Android Chrome) and non-Chromium engines were not tested.

## Research references

- Scroll-driven animations: [MDN animation-timeline](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timeline), [caniuse](https://caniuse.com/mdn-css_properties_animation-timeline) (Chrome/Edge 115+, Safari 26+, Firefox 159+), [WebKit bug 327193](https://bugs.webkit.org/show_bug.cgi?id=327193) (`translate: none` keyframes), which is why the keyframes use explicit values.
- Cross-document view transitions: [Chrome for Developers](https://developer.chrome.com/docs/web-platform/view-transitions/cross-document), [caniuse](https://caniuse.com/cross-document-view-transitions). Opted in only under `prefers-reduced-motion: no-preference`.
- Core Web Vitals and fonts: [web.dev Web Vitals](https://web.dev/articles/vitals), [Optimize LCP](https://web.dev/articles/optimize-lcp), [font best practices](https://web.dev/articles/font-best-practices). These led to self-hosting, preloads, `font-display: swap` and metric-matched fallbacks.
- WCAG 2.2: [2.4.11 Focus Not Obscured](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html) (the reading bar sets `scroll-padding-bottom`), [2.5.8 Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) (24px minimum on index references and controls), 2.5.3 Label in Name (no `aria-label` replaces visible link text).
- Untitled UI: [dark mode](https://www.untitledui.com/react/docs/dark-mode) and [theming](https://www.untitledui.com/react/docs/theming): `.dark-mode` class, semantic tokens, full brand scale.
- Hiring readers: [Nielsen Norman Group on portfolios](https://www.nngroup.com/articles/ux-design-portfolios/). Reviewers rarely read word for word and look for problem, role, constraints, process and outcome. This is the basis for the label schema, the evidence source on every result and the Skim depth. The source is about UX hiring; applying it to engineering hiring is an inference.
- Claude Code skills: [code.claude.com/docs/en/skills](https://code.claude.com/docs/en/skills). A personal skill in `~/.claude/skills/<name>/SKILL.md` may be a link to a directory elsewhere, which is how the local Scrollcraft copy is loaded.