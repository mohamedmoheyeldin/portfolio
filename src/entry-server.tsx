import { renderToString } from 'react-dom/server';
import { App, routes, routeInfo } from './App';
export {routes, routeInfo};
export const render = (path: string) => renderToString(<App path={path}/>);
