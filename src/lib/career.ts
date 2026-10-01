import records from '../content/career.json';
export const veteransAffairsName = 'United States Department of Veterans Affairs';

function expandAgencyName(text: string): string {
  return text.replace(/U\.S\. Department of Veterans Affairs \(VA\)/g, veteransAffairsName)
    .replace(/\bVA\b/g, veteransAffairsName);
}

// Expand agency references for the website; retain compact source text for print.
// Only prose fields are mapped so locations, URLs, and identifiers stay intact.
const source = records[0]!;
export const profile = {
  ...source,
  summary: expandAgencyName(source.summary),
  detailedSummary: source.detailedSummary.map(expandAgencyName),
  experience: source.experience.map(role => ({
    ...role,
    summary: expandAgencyName(role.summary),
    customer: role.customer ? expandAgencyName(role.customer) : role.customer,
    highlights: role.highlights.map(expandAgencyName),
  })),
  projects: source.projects.map(project => ({
    ...project,
    name: expandAgencyName(project.name),
    context: expandAgencyName(project.context),
    description: expandAgencyName(project.description),
    challenge: expandAgencyName(project.challenge),
    audience: expandAgencyName(project.audience),
    approach: project.approach.map(expandAgencyName),
    systems: project.systems.map(expandAgencyName),
    relatedProjects: project.relatedProjects.map(related => ({ ...related, label: expandAgencyName(related.label) })),
  })),
};

export async function getCareerProfile() {
  return profile;
}

export function formatCareerDate(value: string | null): string {
  if (!value) return 'Present';

  const [year, month] = value.split('-').map(Number);
  if (!year || !month) return value;

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1)));
}
