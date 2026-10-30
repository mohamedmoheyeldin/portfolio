import type { ReactNode } from "react";
import { profile } from "@/lib/career";
import { email, emailAddress, gitHubUrl, href, linkedInUrl, resumeFile, root, roleEmail } from "./shared";
import { ArrowUpRight, Copy, Download, GitHub, LinkedIn, Mail, Menu, Moon, ResumeMenu, Sun, resumeOptions } from "./ui";

export type Place = "home" | "experience" | "case" | "other";

const navLinks = (place: Place) => [
  { label: "Work", href: place === "home" ? "#work" : `${root}#work` },
  { label: "Experience", href: href("experience/"), current: place === "experience" },
  { label: "Contact", href: "#contact" },
];

/**
 * The header is a floating night island (dark in both themes, like the cover): the name, three routes, the theme
 * switch and the one action. Where scroll-driven animation runs, a teal line along its lower edge shows reading progress. On the home page the
 * route for the section in view is marked (enhance.ts). Below 860px the routes move into a native popover menu that
 * also lists every resume file.
 */
function Header({ place }: { place: Place }) {
  const links = navLinks(place);
  return (
    <header className="masthead">
      <div className="island night">
        <a className="island-name" href={root} aria-current={place === "home" ? "page" : undefined}>
          Mohamed Moheyeldin<span className="island-role" aria-hidden="true">{profile.headline}</span>
        </a>
        <nav aria-label="Main" className="island-nav nav-wide">
          <ul className="nav-links">
            {links.map((link) => <li key={link.label}><a href={link.href} aria-current={link.current ? "page" : undefined}>{link.label}</a></li>)}
          </ul>
        </nav>
        <div className="island-tools">
          <button className="btn btn--quiet btn--icon theme-toggle js-only" type="button" data-theme-toggle aria-label="Switch theme">
            <Moon className="icon-moon" /><Sun className="icon-sun" />
          </button>
          <a className="btn btn--primary btn--sm nav-wide" href={roleEmail}><Mail />Email me</a>
          <span className="menu-anchor nav-narrow">
            <button className="btn btn--quiet btn--icon" type="button" popoverTarget="site-menu" aria-label="Open menu"><Menu /></button>
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

const auditSteps = [
  ["Week 1", "Map the workflow", "I sit with the people who run one workflow, such as intake, claims, documents, or reporting, and trace where the time goes, where the data lives, and which rules apply."],
  ["Week 2", "Test where AI helps", "I try AI on synthetic or approved data and show where it earns its place, where it doesn't, and what it would take to run it for real."],
  ["Handoff", "Leave with a plan", "You get ranked opportunities, the risks, and a scoped first build, walked through with your team so it doesn't sit in a drawer."],
] as const;

/**
 * The close of every page is the last sheet laid on the deck: a tab that reads "Next step", the question, the address
 * set large as the action, the direct routes and every resume file, then the audit offer for teams.
 */
/** Email drafts by intent: the visitor picks why they are writing and the mail app opens with a subject and an outline. */
const intents = [
  ["I'm hiring a Forward Deployed Engineer", "Opens a draft with the role questions I'd ask first", "Forward Deployed Engineer role",
    "Hi Mohamed,\n\nI'm hiring for a Forward Deployed Engineer role.\n\nCompany:\nTeam and customers:\nLocation or remote:\nA good time for a call:\n\nThanks,"],
  ["My team wants the AI workflow audit", "Opens a draft for the two-week audit", "AI workflow audit",
    "Hi Mohamed,\n\nWe'd like to talk about the two-week AI workflow audit.\n\nThe workflow:\nWho uses it today:\nWhat we've tried:\n\nThanks,"],
  ["I have a question about your work", "Opens a draft that names the case study", "Question about your work",
    "Hi Mohamed,\n\nI read your case study on:\n\nMy question:\n\nThanks,"],
] as const;

function Close() {
  return (
    <section className="closing" id="contact" aria-labelledby="contact-heading" data-sc-act="close">
      <div className="wrap">
        <p className="sheet-tab sheet-tab--close tide" aria-hidden="true"><span className="num">Next step</span></p>
        <div className="closing-sheet tide">
          <div className="closing-main">
            <h2 id="contact-heading">Have a workflow your users are fighting with?</h2>
            <p className="lede">I'm open to Forward Deployed Engineer roles. Email is the fastest way to reach me.</p>
            <p className="closing-address">
              <a href={roleEmail} id="contact-address"><span className="sr-only">Email </span>{emailAddress.split("@")[0]}<wbr />@{emailAddress.split("@")[1]}</a>
              <button className="copy-btn js-only" type="button" data-copy={emailAddress} aria-describedby="contact-address"><Copy /><span>Copy</span></button>
            </p>
            <div className="actions">
              <a className="btn btn--primary btn--lg" href={roleEmail}><Mail />Email me</a>
              <ResumeMenu id="resume-menu-close" size="lg" />
            </div>
            <div className="intents">
              <p className="label" id="intents-label">Or start with a draft</p>
              <ul className="intent-list" aria-labelledby="intents-label">
                {intents.map(([title, note, subject, body]) => (
                  <li key={title}>
                    <a href={`${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`}>
                      <span className="intent-title">{title}</span>
                      <span className="intent-note">{note}</span>
                      <ArrowUpRight />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="closing-side">
            <div>
              <p className="label" id="closing-routes">Elsewhere</p>
              <ul className="route-list" aria-labelledby="closing-routes">
                <li><a href={linkedInUrl}><LinkedIn />LinkedIn<ArrowUpRight /></a></li>
                <li><a href={gitHubUrl}><GitHub />GitHub<ArrowUpRight /></a></li>
              </ul>
            </div>
            <div>
              <p className="label" id="close-resume-files">Resume files</p>
              <ul className="file-list" aria-labelledby="close-resume-files">
                {resumeOptions.map((option) => <li key={option.href}><a href={option.href}>{option.label}<span className="menu-format">{option.format}</span></a></li>)}
              </ul>
            </div>
            <p className="muted">Based in {profile.location.replace(/\s\d{5}$/, "")}.</p>
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
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-row">
          <p>© {new Date().getFullYear()} {profile.name}. Set in IBM Plex Sans and IBM Plex Mono.</p>
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

/**
 * The phone dock: once the first screen has scrolled away, the two actions a recruiter wants sit at the thumb, until
 * the closing sheet (which has the same actions) comes into view. Phones only, and only with JavaScript (enhance.ts
 * shows and hides it); without JavaScript the header menu and the close carry the same links.
 */
function Dock() {
  return (
    <nav className="dock js-only" aria-label="Quick contact" data-dock>
      <a className="btn btn--primary" href={roleEmail}><Mail />Email me</a>
      <a className="btn" href={resumeFile("one-page", "pdf")}><Download />Resume PDF</a>
    </nav>
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
      <Dock />
    </>
  );
}
