# Testing

## Standard verification

```bash
pnpm verify
```

This aliases the complete `pnpm quality` gate.

## Test layers

- `pnpm check` runs strict TypeScript diagnostics and content schema validation.
- `pnpm build` creates the standard static production output.
- `pnpm test:pages` builds with `/portfolio/` as the base path and validates the packaged GitHub Pages output.

## Change guidance

- Content, component, layout, style, or metadata changes: run `pnpm verify`.
- Deployment-only changes: also run the specific `build:cloudflare` or `build:pages` command for that target.
- Resume or career-data changes: inspect generated PDF/DOCX artifacts in addition to automated checks when the change affects document layout.
- Browser test dependencies and suites were removed at the user's request. Do not open browsers or call browser automation unless explicitly requested. Use build and HTTP checks by default and report visual review as unverified. When the user requests browser review, confirm the connection matches their chosen browser/profile before inspecting navigation, filtering, downloads, keyboard access, mobile layouts, and console errors. Build checks do not establish browser or accessibility coverage.
