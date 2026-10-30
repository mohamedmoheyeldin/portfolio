import type { ReactNode } from "react";
import { profile } from "@/lib/career";
import { caseStudyHref, email, emailAddress, gitHubUrl, href, linkedInUrl, projectDisplayName, root, roleEmail } from "./shared";
import { ArrowUpRight, Copy, GitHub, LinkedIn, Mail, Menu, Moon, ResumeMenu, Search, Sun, resumeOptions } from "./ui";

export type Place = "home" | "experience" | "case" | "other";

const navLinks = (place: Place) => [
  { label: "Work", href: place === "home" ? "#work" : `${root}#work` },
  { label: "Experience", href: href("experience/"), current: place === "experience" },
  { label: "Contact", href: "#contact" },
];

function Header({ place }: { place: Place }) {
  const links = navLinks(place);
  return (
    <header className="site-header">
      <div className="wrap header-row">
        <a className="wordmark" href={root} aria-current={place === "home" ? "page" : undefined}>
          <span className="wordmark-name">Mohamed Moheyeldin</span>
          <span className="wordmark-role" aria-hidden="true">{profile.headline}</span>
        </a>
        <nav aria-label="Main" className="nav-wide">
          <ul className="nav-links">
            {links.map((link) => <li key={link.label}><a href={link.href} aria-current={link.current ? "page" : undefined}>{link.label}</a></li>)}
          </ul>
        </nav>
        <div className="header-tools">
          <button className="search-btn js-only" type="button" data-palette-open aria-haspopup="dialog" aria-controls="palette" aria-keyshortcuts="Control+K Meta+K">
            <Search /><span className="search-label">Jump to</span><kbd data-shortcut aria-hidden="true">Ctrl K</kbd>
          </button>
          <button className="btn btn--quiet btn--icon theme-toggle js-only" type="button" data-theme-toggle aria-label="Switch theme">
            <Moon className="icon-moon" /><Sun className="icon-sun" />
          </button>
          <a className="btn btn--primary nav-wide" href={roleEmail}><Mail />Email me</a>
          <span className="menu-anchor nav-narrow">
            <button className="btn btn--icon" type="button" popoverTarget="site-menu" aria-label="Open menu"><Menu /></button>
            <div className="menu menu--site" id="site-menu" popover="auto">
              <nav aria-label="Main">
                <ul>{links.map((link) => <li key={link.label}><a href={link.href} aria-current={link.current ? "page" : undefined}>{link.label}</a></li>)}</ul>
              </nav>
              <hr />
              <p className="label" id="site-menu-resume">Resume</p>
              <ul aria-labelledby="site-menu-resume">
                {resumeOptions.map((option) => <li key={option.href}><a href={option.href}>{option.label}<span className="menu-format">{option.format}</span></a></li>)}
              </ul>
              <hr />
              <a className="btn btn--primary btn--block" href={roleEmail}><Mail />Email me</a>
            </div>
          </span>
        </div>
      </div>
    </header>
  );
}

type PaletteItem = { kind: string; name: string; hint?: string; href?: string; action?: string; keywords?: string };

/** Everything the command palette can reach. Built from the career record, so it never drifts from the page. */
function paletteItems(place: Place): PaletteItem[] {
  const home = place === "home" ? "" : root;
  return [
    { kind: "Section", name: "Selected work", href: `${home}#work`, keywords: "projects portfolio case studies" },
    { kind: "Section", name: "Career", href: `${home}#career`, keywords: "roles employers history timeline" },
    { kind: "Section", name: "How I work", href: `${home}#approach`, keywords: "practices tools skills" },
    { kind: "Section", name: "Contact", href: "#contact", keywords: "email hire reach audit" },
    { kind: "Page", name: "Experience", hint: "Every role, project, skill and credential", href: href("experience/") },
    { kind: "Page", name: "Credentials and education", href: href("experience/#learning"), keywords: profile.verifiedCredentials.map((c) => `${c.issuer} ${c.name}`).join(" ") },
    ...profile.projects.map((project) => ({
      kind: "Project", name: projectDisplayName(project), hint: project.context, href: caseStudyHref(project),
      keywords: [project.name, project.role, ...project.technologies].join(" "),
    })),
    ...profile.experience.map((role) => ({
      kind: "Role", name: role.employer, hint: role.title, href: href(`experience/#role-${role.id}`),
      keywords: [role.location, role.customer ?? ""].join(" "),
    })),
    { kind: "Skills", name: "Skills and tools", href: href("experience/#skills"), keywords: profile.skillGroups.flatMap((g) => [g.label, ...g.items]).join(" ") },
    ...resumeOptions.map((option) => ({ kind: "Resume", name: option.label, hint: option.format, href: option.href, keywords: "cv download" })),
    { kind: "Contact", name: "Email me", hint: emailAddress, href: roleEmail, keywords: "mail message" },
    { kind: "Contact", name: "Copy email address", hint: emailAddress, action: "copy-email" },
    { kind: "Contact", name: "LinkedIn", href: linkedInUrl, keywords: "profile social" },
    { kind: "Contact", name: "GitHub", href: gitHubUrl, keywords: "code source repositories" },
    { kind: "Site", name: "Switch theme", hint: "Light or dark", action: "theme", keywords: "dark light mode appearance" },
    { kind: "Site", name: "Test this page", hint: "Run the checks in your browser", href: href("experience/portfolio-career-content-system/#selftest"), keywords: "accessibility performance audit self-test" },
  ];
}

/**
 * The command palette: a native dialog with a combobox over the list above. It opens from the header button, Ctrl K
 * or ⌘K, and "/". Without JavaScript it never opens and the header links cover the same routes.
 */
function Palette({ place }: { place: Place }) {
  return (
    <dialog className="palette" id="palette" aria-labelledby="palette-title">
      <h2 className="sr-only" id="palette-title">Jump to</h2>
      <div className="palette-field">
        <Search />
        <input type="text" role="combobox" aria-expanded="true" aria-controls="palette-list" aria-autocomplete="list" aria-label="Search projects, roles, skills, resume files and contact routes" placeholder="Search projects, roles, skills, resumes…" autoComplete="off" spellCheck={false} data-palette-input />
        <kbd>Esc</kbd>
      </div>
      <ul className="palette-list" id="palette-list" role="listbox" aria-label="Results">
        {paletteItems(place).map((item, i) => (
          <li key={`${item.kind}-${item.name}-${i}`} id={`palette-opt-${i}`} role="option" aria-selected={i === 0}
            data-href={item.href} data-action={item.action} data-search={`${item.kind} ${item.name} ${item.hint ?? ""} ${item.keywords ?? ""}`.toLowerCase()}>
            <span className="palette-kind">{item.kind}</span>
            <span className="palette-name">{item.name}</span>
            {item.hint && <span className="palette-hint">{item.hint}</span>}
          </li>
        ))}
      </ul>
      <p className="palette-empty" hidden>No matches. Try a tool, an employer or “resume”.</p>
      <p className="palette-foot" aria-hidden="true"><span><kbd>↑</kbd><kbd>↓</kbd> move</span><span><kbd>Enter</kbd> open</span><span><kbd>Esc</kbd> close</span></p>
    </dialog>
  );
}

const auditSteps = [
  ["Week 1", "Map the workflow", "I sit with the people who run one workflow, such as intake, claims, documents, or reporting, and trace where the time goes, where the data lives, and which rules apply."],
  ["Week 2", "Test where AI helps", "I try AI on synthetic or approved data and show where it earns its place, where it doesn't, and what it would take to run it for real."],
  ["Handoff", "Leave with a plan", "You get ranked opportunities, the risks, and a scoped first build, walked through with your team so it doesn't sit in a drawer."],
] as const;

/** The close of every page: the question, the one action, the direct routes, and the audit offer for teams. */
function Close() {
  return (
    <section className="close" id="contact" aria-labelledby="contact-heading" data-sc-act="close">
      <div className="wrap">
        <div className="close-plate">
          <div className="close-main">
            <p className="label label--accent">Contact</p>
            <h2 id="contact-heading">Have a workflow your users are fighting with?</h2>
            <p className="lede">I'm open to Forward Deployed Engineer roles. Email is the fastest way to reach me.</p>
            <div className="actions">
              <a className="btn btn--primary btn--lg" href={roleEmail}><Mail />Email me</a>
              <ResumeMenu id="resume-menu-close" size="lg" />
            </div>
          </div>
          <div className="close-routes">
            <div className="address">
              <p className="label">Email</p>
              <p className="address-row">
                <a href={email} id="contact-address">{emailAddress}</a>
                <button className="copy-btn js-only" type="button" data-copy={emailAddress} aria-describedby="contact-address"><Copy /><span>Copy</span></button>
              </p>
              <p className="muted">Based in {profile.location.replace(/\s\d{5}$/, "")}</p>
            </div>
            <ul className="route-list">
              <li><a href={linkedInUrl}><LinkedIn />LinkedIn<ArrowUpRight /></a></li>
              <li><a href={gitHubUrl}><GitHub />GitHub<ArrowUpRight /></a></li>
            </ul>
            <div>
              <p className="label" id="close-resume-files">Resume files</p>
              <ul className="file-list" aria-labelledby="close-resume-files">
                {resumeOptions.map((option) => <li key={option.href}><a href={option.href}>{option.label}<span className="menu-format">{option.format}</span></a></li>)}
              </ul>
            </div>
          </div>
        </div>
        <section className="audit" aria-labelledby="audit-heading" id="work-with-me">
          <div className="audit-intro">
            <h3 id="audit-heading">For teams: a two-week AI workflow audit</h3>
            <p>Fixed price, quoted after a short intro call. For teams that want AI in a real workflow but don't have the people to scope it yet.</p>
            <p><a className="link-arrow" href={`${email}?subject=${encodeURIComponent("AI workflow audit")}`}>Ask about the audit<ArrowUpRight /></a></p>
          </div>
          <ol className="audit-steps">
            {auditSteps.map(([label, title, text]) => <li key={label}><span className="label">{label}</span><h4>{title}</h4><p>{text}</p></li>)}
          </ol>
        </section>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-row">
          <p>© {new Date().getFullYear()} {profile.name}. Set in Instrument Sans and Geist Mono.</p>
          <p className="footer-links">
            <a href={href("experience/portfolio-career-content-system/#selftest")}>Test this page</a>
            <a href={href("experience/portfolio-career-content-system/")}>How this site is built</a>
          </p>
        </div>
        <details>
          <summary>Professional references and intellectual property notice</summary>
          <p>
            References to employers, clients, customers, government agencies, projects, products, and services (including names,
            trademarks, and other identifiers) are used solely to identify and describe my professional experience, contributions,
            and the tools I have used. All third-party trademarks and other intellectual property remain the property of their
            respective owners. Their inclusion does not imply sponsorship, endorsement, approval, partnership, or authorization of
            this website.
          </p>
          <p>
            This is my personal portfolio. Statements and views are my own and do not represent any employer, client, customer, or
            government agency. Descriptions focus on my individual contributions within broader team efforts and do not claim
            ownership of an organization’s projects, systems, or intellectual property. Project headings may be descriptive
            portfolio labels rather than official project or product names. Client-sensitive details are intentionally generalized.
          </p>
          <p>
            Nothing on this website grants rights to third-party materials or changes any applicable confidentiality, contractual,
            or intellectual property obligations. For concerns about a reference or attribution, please <a href={email}>contact me</a> for
            review and appropriate correction or removal.
          </p>
        </details>
      </div>
    </footer>
  );
}

export function Page({ place, children }: { place: Place; children: ReactNode }) {
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Header place={place} />
      <main id="main-content" tabIndex={-1}>{children}</main>
      <Close />
      <Footer />
      <Palette place={place} />
    </>
  );
}
