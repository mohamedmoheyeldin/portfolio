import { Home, Work, CaseStudy, NotFound } from '@/components/Portfolio';
import { profile } from '@/lib/career';

export const routes = ['/', '/experience/', ...profile.projects.map(p => `/experience/${p.slug}/`)];
export function routeInfo(path: string) {
  const project = profile.projects.find(p => path === `/experience/${p.slug}/`);
  const titles: Record<string,string> = {'/experience/': 'Experience'};
  const title = path === '/' ? `${profile.name}, ${profile.headline}` : `${project?.name ?? titles[path] ?? 'Page not found'} · ${profile.name}`;
  // Search snippets are cut near 160 characters, so the two index pages carry their own short summaries.
  const descriptions: Record<string,string> = {
    '/': `${profile.headline} with ${profile.experienceYears} years in software and quality engineering: API integration, internal tools, and automated release checks across federal healthcare, banking, and e-commerce.`,
    '/experience/': `Roles, projects, skills, and verified credentials of ${profile.name}, ${profile.headline}.`,
  };
  return { title, description: project?.description ?? descriptions[path] ?? profile.summary, project };
}
export function App({path}: {path: string}) {
  const {project} = routeInfo(path);
  return path === '/' ? <Home profile={profile}/> : path === '/experience/' ? <Work profile={profile}/> : project ? <CaseStudy project={project}/> : <NotFound/>;
}
