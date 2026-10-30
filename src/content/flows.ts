/*
 * System diagrams for the three featured projects: the hero schematic (VA Claims Workflows) and the pipelines on the case studies. Every step restates a
 * documented `approach` or `systems` entry in career.json for that project (the source field is noted per step);
 * they are diagrams of the documented design, not screenshots or measurements.
 */
export type FlowStep = { title: string; text: string };
export type Flow = { caption: string; steps: FlowStep[]; beside?: FlowStep[] };

export const flows: Record<string, Flow> = {
  "federal-quality-delivery-system": {
    caption: "How claim status reaches each user, from the documented systems.",
    steps: [
      // systems[1], approach[2]
      { title: "Health-provider APIs", text: "Integrated with the VA system so claim status flows in continuously." },
      // systems[0]
      { title: "Claims platform", text: "Two frontends share one database: submission, provider updates, status, payment." },
      // systems[1], metric
      { title: "Live status by role", text: "VA staff, providers and veterans each see the status that applies to them." },
    ],
    beside: [
      // approach[3], decisions[3]
      { title: "Claims framework", text: "Notifies the right party when a claim needs extra work." },
      // approach[4], systems[2]
      { title: "Tableau dashboards", text: "Requests, system information and server health in one view." },
      // approach[7], systems[4]
      { title: "Playwright smoke and regression", text: "Reusable browser checks on the claims workflows." },
    ],
  },
  "ccrs-test-data-tooling": {
    caption: "One run, from template to environment, from the documented pipeline.",
    steps: [
      // systems[1], approach[0]
      { title: "Template and reference catalogs", text: "Facilities, care packages and payment codes keep values valid." },
      // approach[0], approach[1]
      { title: "Generate or process", text: "New referral batches, or rewrite existing files without touching the source." },
      // approach[3]
      { title: "Validate", text: "Schema checked before processing; outputs checked against the selected references." },
      // approach[2], systems[2]
      { title: "Package", text: "One master JSON, gzipped, with a SHA-256 checksum manifest." },
      // approach[4]
      { title: "Upload over SFTP", text: "Saved profiles, one target at a time, remote size checks and retries." },
    ],
    beside: [
      // approach[6], systems[3]
      { title: "Shipped like a product", text: "Versioned Windows installers from GitHub Actions; smoke, regression and end-to-end UI tests." },
    ],
  },
  "claims-document-assistant": {
    caption: "Where the model works and where rules and a person decide, from the documented design.",
    steps: [
      // approach[0]
      { title: "Claim PDF to Claude", text: "Sent as a document block; structured output fixed to a 17-field schema, null rather than a guess." },
      // approach[1], decisions[0]
      { title: "Deterministic rules", text: "Required fields, NPI check digits, ICD-10 and CPT formats, date order, amounts." },
      // approach[2]
      { title: "Draft a status reply", text: "Written from the rule findings, with a template fallback." },
      // approach[3], systems[3]
      { title: "Person reviews", text: "Approve, escalate or reject; corrections re-validated and logged." },
      // systems[3]
      { title: "Outbox", text: "Only approved replies are written out. Nothing is sent automatically." },
    ],
    beside: [
      // approach[5], outcome
      { title: "Evaluation set", text: "60 labelled synthetic claim PDFs in three layouts; 26 tests run without an API key." },
    ],
  },
};
