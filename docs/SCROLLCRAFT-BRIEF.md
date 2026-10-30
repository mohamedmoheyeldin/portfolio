# Scrollcraft brief: the diff (portfolio-diff)

**Self-authored under explicit creative delegation** (user instructions, 2026-10-30: "complete reinvention", "you have my authorization to make substantial design and technical decisions independently"). Facts come only from `src/content/career.json`. Nothing here is a user quotation. The build folder is `C:\Projects\scrollcraft\workspace\builds\portfolio-diff`.

## The eight topics

1. **Vibe:** precise, warm, engineered, confident. References: a well-written pull request; an instrument panel with one signal light; an engineering drawing's grid.
2. **Journey:** who he is and how he works, then what changed for the people using his work, then the career behind it, then what he brings, then one way to reach him.
3. **Energy:** a strong open, the most intensity in the work, a calm career, a brisk practices act, a decisive close.
4. **Feeling and the one moment:** oriented, convinced, grounded, equipped, invited. The moment: reading a project as a diff and seeing the old way of working struck out line by line and replaced.
5. **One thing no site does:** a portfolio that shows each project as a diff of how a team worked before and after it, every line traceable to the record.
6. **Range:** premium technical minimalism. No glass, no gradient text, one grid texture, one signal colour.
7. **One world or scenes:** distinct scenes. Not a continuous world.
8. **Assets:** none photographic (repo rule: no logos, no branded imagery). Credential badges on Experience only.

## Grammar: change review (new)

The page reads like a reviewed change. A summary first (the hero: who, what, how he works), then the changes (projects as workflow diffs with their evidence), then the history (the career log), then the practices, then the ask. The chrome is a developer tool's: a sticky bar and a command palette that indexes everything. Section labels are plain words, not chapter numbers.

**Forbids:** split grounds or a seam; chapter intertitles or a margin folio; poster-scale type beyond the hero name; app sidebars and status bars; pinning; a close that collapses or inverts the page's structure.

Why the others lost: filmic one-shot needs footage; continuous world has no geography here; rhythmic cutlist is the wrong energy for hiring evidence; chaptered editorial, typographic poster, gallery, live surface and split stage are taken (FINGERPRINTS rows 1 to 5).

## Signature move: the workflow diff

Each project's before and after, set as a diff with a Before / Diff / After control and paired-line highlighting (`src/content/diffs.ts`, `WorkflowDiff` in `ui.tsx`, `initDiffs` in `enhance.ts`). Bespoke to this build; no prior row restates projects as diffs.

## Fingerprint gate

| Dimension | This build | Gallery | Editorial | Poster | Workbench | Split |
|---|---|---|---|---|---|---|
| Grammar | Change review | differs | differs | differs | differs | differs |
| Nav | Sticky bar + command palette | differs | differs | differs | differs | differs |
| Hero | Name, claim, facts row, working-loop rail | differs | differs | differs | differs | differs |
| Act shape | 5 acts, no pins: in, reveal (peak), draw, in, static plate | differs | differs | differs | differs | differs |
| Close | Dark contact plate with copyable address card and files | differs | similar (plate) | similar (plate) | differs | differs |
| Signature | Workflow diff | differs | differs | differs | differs | differs |

At least 5 of 6 against every row. Passes.

## Feeling curve and score

| Act | Feeling | Cause | Device |
|---|---|---|---|
| Hero | Oriented | Name, claim and the five-station loop with a signal that runs it twice | `in` (load) + drawn rail |
| Work (peak) | Convinced | Each project's old way of working struck out and replaced, with the evidence named | `reveal` per diff line, largest span |
| Career | Grounded | Three roles on a rail that draws down as it passes | draw |
| How I work | Equipped | Practices and tools arrive as a grid | `in` |
| Close | Invited | The dark plate: one action, the address to copy, every file | static plate |

The peak is the work section: it holds the most scroll and the only interactive control in the page body.

**The tell-someone sentence:** "It's the site where every project is shown as a diff of how the team worked before and after."
