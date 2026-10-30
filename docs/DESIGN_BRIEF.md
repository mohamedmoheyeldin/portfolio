# Design brief: the editorial edition

The site is set like a printed engineering feature: a title page, numbered chapters, a folio in the margin, and a colophon. The full Scrollcraft brief (grammar, journey, feeling curve, device score and signature move) is in [SCROLLCRAFT-BRIEF.md](SCROLLCRAFT-BRIEF.md).

- **Two themes, two editions.** Light is a paper edition: a faint blue-tinted paper ground, ink rules, plain result panels. Dark is a night edition: a blue-black ground, raised result panels with an edge highlight, a blue colophon plate. Both are built from the upstream Untitled UI tokens; blue stays the only accent.
- **Type.** Newsreader (display: headlines, chapter numerals, results) and Inter (text and interface). Two families only. Display tracking tightens as size grows; body measure stays near 66 characters.
- **Structure over cards.** Hairlines, a margin column for numerals and years, and spacing do the grouping. Cards appear only where an object is a real thing (credential badges, the dark-theme result panels).
- **Evidence first.** Every project uses one label schema: result, evidence source, problem, what I did, role, decisions, evidence, built with. The evidence source (user-reported, public source, documented responsibility) is derived from the career record and shown with every result.
- **Reading depth.** One control (Skim, Read, Full) sets how much detail every page shows. Without JavaScript everything renders.
- **Motion.** Native CSS only, behind `prefers-reduced-motion: no-preference` and `@supports (animation-timeline: view())`. The resting state is the visible state. No scroll-jacking, no scroll cues, no section counters beyond real chapter numbers.
- **Content rules.** Preserve career facts, case-study URLs, contact links, PDF/DOCX downloads, metadata and subpath portability. No invented numbers, no logos, no generated imagery, no mock interfaces. The one figure (the Claims Document Assistant pipeline) is an ordered list restating the project description.
- Existing resume documents keep their own layout. The web redesign does not change the PDF or Word output.
