# Scrollcraft brief: the casebook (portfolio-deck)

**Self-authored under explicit creative delegation** (user instructions, 2026-10-30: "complete reinvention", "you have my authorization to make substantial design and technical decisions independently"). Facts come only from `src/content/career.json`. Nothing here is a user quotation. The build folder is `C:\Projects\scrollcraft\workspace\builds\portfolio-deck`.

## The eight topics

1. **Vibe:** calm, exact, credible, quietly engineered. References: a stack of case files on a reviewer's desk; an engineering notebook with tabbed sections; a test report you can trust at a glance.
2. **Journey:** who he is and what he does, then three cases in depth, then the supporting work, then the career, then what he brings, then the next step.
3. **Energy:** a confident open, the most weight in the cases, a brisk run of supporting work, a steady career, a practical capabilities act, a settled close.
4. **Feeling and the one moment:** oriented, convinced, reassured, grounded, equipped, invited. The moment: the third case sheet lands and the row of tabs above it has become an index of everything just read.
5. **One thing no site does:** case studies that stack like folders and leave their tabs behind, so reading the work builds its own table of contents.
6. **Range:** premium technical minimalism, cooler and lighter than the earlier builds. No glass beyond the floating header, no gradient text, no grid texture, one signal colour.
7. **One world or scenes:** distinct scenes, with the deck as the one held space.
8. **Assets:** none photographic (repo rule: no logos, no branded imagery, no mock interfaces). Credential badges on Experience only.

## Grammar: case deck (new)

The page is a deck of sheets on a ground. The cover introduces the person and shows the sheet tops; the cases are laid one over another and held; supporting material follows in flow; the close is the last sheet laid down. The chrome is a floating island that marks where you are. Sticky stacking is the only held device, and it holds content the visitor reads, never an empty pin.

**Forbids:** scrub video or any full-bleed media; a command palette or app chrome as navigation; inverted or collapsing plates for the close; a name at poster or composition scale; chapter numbers or a folio; scroll-jacking; pinning anything that is not a sheet.

Why the others lost: filmic one-shot and continuous world need footage or geography; rhythmic cutlist is the wrong energy for hiring evidence; gallery, chaptered editorial, typographic poster, live surface, split stage and change review are taken (FINGERPRINTS rows 1 to 6).

## Signature move: the case deck

Sticky case sheets with folder tabs at fixed thirds of the row. Each passed sheet leaves its tab visible above the current one, and each tab returns to its sheet through an in-flow anchor. A measured guard (`initDeck` in `enhance.ts`) stacks only where every sheet fits. Bespoke to this build: no prior row stacks content or builds an index from what has been read.

## Fingerprint gate

| Dimension | This build | Gallery | Editorial | Poster | Workbench | Split | Diff |
|---|---|---|---|---|---|---|---|
| Grammar | Case deck | differs | differs | differs | differs | differs | differs |
| Nav | Floating island with section marking; phone popover | similar (top bar) | differs | differs | differs | differs | similar (top bar) |
| Hero | Claim-first cover with the case tabs on its bottom edge | differs | differs | differs | differs | differs | differs |
| Act shape | 6 acts, one held stack: in, stack (peak), flow, draw, in, rise | differs | differs | differs | differs | differs | differs |
| Close | Last sheet laid on the deck, address as the action, same surface as the cases | differs | differs | differs | differs | differs | differs |
| Signature | Case deck with retained tabs | differs | differs | differs | differs | differs | differs |

At least 5 of 6 against every row. Passes.

## Feeling curve and score

| Act | Feeling | Cause | Device |
|---|---|---|---|
| Cover | Oriented | The claim, the facts and three case tabs already in view | `in` (load) |
| Selected work (peak) | Convinced | Sheets laid one over another; tabs accumulate into an index | sticky stack, the largest span |
| Supporting work | Reassured | Three more results with their evidence, quickly | `flow` + rise |
| Career | Grounded | Three roles on a rail that draws as it passes | draw |
| What I bring | Equipped | Six capabilities and the toolkit | `in` |
| Close | Invited | The last sheet: one address, one action, every file | rise, then holds |

The peak holds the most scroll (three viewport-height sheets plus pauses and a hold on the complete index). No two adjacent acts share a feeling.

**The tell-someone sentence:** "It's the site where the case studies stack like folders, and the tabs you've passed stay up top as a table of contents."
