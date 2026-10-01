import { Home, Work, Resume, CaseStudy, NotFound, Header, Footer } from '@/components/Portfolio';

import { profile } from '@/lib/career';
import { ApplicationStudio } from '@/components/ApplicationStudio';
import { studioSections } from '@/lib/studio';
const studioRoutes = studioSections.map(([key]) => `/application-studio/${key === 'overview' ? '' : `${key}/`}`);
export const routes = ['/', '/experience/', '/resume/', ...studioRoutes, ...profile.projects.map(p => `/experience/${p.slug}/`)];
export function routeInfo(path: string) {
  const project = profile.projects.find(p => path === `/experience/${p.slug}/`);
  const titles: Record<string,string> = {'/': profile.headline, '/experience/': 'Experience', '/resume/': 'Resume'};
  const title = project?.name ?? titles[path] ?? (studioRoutes.includes(path) ? 'Application Studio' : 'Page not found');
  return { title: `${title} — ${profile.name}`, description: studioRoutes.includes(path) ? 'Prepare application documents, explore fictional job-search workflows, and learn about secure AI and Google connections in Application Studio.' : project?.description ?? profile.summary, project };
}
export function App({path}: {path: string}) {
  const {project} = routeInfo(path);
  const content = studioRoutes.includes(path) ? <ApplicationStudio path={path}/> : path === '/' ? <Home profile={profile}/> : path === '/experience/' ? <Work profile={profile}/> : path === '/resume/' ? <Resume/> : project ? <CaseStudy project={project}/> : <NotFound/>;
  return <><a className="skip-link" href="#main-content">Skip to content</a><Header name={profile.name} location={profile.location} path={path}/><main id="main-content">{content}</main><Footer name={profile.name}/></>;
}
