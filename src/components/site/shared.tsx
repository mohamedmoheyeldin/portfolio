import { profile as careerProfile, veteransAffairsName } from "@/lib/career";

export type Profile = typeof careerProfile;
export type Project = Profile["projects"][number];
export type Role = Profile["experience"][number];

export const emailAddress = "mohamedmoheyeldin.jobs@gmail.com";
export const email = `mailto:${emailAddress}`;
export const roleEmail = `${email}?subject=${encodeURIComponent("Forward Deployed Engineer role")}`;
export const linkedInUrl = "https://www.linkedin.com/in/moheyeldin/";
export const gitHubUrl = "https://github.com/mohamedmoheyeldin";
export const root = `${import.meta.env.BASE_URL.replace(/\/?$/, "")}/`;
export const href = (path = "") => `${root}${path}`;
export const resumeFile = (version: "one-page" | "detailed", format: "pdf" | "docx") => href(`resume/mohamed-moheyeldin-resume-${version}.${format}`);
export const caseStudyHref = (project: Project) => href(`experience/${project.slug}/`);

/** A section of the current page, listed in the index sheet. */
export type Chapter = { id: string; label: string };

export function projectDisplayName(project: Project) {
  if (project.slug === "ecommerce-feedback-platform") return "E-commerce Quality Feedback Platform";
  if (project.slug === "banking-risk-validation") return "Banking Risk-Based Validation System";
  return project.name.replace(veteransAffairsName, "VA");
}

/**
 * The one verb that names what I did on each project, set at poster scale over its spread. Each restates the first
 * clause of the project's description in career.json; it is a label, not a new claim.
 */
const projectVerbs: Record<string, string> = {
  "federal-quality-delivery-system": "Integrated",
  "ccrs-test-data-tooling": "Generated",
  "claims-document-assistant": "Extracted",
  "portfolio-career-content-system": "Published",
  "ecommerce-feedback-platform": "Connected",
  "banking-risk-validation": "Validated",
};
export const projectVerb = (project: Project) => projectVerbs[project.slug] ?? "Built";

export const roleFor = (project: Project) => careerProfile.experience.find((role) => role.id === project.experienceId);

/** Where the evidence for a project's result comes from, stated plainly. Derived from the record, never asserted. */
export function evidenceSource(project: Project) {
  if (project.metric?.label.includes("user-reported")) return "User-reported";
  if (project.repositoryVisibility === "public") return "Public source";
  return "Documented responsibility";
}

/** The metric label without the trailing "(user-reported)" note, which the evidence label already carries. */
export const metricLabel = (project: Project) => project.metric?.label.replace(/\s*\(user-reported\)/, "") ?? "";

/** Short employer and context line for a project. */
export function projectContext(project: Project) {
  const role = roleFor(project);
  return role ? `${role.employer}${role.customer ? `, for the ${role.customer.replace(veteransAffairsName, "VA")}` : ""}` : "Independent project";
}

/** Tool names compare case-insensitively, so "GitHub Actions" in a project and in a skill group are one entry. */
export const toolKey = (name: string) => name.trim().toLowerCase();
