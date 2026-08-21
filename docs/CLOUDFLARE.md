# Cloudflare Workers deployment

The portfolio is a static Astro site deployed through Workers Static Assets. It does not require an Astro server adapter or a Worker entry point.

The autonomous application system is a second Worker. Do not add its Gmail, OpenAI, D1, R2, Browser Rendering, AI Gateway, or Access bindings to the public static `portfolio` Worker.

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

## Autonomous application Worker

`wrangler.job-assistant.jsonc` defines `portfolio-job-assistant-api` on the narrow route `mohamedmoheyeldin.com/api/assistant/*`. It uses D1, private R2, a scheduled trigger, Worker secrets, Cloudflare Browser Rendering, and AI Gateway. `/assistant/` and `GET /api/assistant/api/public-snapshot` remain public; the latter returns only aggregate totals and generalized activity. Cloudflare Access protects OAuth and every private API route, and the Worker independently validates the Access JWT.

Provisioning, secret names, D1 migration commands, OAuth redirect configuration, and the explicit deployment boundary are documented in [Autonomous Application System](JOB_ASSISTANT.md). `pnpm assistant:cloud:dry-run` bundles the Worker without deploying it.

## Custom domain

After the first Worker deployment succeeds, add `mohamedmoheyeldin.com` as a Custom Domain for the `portfolio` Worker in Cloudflare. Add `www.mohamedmoheyeldin.com` only if the final domain policy requires it; the preferred plan is to redirect `www` to the apex domain.
