# Scrollcraft brief: the split (portfolio-split)

**Self-authored under explicit creative delegation** (user instructions, 2026-10-30: "complete reinvention", "full authorization to make substantial design and technical decisions independently"). Facts come only from `src/content/career.json`. Nothing here is a user quotation.

## The eight topics

1. **Vibe:** calm, exact, two-handed, credible. References: an engineering drawing's title block; a well-run design review where the customer and the engineer sit on either side of one table.
2. **Journey:** who he is and both halves of his work at once, then the work as evidence, then the career that produced it, then what he brings, then one way to reach him.
3. **Energy:** calm open, the most intensity in the work, a quiet career, a brisk capabilities act, a decisive close.
4. **Feeling and the one moment:** oriented, convinced, grounded, equipped, invited. The moment: pressing "Test this page" and watching the page run real checks on itself.
5. **One thing no site does:** the portfolio of a quality engineer tests itself, live, in the visitor's browser, and reports what it found.
6. **Range:** premium-minimal with a technical, drafted edge. No glow, no glass, no gradients.
7. **One world or scenes:** distinct scenes held on one split. Not a continuous world.
8. **Assets:** none photographic (repo rule: no logos, no branded imagery). Credential badge images on Experience only. Type, rules and two grounds do the work.

## Grammar: split stage

Two columns held for the whole page. **People** (left, warm paper ground): who it was for, what they needed, how he worked with them. **Systems** (right, cool blue-tinted ground): what was built, how it works, how it was checked. The positioning line already has two halves: "Built with the people who use it. Tested before they do." The divider is the chrome: it carries both labels. The close collapses the divider and the People side takes the full width for the one action.

Why the others lost: filmic one-shot needs footage and argues one thing; chaptered editorial, typographic poster, gallery and live surface are taken (FINGERPRINTS rows 1 to 4); continuous world has no geography here; rhythmic cutlist is wrong energy for hiring evidence.

Adaptations, stated: a static (non-pinned) seam, because a pinned divider makes long case content unreadable on a phone. A slim static header carries Work, Experience, Contact and the resume for recruiters who will not scroll.

## Signature move

**Test this page.** A button on the Systems side of the hero (and in the footer) runs real assertions against the rendered page in the visitor's browser: one h1 and no skipped heading levels, alt text on every image, an accessible name on every link and button, no duplicate ids, every in-page link has a target, both resumes respond, text contrast on both grounds measured from computed colors, no horizontal overflow, touch targets at least 24px, layout shift so far, largest contentful paint, transferred page weight, reduced-motion respected, document language and description present. Results list with pass or fail and the measured value. Without JavaScript the list states what would be checked.

## Journey and feeling curve

| Act | Beat | Feeling | Cause |
|---|---|---|---|
| 1 Split title | Recognition | Oriented | Name, role, both halves readable at once; the halves enter from their own sides |
| 2 Selected work | Substance (peak) | Convinced | Three projects as full splits: need on the left, system diagram and result on the right; three more as compact rows. Largest span |
| 3 Career | Grounding | Grounded | The seam becomes the time axis; who each role served left, what it built right |
| 4 Capabilities | Range | Equipped | Two short lists, People and Systems, and the credential count |
| 5 Close | Commitment | Invited | The seam slides to the edge, People takes the width, "Email me" |

Peak: act 2. Tell-someone sentence: "It's the site where the QA engineer's portfolio tests itself while you watch."

Silence: none authored.

## Score

| Act | Device | Why |
|---|---|---|
| 1 | `in` from opposite edges (load) | The split is the format; each half arrives from its side |
| 2 | `reveal` (seam draws down each project) + diagrams | Each project is a change of state from need to system |
| 3 | `flow` with the seam as a time axis (scroll-driven year marks) | A career reads as a line, not a list |
| 4 | static, two columns | A quiet act before the close |
| 5 | collapse: seam translates to the edge, Systems ground clips away (scroll-driven) | The ending is the resolution of the split |

Act count 5, short page (about 9 to 11 viewport heights at 1440x900). Native CSS only, inside `prefers-reduced-motion: no-preference` and `@supports (animation-timeline: view())`; the resting state is the visible state.

## Fingerprint gate

Against every row in `C:\Projects\scrollcraft\workspace\FINGERPRINTS.md` (six dimensions: grammar, nav, hero, act sequence, close, signature):

| Prior build | Differs on | Shared |
|---|---|---|
| portfolio-gallery | 5 of 6 | Nav: both use a top bar (this one is static at the top of the split and carries the seam labels, with a popover menu on phones) |
| portfolio-editorial | 6 of 6 | none |
| portfolio-poster | 6 of 6 | none |
| portfolio-workbench | 6 of 6 | none |

Every row clears the 4-of-6 bar. What this build claims: the split stage grammar with People and Systems grounds, the seam as chrome, a name that crosses the seam, the collapse close, and a page self-test as the signature.

## Research that shaped it

Patterns, not copies: Linear and Vercel (restraint, one accent, mono labels for data, hairlines over cards), Stripe (diagrams as ordered steps beside prose rather than illustrations), Raycast (a product surface people can actually operate), engineering portfolios that lead with evidence. The self-test answers Scrollcraft's "one thing no site does" for a quality engineer: the page proves the habit live instead of describing it.

## Feel check (from the screenshots, after the build)

Title: oriented. Work: convinced (the diagrams and evidence labels carry it; it is the longest act, as planned). Career: grounded. Capabilities: equipped. Close: invited, and it resolves rather than fading. Changed after the check: the result box leads the Systems band on phones; the role line under the name is held to the People side so it never runs across the seam; header actions trimmed so the bar never overflows at 1440px.
