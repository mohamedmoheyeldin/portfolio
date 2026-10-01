export const studioSections = [
  ["overview", "Overview"],
  ["documents", "Resume & cover letter"],
  ["inbox", "Inbox"],
  ["profile", "Career profile"],
  ["rules", "Email automation rules"],
  ["connections", "Connections"],
] as const;
export const sampleProfile = {
  name: "Alex Morgan",
  headline: "Customer-focused software engineer",
  experience:
    "Application development, REST API integration, SQL troubleshooting, and stakeholder demonstrations.",
};
export type ExperienceEntry = {
  id: string;
  kind: "job" | "project";
  title: string;
  organization: string;
  start: string;
  end: string;
  details: string;
};
export const sampleExperience: ExperienceEntry[] = [
  {
    id: "sample-job",
    kind: "job",
    title: "Software Engineer",
    organization: "Example Systems (sample)",
    start: "Sep 2022",
    end: "Present",
    details:
      "Contributed React application features. Worked with stakeholders to clarify acceptance criteria and validate changes.",
  },
  {
    id: "sample-project",
    kind: "project",
    title: "Internal data preparation tool",
    organization: "Example Systems (sample)",
    start: "2023",
    end: "2024",
    details:
      "Built a tool to prepare application data and simplify recurring manual workflows.",
  },
];
export function formatExperience(entries: ExperienceEntry[], skills: string) {
  const sections = entries
    .filter(
      (entry) =>
        entry.title.trim() || entry.organization.trim() || entry.details.trim(),
    )
    .map((entry) => {
      const heading = [
        entry.title.trim() || (entry.kind === "job" ? "Job" : "Project"),
        entry.organization.trim(),
      ]
        .filter(Boolean)
        .join(" — ");
      const dates = [entry.start.trim(), entry.end.trim()]
        .filter(Boolean)
        .join(" – ");
      return [
        entry.kind === "job" ? "JOB" : "PROJECT",
        heading,
        dates,
        entry.details.trim(),
      ]
        .filter(Boolean)
        .join("\n");
    });
  if (skills.trim()) sections.push(`SKILLS\n${skills.trim()}`);
  return sections.join("\n\n");
}
export type DraftInput = typeof sampleProfile & {
  company: string;
  role: string;
  job: string;
  kind: string;
};
export function createDraft(input: DraftInput) {
  const name = input.name.trim() || "Your name";
  const role = input.role.trim() || "an engineering role";
  const company = input.company.trim() || "your team";
  if (input.kind === "resume")
    return `${name}\n${input.headline}\n\nEXPERIENCE & SKILLS\n${input.experience}\n\nTARGET ROLE\n${role}${input.company.trim() ? ` at ${company}` : ""}\n\nReview dates, contact information, and accomplishments before submitting.`;
  return `Dear Hiring Team,\n\nI am interested in ${role} with ${company}. ${input.headline ? `My background is in ${input.headline.toLowerCase()}.` : ""}\n\n${input.experience}\n\nI would welcome a conversation about your team's priorities and how my experience can contribute. Thank you for considering my application.\n\nSincerely,\n${name}`;
}
