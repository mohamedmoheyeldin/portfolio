# Dependency scope

Every direct dependency is a used subset of the official Untitled UI Vite starter:
https://github.com/untitleduico/untitledui-vite-starter-kit/blob/main/package.json

- `@untitledui/icons`: upstream icon set.
- `react`, `react-dom`, `react-aria-components`: component runtime, rendering, accessibility and interactions.
- `tailwindcss`, `@tailwindcss/vite`, `tailwindcss-react-aria-components`, `tailwindcss-animate`: upstream styles and interaction/animation utilities.
- `tailwind-merge`: upstream class composition helper.
- `vite`, `@vitejs/plugin-react`: official starter build and development pipeline.
- `typescript`, `@types/react`, `@types/react-dom`, `@types/node`: compiler and type definitions; Node types match this project's Node 24 runtime.

Astro, its adapter/checker, Fontsource, cross-env, Wrangler, Playwright, and Cypress have been removed from the application dependency tree. Cloudflare deployment uses `pnpm dlx wrangler@4.144.0` separately. Inter loads with the Google Fonts link used by the official starter. No dependency was added for prerendering, content validation, routing, or MCP.

The portfolio keeps a small local route composition and build-time React prerenderer so its existing URLs, metadata, sitemap, downloads, and no-JavaScript content remain available. These content-specific files are local code, not represented as upstream templates.

## Untitled UI MCP

Project configuration: `.codex/config.toml` → `https://www.untitledui.com/react/api/mcp`.
Verified with live MCP initialize, tools/list, and tools/call get_component(button) requests without authentication. The server reported public access and returned its install command. The desktop tool inventory in the active conversation did not expose it directly; these checks used the official HTTP MCP endpoint. Reload the project/chat to let Codex load the new server configuration. Configuration is not a claim that the active session has hot-loaded the tools.

Use free source only. PRO components and full templates require separate licensed access. Do not put credentials in this repository.
