import { defineConfig } from 'astro/config';

const projectUrl = 'https://mohamedmoheyeldin.github.io/portfolio';
const site = process.env.SITE_URL ?? projectUrl;
const base = site === projectUrl ? '/portfolio' : undefined;

export default defineConfig({
  site,
  base,
  output: 'static',
});
