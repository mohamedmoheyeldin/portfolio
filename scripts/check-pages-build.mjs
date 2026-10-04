import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

const [home, resume, sitemap, robots, work, career] = await Promise.all([
  readFile('dist/index.html', 'utf8'),
  readFile('dist/resume/index.html', 'utf8'),
  readFile('dist/sitemap.xml', 'utf8'),
  readFile('dist/robots.txt', 'utf8'),
  readFile('dist/experience/index.html', 'utf8'),
  readFile('src/content/career.json', 'utf8'),
]);

const expectations = [
  [home, 'href="/portfolio/experience/"'],
  [home, 'href="/portfolio/experience/portfolio-career-content-system/"'],
  [home, 'href="/portfolio/site.webmanifest"'],
  [resume, 'href="/portfolio/resume/mohamed-moheyeldin-resume-detailed.pdf"'],
  [sitemap, 'https://mohamedmoheyeldin.github.io/portfolio/experience/'],
  [robots, 'Sitemap: https://mohamedmoheyeldin.github.io/portfolio/sitemap.xml'],
];

for (const project of JSON.parse(career)[0].projects) {
  expectations.push([home, `href="/portfolio/experience/#project-${project.slug}"`]);
  expectations.push([work, `href="/portfolio/experience/${project.slug}/"`]);
}
expectations.push([work, 'aria-label="Choose a project"']);

for (const [output, expected] of expectations) {
  if (!output.includes(expected)) {
    throw new Error(`GitHub Pages build is missing expected output: ${expected}`);
  }
}

console.log('GitHub Pages subpath output is portable.');

const legacy = await readFile('dist/about/index.html', 'utf8');
let destination;
runInNewContext(legacy.match(/<script>(.*?)<\/script>/s)[1], {
  location: { search: '?from=legacy', hash: '#project-ccrs-test-data-tooling', replace: value => { destination = value; } },
});
if (destination !== '/portfolio/experience/?from=legacy#project-ccrs-test-data-tooling') throw new Error('Legacy redirect lost its base path, query, or fragment.');
if (!legacy.includes('0;url=/portfolio/experience/')) throw new Error('Missing static redirect fallback.');
if (sitemap.includes('/about/')) throw new Error('Legacy About route must not appear in the sitemap.');
if (home.includes('href="/portfolio/about/"')) throw new Error('Homepage links must use the consolidated Work route.');
console.log('Consolidated Work route and legacy redirect validated.');

for (const oldPath of ['/work/', ...JSON.parse(career)[0].projects.map(p => `/work/${p.slug}/`)]) {
  const html = await readFile(`dist${oldPath}index.html`, 'utf8');
  const expected = `/portfolio${oldPath.replace('/work/', '/experience/')}`;
  let actual;
  runInNewContext(html.match(/<script>(.*?)<\/script>/s)[1], {
    location: {search: '?ref=old', hash: '#project-ccrs-test-data-tooling', replace: value => { actual = value; }},
  });
  if (actual !== `${expected}?ref=old#project-ccrs-test-data-tooling`) throw Error('Old Work URL did not redirect correctly.');
  if (!html.includes(`0;url=${expected}`)) throw Error('Missing static Work redirect.');
}
if (sitemap.includes('/work/') || home.includes('href="/portfolio/work/')) throw Error('Canonical links must use Experience.');
console.log('Experience routes and old Work redirects validated.');
