# Explaining the portfolio in an FDE interview

Companion to [interview preparation](INTERVIEW-PREPARATION.md). This walkthrough describes current local implementation, not production performance or customer adoption.

## 60-second explanation

“I built the portfolio around one structured career record so the website and resume formats share the same facts. The data is checked before the site builds. React renders the pages, and the build writes static HTML so the main content is available without waiting for client-side interaction. PDF and Word use a separate Python renderer because their layout needs differ from the website.

The important tradeoff is sharing facts while allowing each format its own presentation. I still need to review the outputs because a common source does not guarantee correct pagination or browser behavior. This is an independent engineering project; I do not claim a measured hiring outcome from its architecture.”

## Follow the actual source

| Step | Source | Explain | Evidence limit |
| --- | --- | --- | --- |
| Career facts | [career.json](../src/content/career.json) | Roles, dates, projects and concise/detailed fields | Recorded facts, not independent employment verification |
| Validation | [validate-content.mjs](../scripts/validate-content.mjs) | Structure, unique slugs, references and dated experience count | Consistency, not truth verification |
| Website adapter | [career.ts](../src/lib/career.ts) | Expands agency names in selected website prose | Presentation transformation, not a new career claim |
| Composition | [App.tsx](../src/App.tsx), [Portfolio.tsx](../src/components/Portfolio.tsx) | Shared layout and canonical Experience routes | Implemented structure, not exercised browser behavior |
| Rendering | [entry-server.tsx](../src/entry-server.tsx), [build.mjs](../scripts/build.mjs) | Static route HTML, metadata, sitemap and redirects | Core portfolio is prerendered, not a per-request application backend |
| Resumes | [generate-resumes.py](../scripts/generate-resumes.py) | Shared facts with dedicated PDF/Word formatting | Requires output and visual review |
| Portability | [check-pages-build.mjs](../scripts/check-pages-build.mjs) | Root and /portfolio/ link/asset packaging | Specific packaging checks, not all UI workflows |

## Design questions and defensible answers

### Why a shared record?

“The same facts appear in several places. Sharing the record reduces manual reconciliation. Each format still selects and presents content differently. I would validate both the source and generated output.”

**Follow-up:** What if the concise and detailed resumes need different wording?

“Use the existing compact and detailed fields for length while preserving the same role, dates, contribution and supported result. Shorter wording cannot imply a stronger claim.”

### Why static rendering?

“The core portfolio mainly presents content. Static HTML makes that content available without a server assembling each page on request, while React adds interaction. I would evaluate a backend separately when a workflow requires authenticated actions or persistent data.”

**Follow-up:** Does everything work without JavaScript?

“No. Static content and fallback links are different from the interactive project selector or Studio's temporary page state. I would verify each path separately.”

### Why a separate resume renderer?

“PDF and Word need document layout controls. The renderer shares content and theme inputs with the site, but it does not run React components. Text checks, PDF pagination and Word rendering are separate checks.”

**Follow-up:** Does a successful website build prove Word layout?

“No. It proves only the checks executed. Document rendering is needed for layout confidence.”

### What does validation establish?

“I would name the checks actually run and their results: TypeScript, content validation, Studio tests where present, production build and subpath packaging. I would separately identify browser interaction, accessibility, document rendering or live providers that were not exercised.”

**Follow-up:** Does the schema prove the facts?

“No. It checks structure and consistency. Career claims still need supporting evidence and my review.”

### How does Application Studio change the architecture?

“Studio is separate branch work adding temporary document workflows and an optional Worker API. Fictional demo records are separate from the career record. Private routes currently reject access; owner authentication and Google integration remain future work.”

**Follow-up:** Does implemented AI code prove the provider works?

“No. Code and configuration, mock-provider checks, a live request and verified customer outcomes are different evidence levels. I would not promote one to the next without checking.”

## Ten-minute source walkthrough

1. **Two minutes:** one project, its audience, personal contribution and disclosure.
2. **Two minutes:** the validator's checks and one thing it cannot establish.
3. **Two minutes:** follow content through rendering and the static build.
4. **Two minutes:** explain shared facts versus PDF/Word presentation.
5. **Two minutes:** discuss a change request, affected outputs and remaining uncertainty.

Use public-safe material. Avoid opening local secrets or employer evidence while sharing your screen.

## Rehearse a change request

**Interviewer:** “The concise resume and website show different job titles. What would you do?”

**Answer:** “I would compare the career record and both outputs to identify whether the difference came from source content, a transformation or a stale artifact. I would correct the responsible layer, regenerate the affected outputs and verify title, dates and customer context. I would use the verified historical title rather than improve the wording by changing the employment claim.”

**Challenge:** “Why not just edit the PDF?”

**Reply:** “A PDF-only edit leaves the source inconsistent and could be lost on regeneration. I would fix the source or transformation and verify the outputs.”

## Evidence before interview use

Record the branch and date of checks you actually ran. Separate local build success from deployment. Recheck implementation details while Studio work changes. Preserve the repository's no-auto-browser and no-publication workflow.
