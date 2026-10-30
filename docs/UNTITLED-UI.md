# Untitled UI integration

The `untitledui` branch replaces the previous website presentation with free Untitled UI React components and an original portfolio layout. The user selected relevant components throughout the site, without a separate component catalog or PRO dependency.

## Source and license

- Source: https://github.com/untitleduico/react
- Snapshot: `4702dc0ea8d140c3491a85670c7b4fab47b722da`
- License: MIT; full notice in `UNTITLED-UI-LICENSE`.
- Light and dark themes come from the upstream `.dark-mode` tokens in `theme.css`; the masthead toggle switches them.
- Imported and rendered: button, utility button with tooltip, close button, slide-out menu (the phone contents sheet), dropdown (one-page or full resume choice; avatar, checkbox, radio and toggle indicators omitted), badge variants, tabs, navigation item, dot icon, LinkedIn and GitHub social icons, class utilities, React component guard, and theme CSS. Each was added with the official `untitledui` CLI and adapted to strict TypeScript with `definedProps`. The October 30, 2026 redesign removed the badge group, featured icon, grid background pattern and cloud illustration, which it no longer renders; earlier changes removed the button group, input and empty-state sources.
- Icons: `@untitledui/icons`.
- Installation guidance: https://www.untitledui.com/react/docs/installation

The imported components use React Aria and Tailwind v4. Local composition is in `src/components/site/` (re-exported by `src/components/Portfolio.tsx`). Page composition adapts the portfolio content to upstream components and theme tokens; it is not a purchased Untitled UI marketing template.

## Component coverage

| Surface | Implementation |
| --- | --- |
| Phone contents sheet and the site links in it | Upstream `SlideoutMenu` and `NavItemBase` |
| Masthead links, folio chapters, chapter openers, imprint, index | Local semantic HTML (plain links and lists) styled with upstream tokens; Untitled nav items paint an opaque `bg-primary` that does not sit on the paper and night grounds |
| Resume version choice (masthead, title page, folio, colophon) | Upstream `Dropdown` with `Button` trigger; plain link to the full resume before hydration |
| Calls to action, downloads, case-study and source links, explorer choices | Upstream `Button` including link variants |
| Theme toggle, copy email, LinkedIn and GitHub | Upstream `ButtonUtility` with tooltip |
| Skills and tools | Upstream `Badge` |
| Experience project detail sections | Upstream `Tabs` (underline type) |
| Reading-depth control | React Aria `RadioGroup` and `Radio` (the library Untitled UI is built on) with local styles |
| Colophon | Local layout carrying the upstream `.dark-mode` class, so the components inside use the upstream dark tokens in both site themes |
| Colors, typography scale, interaction styles | Upstream theme tokens and component utilities |

Remaining local composition is page structure, the reading-depth control styling, the pipeline figure (an ordered list) and the accessibility skip link. There is no decorative artwork, mock interface or generated image. No paid marketing templates are used, and no numerical coverage percentage is claimed.

## Local adaptations

The repository retains strict TypeScript configuration. `definedProps` omits undefined optional values when passing props between upstream React components. Button booleans receive explicit defaults. The input's icon type reflects the className prop actually passed to the icon. These changes make the imported components compatible with `exactOptionalPropertyTypes` without disabling checks.

Navigation applies the same optional-prop adaptation. The empty-state source retains its root, header, featured icon, content, title, description, and footer; unused file-icon, background-pattern, illustration, and avatar variants were omitted to avoid unused dependencies. Its title is an `h3` and content is a `div`, preserving the surrounding page's heading hierarchy and single main landmark. Layout CSS is in `@layer components`, below upstream utilities, and obsolete custom control selectors have been removed.

The prerendered React application hydrates in the browser. Portfolio content renders static React output through React server rendering at build time. Navigation, project content, case studies, and downloads remain usable without JavaScript.

Editorial redesign (October 30, 2026): every page is a `Page` with a folio and numbered chapters, opening on a title page and closing on the colophon; see `ARCHITECTURE.md` for the component map and `DESIGN_BRIEF.md` and `SCROLLCRAFT-BRIEF.md` for the design reasoning. Home: the title page (kicker, two-sentence headline, one-line standfirst, actions, then an imprint of current role, earlier roles, education, credentials and location read from the career record), chapter 1 The work (the first three projects as alternating spreads, the other three as a ruled list, one label schema for all six, the evidence source beside every result, Figure 1 on the Claims Document Assistant entry), chapter 2 How the work is checked (five stages, each linked to a project), chapter 3 Career (newest first, with the role ladder in the opener), chapter 4 Index of tools (every project tool with links to the entries that used it). The previous hero band, hiring snapshot, trust strip, role-fit ledger, project-card grid, toolkit overview, Work with me section and phone contact bar are removed; the AI workflow audit offer moved into the colophon.

## Review and deployment

### Brand color

Blue is the permanent brand color, following https://www.untitledui.com/react/docs/theming. The complete brand scale (50–950) maps to the upstream blue tokens in theme.css. The palette picker, alternate brand overrides, and generator have been removed; only the light/dark choice is saved. Semantic status colors remain available to Untitled UI components.

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

The Experience project and toolkit menus share an `ExplorerChoice` composition of the imported Button's tertiary variant: number, title, description and outcome, with a raised selected state and `aria-current`. From 1000px the menu is sticky beside one detail panel; below that it is a scrolling row. Project links retain direct-route fallbacks, toolkit links retain category anchors, and Untitled UI tabs switch the Overview, Implementation, and Evidence panels after hydration. Without JavaScript every section renders in reading order with no tab list.

`components.json` selects Untitled UI v8 and records aliases matching TypeScript and Vite. Portfolio CSS lives in one components layer, below upstream utilities, using the `--pf-*` aliases documented in `ARCHITECTURE.md`. Long text is left aligned on a 66-character measure; numerals, years and case-study numbers sit in a shared margin column (`--pf-margin`).

## Resume exports

The web resume uses the imported Untitled UI React components. PDF and DOCX are native document formats, so their generator uses the same light-theme semantic colors and Inter rather than executing React components (the website pairs Inter with Newsreader; the documents keep Inter only). Colors resolve directly from `src/styles/theme.css` and installed Tailwind tokens on every generation; there is no second brand palette. Print-specific sizing keeps the compact PDF to one page.

Inter Regular and SemiBold are embedded in PDFs. DOCX specifies Inter; Word may substitute a font when Inter is unavailable. The two font files in `assets/fonts` are static instances (optical size 14; weights 400/600) of the Google Fonts Inter source, with its OFL license retained. They are used only for document generation and are not copied into the website bundle.

Both concise and detailed PDF and DOCX resumes center the name and tagline in the shared generator. Contact information and body content remain left aligned. Markdown and job-board text keep portable text formatting. The October 1 export check confirmed centered PDF text positions, centered DOCX paragraphs, and one-page/two-page PDF layouts; all PDF pages were visually inspected. DOCX visual rendering remains unverified because LibreOffice is unavailable.

The Work explorer reuses upstream Button links for project selection and Tabs for detail sections. Layout composition is local; no additional UI package is installed. Existing project URLs remain readable without JavaScript.

The earlier "Scrollcraft pass" on this branch (dark bands, role-fit ledger) was replaced by the editorial redesign above. Its fingerprint is kept in the Scrollcraft registry so later builds are gated against it.
