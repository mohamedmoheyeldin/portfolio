import { build, createServer } from 'vite';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import './validate-content.mjs';
const profile = JSON.parse(await readFile('src/content/career.json', 'utf8'))[0];
const pages = process.argv.includes('--pages');
const base = pages ? '/portfolio/' : '/';
const site = process.env.SITE_URL?.trim() || (pages ? 'https://mohamedmoheyeldin.github.io' : 'https://mohamedmoheyeldin.com');
process.env.BASE_PATH = base;
await build();
const template = await readFile('dist/index.html', 'utf8');
const server = await createServer({server: {middlewareMode: true}, appType: 'custom'});
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
try {
  const {routes, render, routeInfo} = await server.ssrLoadModule('/src/entry-server.tsx');
  for (const path of [...routes, '/404.html']) {
    const {title, description} = routeInfo(path);
    const canonical = `${site}${base}${path.slice(1)}`;
    const social = '<meta name="twitter:card" content="summary">';
    const schema = path === '/' ? `<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'ProfilePage',url:canonical,name:title,description,mainEntity:{'@type':'Person',name:profile.name,jobTitle:profile.headline,sameAs:['https://www.linkedin.com/in/moheyeldin/','https://github.com/mohamedmoheyeldin']}}).replaceAll('<','\\u003c')}</script>` : '';
    const notFound = path === '/404.html';
    const indexing = notFound ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${canonical}">`;
    const meta = `<meta name="description" content="${escape(description)}">${indexing}<meta property="og:type" content="website"><meta property="og:site_name" content="Mohamed Moheyeldin"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}">${notFound ? '' : `<meta property="og:url" content="${canonical}">`}${social}${schema}`;
    const html = template.replace(/<title>.*?<\/title>/,`<title>${escape(title)}</title>`).replace('<!--page-meta-->',meta).replace('<!--app-html-->',render(path));
    const target = notFound ? 'dist/404.html' : `dist${path}index.html`;
    await mkdir(dirname(target), {recursive:true});
    await writeFile(target,html);
  }
  await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map(p=>`<url><loc>${site}${base}${p.slice(1)}</loc></url>`).join('')}</urlset>`);
  await writeFile('dist/robots.txt',`User-agent: *\nAllow: /\nSitemap: ${site}${base}sitemap.xml\n`);
  // The Resume page was retired; its URL now opens the detailed PDF directly.
  const legacyRoutes = ['/about/', '/work/', ...profile.projects.map(p => `/work/${p.slug}/`), '/resume/'];
  for (const legacy of legacyRoutes) {
    const resume = legacy === '/resume/';
    const label = resume ? 'Resume' : 'Experience';
    const destination = `${base}${resume ? 'resume/mohamed-moheyeldin-resume-detailed.pdf' : legacy === '/about/' ? 'experience/' : legacy.slice(1).replace(/^work\//, 'experience/')}`;
    const target = `dist${legacy}index.html`;
    await mkdir(dirname(target), {recursive: true});
    await writeFile(target, `<!doctype html><html lang="en"><head><meta charset="UTF-8"><title>${label}</title><link rel="canonical" href="${site}${destination}"><script>location.replace(${JSON.stringify(destination)}+location.search+location.hash)</script><noscript><meta http-equiv="refresh" content="0;url=${destination}"></noscript></head><body><a href="${destination}">Continue to ${label}</a></body></html>`);
  }
  console.log(`Prerendered ${routes.length + 1} pages and ${legacyRoutes.length} legacy redirects. Content, metadata, and links work without JavaScript.`);
} finally { await server.close(); }
