# Cloudflare Workers deployment

The portfolio is a prerendered React site deployed through Workers Static Assets. It requires no application server or Worker entry point.

## Cloudflare build settings

- Production branch: `main`
- Build command: `pnpm run build:cloudflare`
- Deploy command: `pnpm dlx wrangler@4.144.0 deploy`
- Root directory: `/`

`main` is the production portfolio release branch. Application Studio uses `application-studio` for future work and must remain excluded from the portfolio's automatic non-production upload trigger. Any later Studio preview needs separate, reviewed hosting and credentials; it must not overwrite the production Worker or use production owner data.

The Cloudflare build uses `https://mohamedmoheyeldin.com` as the canonical site URL and produces root-relative links. The Worker remains available at its generated `workers.dev` address while the custom domain is being activated.

## Local validation

```bash
pnpm build:cloudflare
pnpm dlx wrangler@4.144.0 deploy --dry-run
```

Use `pnpm build:cloudflare` then `pnpm preview` for local review.

## Custom domain

Cloudflare MCP verified that `mohamedmoheyeldin.com` is already an enabled Custom Domain for the `portfolio` Worker. Preserve this mapping during the redesign. Add `www.mohamedmoheyeldin.com` only if the final domain policy requires it; the preferred plan is to redirect `www` to the apex domain.
