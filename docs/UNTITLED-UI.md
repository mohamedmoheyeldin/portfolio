# Untitled UI integration

The `untitledui` branch replaces the previous website presentation with free Untitled UI React components and an original portfolio layout. The user selected relevant components throughout the site, without a separate component catalog or PRO dependency.

## Source and license

- Source: https://github.com/untitleduico/react
- Snapshot: `4702dc0ea8d140c3491a85670c7b4fab47b722da`
- License: MIT; full notice in `UNTITLED-UI-LICENSE`.
- Imported: button, button group, badge variants, input/label/hint, tooltip, navigation item, featured icon, empty state, dot icon, class utilities, React component guard, and theme CSS.
- Icons: `@untitledui/icons`.
- Installation guidance: https://www.untitledui.com/react/docs/installation

The imported components use React Aria and Tailwind v4. Local composition is in `src/components/Portfolio.tsx`. Page composition adapts the portfolio content to upstream components and theme tokens; it is not a purchased Untitled UI marketing template.

## Component coverage

| Surface | Implementation |
| --- | --- |
| Primary navigation and case-study section links | Upstream `NavItemBase` |
| Experience disclosure triggers | Upstream `NavItemBase` collapsible variant inside native `details` |
| Calls to action, downloads, project titles, footer and social links | Upstream `Button` including link variants |
| Skills, project labels and location | Upstream `Badge` and `BadgeWithDot` |
| Expertise, resume and hero icon tiles | Upstream `FeaturedIcon` |
| Colors, typography scale, interaction styles | Upstream theme tokens and component utilities |

Remaining local composition consists of page sections, content cards and the accessibility skip link. Decorative artwork and mock interfaces have been removed. Semantic headings, lists, sections, and native disclosure containers remain HTML. No paid marketing templates are used, and no numerical coverage percentage is claimed: this is a component-level inventory, not a percentage of DOM elements or source lines.

## Local adaptations

The repository retains strict TypeScript configuration. `definedProps` omits undefined optional values when passing props between upstream React components. Button booleans receive explicit defaults. The input's icon type reflects the className prop actually passed to the icon. These changes make the imported components compatible with `exactOptionalPropertyTypes` without disabling checks.

Navigation applies the same optional-prop adaptation. The empty-state source retains its root, header, featured icon, content, title, description, and footer; unused file-icon, background-pattern, illustration, and avatar variants were omitted to avoid unused dependencies. Its title is an `h3` and content is a `div`, preserving the work page's heading hierarchy and single main landmark. Layout CSS is in `@layer components`, below upstream utilities, and obsolete custom control selectors have been removed.

The prerendered React application hydrates in the browser. Portfolio content renders static React output through React server rendering at build time. Navigation, project content, case studies, native experience disclosures, and downloads remain usable without JavaScript. The homepage shows all project cards. The Work page uses project selection and section controls to display one project at a time; search and category filters remain removed. Preserve direct project routes and no-JavaScript fallback links.

## Review and deployment

### Brand color

Blue is the permanent brand color, following https://www.untitledui.com/react/docs/theming. The complete brand scale (50–950) maps to the upstream blue tokens in theme.css. The palette picker, alternate brand overrides, generator, and saved-preference handling have been removed. Semantic status colors remain available to Untitled UI components.

- Local production review: `pnpm build:cloudflare`, then `pnpm preview --host 127.0.0.1 --port 4322`.
- Interactive development: `pnpm dev --host 127.0.0.1 --port 4322` (stop the preview before reusing its port).
- Full verification: `pnpm verify`.
- Root build: `pnpm build:cloudflare`.
- Deployment configuration validation: `pnpm dlx wrangler@4.144.0 deploy --dry-run`.
- Production is the existing Cloudflare `portfolio` Worker at `mohamedmoheyeldin.com`.

Cloudflare MCP confirmed the account, Worker, and domain mapping during this task. Local Wrangler is not authenticated; MCP authentication does not authenticate the CLI. No production deployment was performed during local review preparation.

The original career data is preserved; resume downloads are regenerated using the shared theme. The portfolio project narrative now documents the React/Untitled UI redesign. Git history retains the old website; its unused page components and CSS are removed from this branch.

## Design source policy

Use Untitled UI's official documentation and MIT source directly. Context7 and other design references are excluded by the user's current instruction. The code illustration, miniature browsers, diagrams, tilted cards, floating notes, and monogram artwork have been removed. React Aria and Tailwind remain the dependencies used by Untitled UI itself.

## Component conventions

The Experience project and toolkit menus share an `ExplorerChoice` composition of the imported Button's tertiary variant. Each choice has a subtle border, a title and description, and a pale blue selected state with a stronger border and `aria-current`. Component utilities supply control styling and focus behavior; local grid CSS wraps the five choices into three, two, and one column as the viewport narrows. The layout separates navigation from detail content with whitespace, groups employer details in a muted context area, and places challenge and contribution side by side on wide screens. Narrow screens stack the content. Project links retain direct-route fallbacks, toolkit links retain category anchors, and the existing ButtonGroup controls switch detail sections after hydration.

`components.json` selects Untitled UI v8 and records aliases matching TypeScript and Vite. Header and footer name links use the upstream Button link variant. Portfolio typography uses the upstream text/display sizes and line heights; colors and shadows reference semantic theme tokens directly. Page sections remain local compositions of free components. No PRO page template or complete upstream marketing layout is claimed.

Portfolio CSS lives in one components layer with responsive rules alongside the layout. Shared layout variables define section spacing (72px desktop, 48px mobile), the 38px heading-to-content gap, 24px card padding, and a 70ch reading width. Long introductions and narrative paragraphs are left aligned while headings and short section descriptions remain centered. Detail ButtonGroup items use the React Aria selected variant with blue background, text, and border tokens; the Overview control identifies both its challenge and outcome sections.

## Resume exports

The web resume uses the imported Untitled UI React components. PDF and DOCX are native document formats, so their generator uses the same light-theme semantic colors and Inter rather than executing React components. Colors resolve directly from `src/styles/theme.css` and installed Tailwind tokens on every generation; there is no second brand palette. Print-specific sizing keeps the compact PDF to one page.

Inter Regular and SemiBold are embedded in PDFs. DOCX specifies Inter; Word may substitute a font when Inter is unavailable. The two font files in `assets/fonts` are static instances (optical size 14; weights 400/600) of the Google Fonts Inter source, with its OFL license retained. They are used only for document generation and are not copied into the website bundle.

Both concise and detailed PDF and DOCX resumes center the name and tagline in the shared generator. Contact information and body content remain left aligned. Markdown and job-board text keep portable text formatting. The October 1 export check confirmed centered PDF text positions, centered DOCX paragraphs, and one-page/two-page PDF layouts; all PDF pages were visually inspected. DOCX visual rendering remains unverified because LibreOffice is unavailable.

The Work explorer reuses upstream Button links for project selection and ButtonGroup/ButtonGroupItem for detail sections. Layout composition is local; no additional UI package is installed. Existing project URLs remain readable without JavaScript.
