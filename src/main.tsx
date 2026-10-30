import './styles/site.css';

// Production pages are prerendered HTML (scripts/build.mjs); the browser only runs the enhancement script. The dev
// server has no prerender step, so in development the page is rendered here first. Vite drops this branch from
// production builds, so React is never shipped.
if (import.meta.env.DEV) {
  const [{ createRoot }, { App, routeInfo, routes }] = await Promise.all([import('react-dom/client'), import('./App')]);
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const path = (location.pathname.slice(base.length).replace(/(?:\/index\.html|\/)$/, '') || '') + '/';
  const route = routes.includes(path) ? path : '/404.html';
  document.title = routeInfo(route).title;
  const root = document.getElementById('root')!;
  const { flushSync } = await import('react-dom');
  const reactRoot = createRoot(root);
  flushSync(() => reactRoot.render(<App path={route}/>));
}
await import('./client/enhance');
