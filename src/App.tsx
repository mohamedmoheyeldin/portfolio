import { Home, Work, CaseStudy, NotFound, Header, Footer } from '@/components/Portfolio';

import { profile } from '@/lib/career';
export const routes = ['/', '/experience/', ...profile.projects.map(p => `/experience/${p.slug}/`)];
export function routeInfo(path: string) {
  const project = profile.projects.find(p => path === `/experience/${p.slug}/`);
  const titles: Record<string,string> = {'/': profile.headline, '/experience/': 'Experience'};
  const title = project?.name ?? titles[path] ?? 'Page not found';
  return { title: `${title} — ${profile.name}`, description: project?.description ?? profile.summary, project };
}
export function App({path}: {path: string}) {
  const {project} = routeInfo(path);
  const content = path === '/' ? <Home profile={profile}/> : path === '/experience/' ? <Work profile={profile}/> : project ? <CaseStudy project={project}/> : <NotFound/>;
  return <><a className="skip-link" href="#main-content">Skip to content</a><Header name={profile.name} headline={profile.headline} location={profile.location} path={path}/><main id="main-content">{content}</main><Footer name={profile.name} headline={profile.headline}/></>;
}
