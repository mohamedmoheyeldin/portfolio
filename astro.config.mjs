import { defineConfig } from 'astro/config';

const site = process.env.SITE_URL?.trim() || 'https://mohamedmoheyeldin.com';

export default defineConfig({
  site,
  output: 'static',
});
