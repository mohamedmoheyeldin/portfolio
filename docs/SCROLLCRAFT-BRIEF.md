# Scrollcraft brief: the workbench redesign

> [!NOTE]
> Self-authored under explicit creative delegation. On 2026-10-30 the owner pasted a full reinvention brief ("complete design freedom", "do not preserve the current UI simply because it exists") and, asked whether to refine the poster build or start again, chose "Start a fourth redesign". No interview answers or quotations are invented here. Every fact on the page comes from `src/content/career.json`.

This is the fourth Scrollcraft build on `NewIU` (`scroll-craft` 0.3.1, upstream `75d81f7`). It replaces the typographic poster, which replaced the editorial build, which replaced the gallery build. All three are rows in the fingerprint registry (`C:\Projects\scrollcraft\workspace\FINGERPRINTS.md`) and this build is gated against each.

## The eight topics (authored decisions)

| Topic | Decision |
|---|---|
| Vibe | Precise, calm, operable. A well-made engineering tool, opened on a career. References: a code review with its annotations shown, an instrument datasheet, a release checklist. |
| Journey | Who this is, the work, how it is done, the career, the stack, then a message. |
| Energy | Calm and dense at the open, rising through the project documents to the rule-check demo, level through the practice and career, precise at the stack, still at the composer. |
| Feeling and the one moment | See the feeling curve. The moment: breaking a claim on purpose and watching the rules catch it and redraft the reply. |
| One thing no other site does | Shows, beside every claim on the page, the field of the career record it comes from and how that claim is evidenced. |
| Range | Dense and information-forward, with the restraint of good product UI. Not a poster, not editorial, not dark premium-minimal. |
| One world or scenes | One surface (a sidebar, a main column, a status bar) with sections that are views inside it. |
| Assets | None to generate (kie.ai is not used; the repo forbids generated artwork, logos and mock interfaces). Real assets: the career record, the case studies, the public repositories' documented rules, the official credential badges. |

## Grammar: live surface

The page behaves like a tool. The sidebar, the status bar and the panels are real navigation and real state, and copy lives in the surface's idiom: properties, paths, statuses, empty and loading states.

The honesty rule is the constraint that makes this grammar available. Every operable panel computes its state in the page: the inspector reads the career record's fields, the work index and stack matrix are computed from `technologies` and `metric`, the rule-check demo runs seven deterministic checks on a synthetic claim, and the batch demo generates synthetic rows and checksums them with the browser's own crypto. Both demos say on their face that they restate the project's documented rules on synthetic data and are not the project's code. Nothing is a painting of an interface.

Why the others lost:

- **Gallery / catalog**, **chaptered editorial** and **typographic poster** are the three previous builds.
- **Filmic one-shot** and **continuous world** need footage or a generated world. There is none, by rule.
- **Split stage** needs one two-sided argument; a career is not a before and after.
- **Rhythmic cutlist** suits energy brands; hard short cuts would hide the evidence a hiring manager reads for.

Grammar rules kept: app chrome replaces marketing chrome (no wordmark-plus-CTA bar, no scrims, no kinetic headline stacks, no display type above about 4.75rem); no `scrub`, `kinetic`, `spotlight`; the close is an actual input. One stated deviation: the first screen carries a plain-language claim and three actions beside the profile panel, because a recruiter must understand the person in seconds; it is still the surface in a state, not a title over media.

## Journey

1. **Recognition.** Name, role, claim, the three actions, and the profile record open beside them (overview).
2. **Overview of proof.** All six projects in one table: result and evidence source (work index).
3. **Proof (peak).** Six project documents with properties, problem, what I did, decisions and evidence; the Claims Document Assistant and Data Generator documents carry working demos (work).
4. **Method.** Five stages of how the work is done, drawn as a pipeline, each tied to a project (how I work).
5. **Trajectory.** A time axis of the three roles, then each role (career).
6. **Range.** Every tool the projects name against the six projects, plus the rest of the toolkit (stack).
7. **Commitment.** A message composer addressed to me, the direct routes, the audit offer (contact).

## Feeling curve

| Act | Feeling | What causes it |
|---|---|---|
| Overview | Oriented | The person, the claim and the record are on one calm screen; the inspector is offered once |
| Work index | In control | Six rows, one glance: what each project achieved and how you could check it |
| Project documents | Absorbed, then **convinced** (peak) | Real problems and decisions; then you break a claim and the rules catch it |
| How I work | Clear | Five stages in a line, each linked to the place it shows |
| Career | Grounded | Proportional bars on a real time axis, newest role in blue |
| Stack | Precise | A dot matrix that answers "where did he use X" without searching |
| Contact | Invited | A cursor in a message field, already addressed and titled |

**The peak**, as a visitor would say it: "There's a demo where you break a claim and it catches it and rewrites the reply." It lives in the work, the longest act by a wide margin.

**Tell-someone sentence:** It's the site where you can check where every claim comes from, and try the work yourself.

**Authored silence:** the 20 to 25% of each section's top padding is deliberate air between views, not dead scroll.

## Score

| Act | Device | Why this one |
|---|---|---|
| Overview | `surface` (static state, staggered settle on load) | The tool is already open; nothing to wait for |
| Work index | `index` (table with jump rows) | A table is the honest shape of six comparable things |
| Project documents | `document` + `in` (rise on a `view()` timeline) + the demos | Documents arrive one at a time; the demos are the operable peak |
| How I work | `pipeline` (connectors draw on scroll) | A process reads as a line between stages |
| Career | `timeline` (bars grow from their start month) | Duration is the information |
| Stack | `matrix` (dots settle as the table enters) | A two-axis question gets a two-axis answer |
| Contact | `input` (still) | The page ends by handing over a cursor |

Seven acts, no pins, no scrub. Adjacent acts never share a device or a feeling.

## Signature move: the provenance inspector

"Inspect sources" (in the profile panel, the status bar and the phone top bar; Esc closes it) prints a tag beside every fact on the page: the career-record field it is rendered from (for example `projects.claims-document-assistant.metric.value`) and its evidence (public source, user-reported, documented responsibility, career record, verified credential). The status bar totals the facts on the page by evidence. Facts are wrapped in `<Fact>` in the components, so the tags cannot drift from what is rendered. It has nothing to do with the kit's devices, and none of the earlier builds annotated their own claims.

## Fingerprint gate

| Dimension | This build | vs gallery | vs editorial | vs poster |
|---|---|---|---|---|
| Grammar | Live surface | differs | differs | differs |
| Nav treatment | App sidebar with outline, pages and projects; status bar; phone top bar with a menu sheet | differs | differs | differs |
| Hero device | The surface in a state: identity and claim beside an open profile record | differs | differs | differs |
| Act-sequence shape | 7 acts, no pins: surface, index, document + in + demos, pipeline, timeline, matrix, input | differs | differs | differs |
| Close pattern | An actual input: a message composer that opens the visitor's email app, plus direct routes | differs | differs | differs |
| Signature move | Provenance inspector | differs | differs | differs |

6 of 6 against each row. Shared with earlier rows: a static React site, blue as the one hue, no photographic media (repo rules).

## Verification

See `TESTING.md` (workbench build) for the functional, accessibility, screenshot and overflow results.
