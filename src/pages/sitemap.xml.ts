import type { APIRoute } from 'astro';
import { getCareerProfile } from '@/lib/career';

export const prerender = true;

export const GET: APIRoute = async ({ site }) => {
  const profile = await getCareerProfile();
  const root = `${import.meta.env.BASE_URL.replace(/\/?$/, '')}/`;
  const paths = [
    root,
    `${root}work/`,
    ...profile.projects.map((project) => `${root}work/${project.slug}/`),
    `${root}about/`,
    `${root}resume/`,
  ];
  const urls = paths.map((path) => `  <url><loc>${new URL(path, site).href}</loc></url>`).join('\n');
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
