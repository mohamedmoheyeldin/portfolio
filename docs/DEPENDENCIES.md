# Dependency scope

- `react`, `react-dom`: render every page to HTML at build time (`renderToString`) and the dev-server preview. Production bundles contain no React.
- `vite`, `@vitejs/plugin-react`: build and development pipeline, including the SSR loader the prerenderer uses.
- `typescript`, `@types/react`, `@types/react-dom`, `@types/node`: compiler and type definitions; Node types match this project's Node 24 runtime.

The October 30, 2026 split redesign removed Untitled UI (`@untitledui/icons` and the vendored component sources), `react-aria-components`, Tailwind CSS (`tailwindcss`, `@tailwindcss/vite`, `tailwindcss-react-aria-components`, `tailwindcss-animate`) and `tailwind-merge`. The site is static and needed none of them at runtime; they accounted for most of a 567 KB JavaScript bundle and 122 KB of CSS. Their replacements are a hand-written stylesheet (`src/styles/site.css`, about 30 KB), a dozen inline SVG icons (`src/components/site/ui.tsx`), the native popover API for menus and `<details>` for disclosures. The LinkedIn and GitHub marks keep the paths from the previous icon components.

Fonts are self-hosted files, not packages: Latin WOFF2 subsets of Instrument Sans (variable weight 400 to 700 and width 75 to 100%) and Geist Mono (variable weight), both under the SIL Open Font License 1.1, in `src/assets/fonts/` (79 KB in total, fingerprinted by Vite and preloaded). The signal redesign (October 30, 2026) restored them from the diff build in place of IBM Plex.

Astro, Fontsource, cross-env, Wrangler and browser test runners are not application dependencies. Cloudflare deployment uses `pnpm dlx wrangler@4.144.0` separately. Browser verification tools (`playwright-core`, `axe-core`, `lighthouse`) live in the Scrollcraft workspace outside this repository; see [TESTING.md](TESTING.md). Resume generation uses Python packages listed in `scripts/requirements-resume.txt`, separate from the website.
