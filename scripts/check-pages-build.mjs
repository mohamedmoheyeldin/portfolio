import { readFile } from 'node:fs/promises';

const [home, resume, sitemap, robots] = await Promise.all([
  readFile('dist/index.html', 'utf8'),
  readFile('dist/resume/index.html', 'utf8'),
  readFile('dist/sitemap.xml', 'utf8'),
  readFile('dist/robots.txt', 'utf8'),
]);

const expectations = [
  [home, 'href="/portfolio/work/"'],
  [home, 'src="/portfolio/images/quality-engineering-system.webp"'],
  [home, 'href="/portfolio/site.webmanifest"'],
  [resume, 'href="/portfolio/resume/mohamed-moheyeldin-resume-one-page.pdf"'],
  [sitemap, 'https://mohamedmoheyeldin.github.io/portfolio/work/'],
  [robots, 'Sitemap: https://mohamedmoheyeldin.github.io/portfolio/sitemap.xml'],
];

for (const [output, expected] of expectations) {
  if (!output.includes(expected)) {
    throw new Error(`GitHub Pages build is missing expected output: ${expected}`);
  }
}

console.log('GitHub Pages subpath output is portable.');
