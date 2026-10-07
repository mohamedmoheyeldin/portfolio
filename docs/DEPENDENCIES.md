# Dependency scope

Every direct dependency is a used subset of the official Untitled UI Vite starter:
https://github.com/untitleduico/untitledui-vite-starter-kit/blob/main/package.json

- `@untitledui/icons`: upstream icon set.
- `react`, `react-dom`, `react-aria-components`: component runtime, rendering, accessibility and interactions.
- `tailwindcss`, `@tailwindcss/vite`, `tailwindcss-react-aria-components`, `tailwindcss-animate`: upstream styles and interaction/animation utilities.
- `tailwind-merge`: upstream class composition helper.
- `vite`, `@vitejs/plugin-react`: official starter build and development pipeline.
- `typescript`, `@types/react`, `@types/react-dom`, `@types/node`: compiler and type definitions; Node types match this project's Node 24 runtime.

Astro, its adapter/checker, Fontsource, cross-env, Wrangler, and browser test runners have been removed from the application dependency tree. Cloudflare deployment uses `pnpm dlx wrangler@4.144.0` separately. Inter loads with the Google Fonts link used by the official starter. No dependency was added for prerendering, content validation, routing, or MCP.

The portfolio keeps a small local route composition and build-time React prerenderer so its existing URLs, metadata, sitemap, downloads, and no-JavaScript content remain available. These content-specific files are local code, not represented as upstream templates.

## Untitled UI MCP

Project configuration: `.mcp.json` (Claude Code) → `https://www.untitledui.com/react/api/mcp`. Claude Code asks you to approve the project server the first time it loads.
Verified with live MCP initialize, tools/list, and tools/call get_component(button) requests without authentication. The server reported public access and returned its install command. These checks used the official HTTP MCP endpoint directly; configuration is not a claim that an active session has loaded the tools.

Use free source only. PRO components and full templates require separate licensed access. Do not put credentials in this repository.
