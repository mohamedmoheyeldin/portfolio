# Scrollcraft brief for the portfolio

> [!NOTE]
> Self-authored under explicit creative delegation. The owner asked for a full redesign that applies the Scrollcraft skill (`C:\Projects\scrollcraft\scroll-craft\SKILL.md`, revision `0b81622`) and left the design decisions to the agent. No interview quotes are invented here.

## How Scrollcraft was applied

Scrollcraft is built for marketing landing pages: generated photographic worlds, scrubbed video, and its own `scrollcraft.js` engine. This site's rules (see [CLAUDE.md](../CLAUDE.md)) exclude generated artwork, mock illustrations, logos, and new dependencies, and require Untitled UI components, light and dark themes, and a no-JavaScript fallback. So the asset pipeline (`kie.mjs`, `encode.sh`), the engine, and the doctor and workspace scripts were not used. The skill files were read and left unchanged.

What was adopted:

- **The taste floor** (`references/taste.md`): no section counters, at most one eyebrow per three sections, no visible em dashes in page copy, varied anchors instead of centring every section, one accent, no glass or glow as decoration, no coloured `border-left` callouts, a hero with at most four text elements and the trust strip moved out of it, one label per intent ("Email me" everywhere), hover motion only for fine pointers, ease-out curves under 300 ms, and themed browser surfaces (accent, caret, scrollbar).
- **Device variety** (`references/devices.md`): each home section uses a different motion device, and no device repeats back to back. Every device is native CSS (`animation-timeline: view()` / `scroll()`, `position: sticky`), runs only under `prefers-reduced-motion: no-preference` and only where supported, and never hides content.
- **One signature move** (`references/uniqueness.md` section 3), coded in the page.

## Grammar

**Gallery / catalog**, adapted. The visitor's real question on a portfolio is "what has this person done", and the projects are a collection: every project card uses the same label schema (result, problem, what I did, my role, built with, links), like labels in a museum.

Why the others lost: *filmic one-shot* and *continuous world* need generated footage the site rules forbid; *live surface* would need a real running product, and fake dashboards are banned; *typographic poster* drops the evidence a recruiter needs; *split stage* needs a two-sided argument the site does not have; *rhythmic cutlist* suits energy brands, not a hiring decision; *chaptered editorial* was the runner-up, but it bans a fixed navigation bar, which a multi-page site with a resume menu needs.

## Journey

1. **Recognition.** Who he is and what he builds (hero).
2. **Trust.** Where he has worked and what is verified (trust strip).
3. **Proof (peak).** The FDE requirements, each matched to real work (role fit).
4. **Substance.** The projects, problem to result (selected work).
5. **Method.** How he works (how I work).
6. **Range.** Tools and the audit offer (toolkit, work with me).
7. **Commitment.** Email me, resume, LinkedIn (contact band).

## Feeling curve

| Act | Feeling | What causes it |
|---|---|---|
| Hero | Oriented | Dark band, two-line claim, the hiring snapshot as the front plane; planes leave at different rates |
| Trust strip | Reassured | Real employers and verified credentials, overlapping the hero's edge |
| Role fit (peak) | Convinced | Each proof row ticks its line in the ledger card as it passes |
| Selected work | Curious | Project labels wipe open with the result leading |
| How I work | Calm | The heading holds still while four numbered steps pass |
| Toolkit, work with me | Practical | Plain overview, then the offer |
| Contact | Resolved | A dark closing band with one action label |

**The peak:** role fit. It has the most scroll room on the page and the only bespoke interaction.

**Tell-someone sentence:** "It's the site where the hiring checklist ticks itself off as you read the proof."

## Score

| Beat | Device | Why |
|---|---|---|
| Hero | `parallax` (three planes) + entrance stagger | Depth from planes moving at different rates, not from glow |
| Trust | `overlap` (static) | Crossing the hero's edge links trust to the claim |
| Role fit | `pin` + signature ledger | The card holds while the proof rows move past it |
| Selected work | `reveal` (clip-path wipe) | Opening a label is a change of state |
| How I work | `pin` (split stage) | Holding the heading makes the steps read as a sequence |
| Toolkit, work with me | `in` (rise) | Quiet after the peak |
| Contact | Static close | The page stops moving and holds the action |

## Signature move

The **role-fit ledger**. Each requirement row on the left defines a named CSS view timeline (`view-timeline-name`), the section sets `timeline-scope`, and each line in the sticky "Hiring for one of these?" card animates on that row's timeline. As a row crosses the middle of the screen, its line in the card ticks on. By the end of the section the card is a complete checklist next to the "Send a job description" button. Without support, with reduced motion, or without JavaScript, every line shows as ticked.

## Not verified

- Real phones (iOS Safari and Android Chrome). The checks used the desktop app's browser at phone, tablet, and desktop sizes.
- Scrollcraft's `shoot.mjs` harness, which needs its own Playwright setup and a Scrollcraft engine page.
