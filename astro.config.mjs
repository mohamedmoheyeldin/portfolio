import { defineConfig } from 'astro/config';

const site = process.env.SITE_URL?.trim() || 'https://mohamedmoheyeldin.com';
const base = process.env.BASE_PATH?.trim() || '/';

export default defineConfig({
  site,
  base,
  output: 'static',
});
