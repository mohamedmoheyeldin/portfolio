import type { ReactNode } from "react";
import { profile } from "@/lib/career";
import { email, emailAddress, gitHubUrl, href, linkedInUrl, root, roleEmail } from "./shared";
import { ArrowUpRight, GitHub, LinkedIn, Mail, Menu, Moon, ResumeMenu, Sun, resumeOptions } from "./ui";

export type Place = "home" | "experience" | "case" | "other";

const navLinks = (place: Place) => [
  { label: "Work", href: place === "home" ? "#work" : `${root}#work` },
  { label: "Experience", href: href("experience/"), current: place === "experience" },
  { label: "Contact", href: "#contact" },
];

/**
 * The header is the seam's chrome: the name on the People side, the routes on the Systems side, and on wide screens
 * the two side labels sitting either side of the line.
 */
function Header({ place }: { place: Place }) {
  const links = navLinks(place);
  return (
    <header className="site-header">
      <div className="split-row header-row">
        <div className="side side--people">
          <a className="wordmark" href={root} aria-current={place === "home" ? "page" : undefined}>Mohamed Moheyeldin</a>
          <span className="label seam-label" aria-hidden="true">People</span>
        </div>
        <div className="side side--systems">
          <span className="label seam-label" aria-hidden="true">Systems</span>
          <nav aria-label="Main" className="nav-wide">
            <ul className="nav-links">
              {links.map((link) => <li key={link.label}><a href={link.href} aria-current={link.current ? "page" : undefined}>{link.label}</a></li>)}
            </ul>
          </nav>
          <div className="header-tools">
            <button className="btn btn--quiet btn--icon theme-toggle js-only" type="button" data-theme-toggle aria-label="Switch theme">
              <Moon className="icon-moon" /><Sun className="icon-sun" />
            </button>
            <a className="btn btn--primary nav-wide" href={roleEmail}><Mail />Email me</a>
            <button className="btn btn--icon nav-narrow" type="button" popoverTarget="site-menu" aria-label="Open menu"><Menu /></button>
          </div>
        </div>
      </div>
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
        <div className="actions"><a className="btn btn--primary" href={roleEmail}><Mail />Email me</a></div>
      </div>
    </header>
  );
}

const auditSteps = [
  ["Week 1", "Map the workflow", "I sit with the people who run one workflow, such as intake, claims, documents, or reporting, and trace where the time goes, where the data lives, and which rules apply."],
  ["Week 2", "Test where AI helps", "I try AI on synthetic or approved data and show where it earns its place, where it doesn't, and what it would take to run it for real."],
  ["Handoff", "Leave with a plan", "You get ranked opportunities, the risks, and a scoped first build, walked through with your team so it doesn't sit in a drawer."],
] as const;

/**
 * The close of every page. It starts on the split; as it scrolls in, the Systems ground clips away to the right edge
 * and the seam goes with it, so People holds the full width for the one action.
 */
function Close() {
  return (
    <section className="close" id="contact" aria-labelledby="contact-heading" data-sc-act="collapse">
      <div className="close-ground" aria-hidden="true" />
      <div className="close-seam" aria-hidden="true" />
      <div className="wrap close-inner">
        <p className="label">Contact</p>
        <h2 id="contact-heading">Building something with the people who will use it?</h2>
        <p className="lede">
          I'm open to Forward Deployed Engineer roles. Email is the fastest way to reach me.
        </p>
        <div className="actions">
          <a className="btn btn--primary btn--lg" href={roleEmail}><Mail />Email me</a>
          <ResumeMenu id="resume-menu-close" anchor="resume-close" size="lg" />
        </div>
        <div className="routes">
          <div>
            <h3 className="label">Direct</h3>
            <ul>
              <li><a href={email} id="contact-address">{emailAddress}</a> <button className="copy-btn js-only" type="button" data-copy={emailAddress} aria-describedby="contact-address">Copy</button></li>
              <li><span className="muted">{profile.location.replace(/\s\d{5}$/, "")}</span></li>
            </ul>
          </div>
          <div>
            <h3 className="label">Elsewhere</h3>
            <ul>
              <li><a href={linkedInUrl}><LinkedIn width={16} height={16} />LinkedIn<ArrowUpRight width={14} height={14} /></a></li>
              <li><a href={gitHubUrl}><GitHub width={16} height={16} />GitHub<ArrowUpRight width={14} height={14} /></a></li>
            </ul>
          </div>
          <div>
            <h3 className="label">Resume files</h3>
            <ul>
              {resumeOptions.map((option) => <li key={option.href}><a href={option.href}>{option.label} ({option.format})</a></li>)}
            </ul>
          </div>
        </div>
        <section className="audit" aria-labelledby="audit-heading" id="work-with-me">
          <div className="audit-intro">
            <h3 id="audit-heading">For teams: a two-week AI workflow audit</h3>
            <p>Fixed price, quoted after a short intro call. For teams that want AI in a real workflow but don't have the people to scope it yet.</p>
            <p><a className="link-arrow" href={`${email}?subject=${encodeURIComponent("AI workflow audit")}`}>Ask about the audit<ArrowUpRight /></a></p>
          </div>
          <ol>
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
          <p><a href={`${root}#selftest`}>Test this page</a> · <a href={href("experience/portfolio-career-content-system/")}>How this site is built</a></p>
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
    </>
  );
}
