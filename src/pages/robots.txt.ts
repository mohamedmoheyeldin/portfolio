import type { APIRoute } from 'astro';

export const prerender = true;

export const GET: APIRoute = ({ site }) => {
  const root = `${import.meta.env.BASE_URL.replace(/\/?$/, '')}/`;
  const sitemap = new URL(`${root}sitemap.xml`, site);
  return new Response(`User-agent: *\nAllow: /\nSitemap: ${sitemap.href}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
