/*
 * Workflow diffs: how the work went for a team before a project and after it. Every line restates a documented field
 * in career.json for that project (the source is noted per pair): "before" lines come from `challenge`, "after" lines
 * from `outcome`, `approach` or `metric`. The note says where the evidence for the after state comes from. These are
 * restatements of the record, not measurements.
 */
export type DiffPair = { before: string; after: string };
export type Diff = { pairs: DiffPair[]; note: string };

export const diffs: Record<string, Diff> = {
  "federal-quality-delivery-system": {
    pairs: [
      // challenge, outcome
      { before: "The VA side had no continuously updated claim status.", after: "Live claim status for VA staff, providers and veterans, by role." },
      // challenge, outcome
      { before: "Claims could stall without anyone knowing why.", after: "A claims framework notifies the right party when a claim needs extra work." },
      // challenge, outcome
      { before: "No single view of system and server health.", after: "Tableau dashboards give a full view of system and server health." },
    ],
    note: "After state is user-reported, not an independent benchmark.",
  },
  "ccrs-test-data-tooling": {
    pairs: [
      // challenge, outcome, metric
      { before: "Hours each day preparing test data by hand.", after: "Under 5 minutes for a full development database or up to 10,000 custom records." },
      // challenge, outcome
      { before: "A database kept up in every environment.", after: "Generated on demand, and the whole team uses it daily." },
      // challenge, outcome
      { before: "Production records can't be used in test environments.", after: "Realistic synthetic data developers rely on in place of production records." },
    ],
    note: "After state is user-reported, not an independent benchmark.",
  },
  "claims-document-assistant": {
    pairs: [
      // challenge, approach[0]
      { before: "Examiners read every submitted document by hand to find the fields.", after: "Claude extracts 17 fields from each claim PDF into a fixed schema." },
      // challenge, approach[1]
      { before: "Missing or wrong information is spotted by eye.", after: "Deterministic rules flag missing or invalid fields, not the model." },
      // challenge, approach[2], decisions[1]
      { before: "Replies to the billing office are written by hand.", after: "A reply is drafted, and nothing goes out until a reviewer approves it." },
    ],
    note: "Built and tested on synthetic claims. Extraction accuracy is not measured yet.",
  },
  "portfolio-career-content-system": {
    pairs: [
      // challenge, outcome
      { before: "Career facts had to match across a website and two resumes, without copying text into each.", after: "One validated record drives this site and every resume format in one publishing workflow." },
    ],
    note: "Public source. The build scripts are in the repository.",
  },
  "ecommerce-feedback-platform": {
    pairs: [
      // challenge, approach[3]
      { before: "Browser, API, visual and login checks ran as separate suites.", after: "Checks connected through reusable JavaScript tooling, GitHub Actions and AWS test environments." },
      // challenge, outcome
      { before: "The results were hard to trust as a whole.", after: "Evidence was there when someone had to investigate a failure or decide on a release." },
    ],
    note: "Documented responsibility. Employer repositories are private.",
  },
  "banking-risk-validation": {
    pairs: [
      // challenge, metric
      { before: "Customer journeys spanned many browsers, platforms and environments.", after: "Checks across Chrome, Firefox, Safari and Edge, and across development, QA, UAT and staging." },
      // challenge, approach[0], outcome
      { before: "Some scenarios carried more risk than others.", after: "Risk-based coverage, with clear evidence on customer risk and release readiness." },
    ],
    note: "Documented responsibility. No public banking code or data.",
  },
};

/*
 * The working loop drawn in the hero. Each station restates a documented Booz Allen Hamilton highlight in career.json
 * (the index into `highlights` is noted per station).
 */
export const loop = [
  // highlights[8]
  { label: "Listen", text: "Working sessions with claims processors and VA users on production issues." },
  // highlights[6]
  { label: "Define", text: "Requirements and acceptance criteria, mapped with VA stakeholders." },
  // highlights[0], highlights[2], highlights[5]
  { label: "Build", text: "Provider API integrations, React features and internal tools." },
  // highlights[10]
  { label: "Verify", text: "A reusable Playwright smoke and regression framework." },
  // highlights[7]
  { label: "Demo", text: "The stakeholder demo at the end of every release cycle since 2022." },
] as const;
