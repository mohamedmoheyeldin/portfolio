# Cloudflare Workers deployment

The portfolio is a static Astro site deployed through Workers Static Assets. It does not require an Astro server adapter or a Worker entry point.

## Cloudflare build settings

- Production branch: `main`
- Build command: `pnpm run build:cloudflare`
- Deploy command: `pnpm exec wrangler deploy`
- Root directory: `/`

The Cloudflare build uses `https://mohamedmoheyeldin.com` as Astro's canonical site URL and produces root-relative links. The Worker remains available at its generated `workers.dev` address while the custom domain is being activated.

## Local validation

```bash
pnpm build:cloudflare
pnpm exec wrangler deploy --dry-run
```

Use `pnpm preview:cloudflare` to build and serve the Cloudflare configuration locally.

## Custom domain

After the first Worker deployment succeeds, add `mohamedmoheyeldin.com` as a Custom Domain for the `portfolio` Worker in Cloudflare. Add `www.mohamedmoheyeldin.com` only if the final domain policy requires it; the preferred plan is to redirect `www` to the apex domain.
