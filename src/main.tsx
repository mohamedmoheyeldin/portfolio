import { createRoot, hydrateRoot } from 'react-dom/client';
import { App, routeInfo, routes } from './App';
import './styles/global.css';
const base = import.meta.env.BASE_URL.replace(/\/$/, '');
const path = (location.pathname.slice(base.length).replace(/\/$/, '') || '') + '/';
const route = routes.includes(path) ? path : '/404.html';
document.title = routeInfo(route).title;
const root = document.getElementById('root')!;
if (root.children.length) hydrateRoot(root, <App path={route}/>, {
  onRecoverableError: (error, info) => console.error('Hydration failed:', error, info.componentStack),
});
else createRoot(root).render(<App path={route}/>);
