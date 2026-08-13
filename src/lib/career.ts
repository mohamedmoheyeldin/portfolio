import { getEntry } from 'astro:content';

export async function getCareerProfile() {
  const profile = await getEntry('career', 'profile');

  if (!profile) {
    throw new Error('The canonical career profile is missing.');
  }

  return profile.data;
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
