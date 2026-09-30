import records from '../content/career.json';
export const profile = records[0]!;

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
