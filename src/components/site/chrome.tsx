import { createContext, useContext, useEffect, useState, type FormEvent, type ReactNode } from "react";
import { ArrowUpRight, Check, ChevronDown, Copy01, Download01, Mail01, Menu02, Moon01, Send01, Sun } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { Dropdown } from "@/components/base/dropdown/dropdown";
import { SlideoutMenu } from "@/components/application/slideout-menus/slideout-menu";
import GitHub from "@/components/foundations/social-icons/github";
import LinkedIn from "@/components/foundations/social-icons/linkedin";
import { formatCareerDate, profile as careerProfile } from "@/lib/career";
import { InspectProvider, InspectSummary, InspectToggle } from "./inspect";
import { type Chapter, caseStudyHref, email, emailAddress, gitHubUrl, href, linkedInUrl, projectDisplayName, projectNumber, recordUrl, resumeFile, root } from "./shared";

/** The route being rendered, so the sidebar can mark the current page during prerendering as well as in the browser. */
export const PathContext = createContext("/");
const usePath = () => useContext(PathContext);

const useHydrated = () => {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return ready;
};

function useActiveChapter(chapters: Chapter[]) {
  const [active, setActive] = useState(chapters[0]?.id);
  useEffect(() => {
    const elements = chapters.flatMap(({ id }) => document.getElementById(id) ?? []);
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (visible) setActive(visible.target.id);
    }, { rootMargin: "-30% 0px -65% 0px" });
    elements.forEach((element) => observer.observe(element));
    // Marks the page as mounted for the Scrollcraft verification harness (see docs/TESTING.md).
    document.documentElement.classList.add("sc-ready");
    return () => observer.disconnect();
  }, [chapters]);
  return chapters.find((chapter) => chapter.id === active) ?? chapters[0]!;
}

const themeColors = { light: "#f7f8fa", dark: "#0e1014" };

// Theme choice is applied before first paint by the inline script in index.html; this only flips and stores it.
function ThemeToggle({ className }: { className?: string }) {
  const [dark, setDark] = useState<boolean | null>(null);
  useEffect(() => setDark(document.documentElement.classList.contains("dark-mode")), []);
  if (dark === null) return <span className="theme-toggle-placeholder" aria-hidden="true" />;
  const flip = () => {
    const next = !dark;
    document.documentElement.classList.toggle("dark-mode", next);
    document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => meta.setAttribute("content", next ? themeColors.dark : themeColors.light));
    try { localStorage.setItem("theme", next ? "dark" : "light"); } catch { /* storage can be unavailable */ }
    setDark(next);
  };
  return <ButtonUtility className={className ?? ""} color="tertiary" size="xs" icon={dark ? Sun : Moon01} tooltip={dark ? "Switch to light mode" : "Switch to dark mode"} tooltipPlacement="top"
    onPress={() => {
      const motion = matchMedia("(prefers-reduced-motion: no-preference)").matches;
      if (motion && document.startViewTransition) document.startViewTransition(flip);
      else flip();
    }} />;
}

// Lets visitors pick the one-page or full resume. Without JavaScript the trigger stays a plain link to the full resume.
export function ResumeMenu({ variant, format = "pdf" }: { variant: "sidebar" | "hero" | "inline"; format?: "pdf" | "docx" }) {
  const ready = useHydrated();
  const formatName = format === "pdf" ? "PDF" : "Word";
  const label = variant === "inline" ? formatName : "Resume";
  const button = {
    sidebar: { color: "secondary", size: "sm", iconLeading: Download01, className: "w-full justify-start" },
    hero: { color: "secondary", size: "lg", iconLeading: Download01 },
    // Set inside a sentence, so it takes the sentence's size rather than the button scale.
    inline: { className: "text-[length:inherit]! font-medium! underline decoration-1 underline-offset-[0.2em]", color: "link-color", size: "md" },
  } as const;
  if (!ready) return <Button {...button[variant]} href={resumeFile("detailed", format)} download>{label}</Button>;
  return (
    <Dropdown.Root>
      <Button {...button[variant]} iconTrailing={ChevronDown} aria-label={`Download resume as ${formatName}`}>{label}</Button>
      <Dropdown.Popover placement={variant === "sidebar" ? "top start" : "bottom start"}>
        <Dropdown.Menu aria-label={`Choose a ${formatName} resume`}>
          <Dropdown.Item href={resumeFile("one-page", format)} download addon="1 page" textValue="One-page resume">One-page resume</Dropdown.Item>
          <Dropdown.Item href={resumeFile("detailed", format)} download addon="2 pages" textValue="Full resume">Full resume</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown.Root>
  );
}

// Clipboard copy needs JavaScript, so the button appears only after hydration; the mailto link always works.
export function CopyEmail() {
  const ready = useHydrated();
  const [copied, setCopied] = useState(false);
  if (!ready) return null;
  return <ButtonUtility className="copy-email" color="tertiary" size="xs" icon={copied ? Check : Copy01} tooltip={copied ? "Copied" : "Copy email address"}
    onPress={() => navigator.clipboard?.writeText(emailAddress).then(() => setCopied(true), () => setCopied(false))} />;
}

const pages = [{ path: "/", label: "Home" }, { path: "/experience/", label: "Experience" }];

/** The links every page shares: pages, the outline of this page, and the six projects. Used by the sidebar and the phone menu. */
function SiteLinks({ chapters, active, onNavigate }: { chapters: Chapter[]; active: Chapter; onNavigate?: () => void }) {
  const path = usePath();
  return (
    <>
      <nav className="side-group" aria-label="Pages">
        <ul>
          {pages.map((page) => (
            <li key={page.path}><a className="side-link" href={href(page.path.slice(1))} onClick={onNavigate} aria-current={path === page.path ? "page" : undefined}>{page.label}</a></li>
          ))}
        </ul>
      </nav>
      <nav className="side-group" aria-label="On this page">
        <p className="side-label" aria-hidden="true">On this page</p>
        <ol>
          {chapters.map((chapter) => (
            <li key={chapter.id}><a className="side-link side-link-sub" href={`#${chapter.id}`} onClick={onNavigate} aria-current={chapter.id === active.id ? "location" : undefined}>{chapter.label}</a></li>
          ))}
        </ol>
      </nav>
      <nav className="side-group" aria-label="Projects">
        <p className="side-label" aria-hidden="true">Projects</p>
        <ol>
          {careerProfile.projects.map((project) => (
            <li key={project.slug}>
              <a className="side-link side-link-project" href={caseStudyHref(project)} onClick={onNavigate} aria-current={path === `/experience/${project.slug}/` ? "page" : undefined}>
                <span className="side-number" aria-hidden="true">{projectNumber(project)}</span>{projectDisplayName(project)}
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}

function Sidebar({ chapters, active }: { chapters: Chapter[]; active: Chapter }) {
  return (
    <aside className="wb-side" aria-label="Site">
      <a className="side-id" href={root}>
        <strong>{careerProfile.name}</strong>
        <span>{careerProfile.headline}</span>
      </a>
      <div className="side-scroll">
        <SiteLinks chapters={chapters} active={active} />
      </div>
      <div className="side-foot">
        <Button href={`${email}?subject=${encodeURIComponent("Forward Deployed Engineer role")}`} size="sm" iconLeading={Mail01} className="w-full justify-start">Email me</Button>
        <ResumeMenu variant="sidebar" />
        <p className="side-elsewhere">
          <a href={linkedInUrl}><LinkedIn aria-hidden="true" />LinkedIn</a>
          <a href={gitHubUrl}><GitHub aria-hidden="true" />GitHub</a>
        </p>
      </div>
    </aside>
  );
}

/** Below the sidebar breakpoint: the name, where you are, the inspector and a menu. Without JavaScript, plain links. */
function TopBar({ chapters, active }: { chapters: Chapter[]; active: Chapter }) {
  const ready = useHydrated();
  return (
    <header className="wb-top">
      <a className="top-name" href={root}>{careerProfile.name}<span>{careerProfile.headline}</span></a>
      {ready ? (
        <div className="top-actions">
          <InspectToggle compact className="top-inspect" />
          <SlideoutMenu.Trigger>
            <Button color="secondary" size="sm" iconLeading={Menu02} className="top-menu" aria-label={`Menu. Current section: ${active.label}`}>
              <span className="top-where">{active.label}</span>
            </Button>
            <SlideoutMenu isDismissable className="z-50">
              {({ close }) => (
                <>
                  <SlideoutMenu.Header onClose={close}><p className="text-lg font-semibold text-primary">Menu</p></SlideoutMenu.Header>
                  <SlideoutMenu.Content role="presentation" className="sheet">
                    <SiteLinks chapters={chapters} active={active} onNavigate={close} />
                    <p className="sheet-elsewhere"><a href={linkedInUrl}><LinkedIn aria-hidden="true" />LinkedIn</a><a href={gitHubUrl}><GitHub aria-hidden="true" />GitHub</a></p>
                  </SlideoutMenu.Content>
                  <SlideoutMenu.Footer className="flex flex-col gap-3">
                    <div className="sheet-theme"><span>Theme</span><ThemeToggle /></div>
                    <Button href={resumeFile("one-page", "pdf")} download color="secondary" iconLeading={Download01}>One-page resume (PDF)</Button>
                    <Button href={resumeFile("detailed", "pdf")} download color="secondary" iconLeading={Download01}>Full resume (PDF)</Button>
                    <Button href={`${email}?subject=${encodeURIComponent("Forward Deployed Engineer role")}`} iconLeading={Mail01}>Email me</Button>
                  </SlideoutMenu.Footer>
                </>
              )}
            </SlideoutMenu>
          </SlideoutMenu.Trigger>
        </div>
      ) : (
        <nav className="top-links" aria-label="Pages">
          <a href={href("#work")}>Work</a>
          <a href={href("experience/")}>Experience</a>
          <a href="#contact">Contact</a>
        </nav>
      )}
    </header>
  );
}

/** The bottom line of the surface: where you are, the record it reads from, the inspector and the theme. */
function StatusBar({ active }: { active: Chapter }) {
  const path = usePath();
  return (
    <div className="wb-status" role="region" aria-label="Status bar">
      <p className="status-where"><code>{path === "/" ? "" : path.replace(/\/$/, "")}/#{active.id}</code></p>
      <InspectSummary />
      <p className="status-record"><code>career.json</code> · as of {formatCareerDate(careerProfile.experienceAsOf)} · <a href={recordUrl}>view the record<ArrowUpRight aria-hidden="true" /></a></p>
      <InspectToggle className="status-inspect" />
      <ThemeToggle className="status-theme" />
    </div>
  );
}

/**
 * The frame of every page: an app surface with a sidebar (wide screens) or a top bar (narrow), the page itself,
 * the contact composer, and a status bar. The sidebar is real navigation and works without JavaScript.
 */
export function Page({ chapters, children }: { chapters: Chapter[]; children: ReactNode }) {
  const outline = [...chapters, { id: "contact", label: "Contact" }];
  const active = useActiveChapter(outline);
  const ready = useHydrated();
  return (
    <InspectProvider>
      <div className="wb">
        <Sidebar chapters={outline} active={active} />
        <TopBar chapters={outline} active={active} />
        <div className="wb-main">
          <main id="main-content" tabIndex={-1}>{children}</main>
          <Closing />
        </div>
        {ready && <StatusBar active={active} />}
      </div>
    </InspectProvider>
  );
}

const topics = ["Forward Deployed Engineer role", "AI workflow audit", "Something else"];

/**
 * The close is an input: a message composer that opens the visitor's email app, addressed and titled. There is no
 * server; nothing is sent from the page. Without JavaScript the form still submits to the mailto address natively.
 */
function Composer() {
  const [topic, setTopic] = useState(topics[0]!);
  const [message, setMessage] = useState("");
  const body = message.trim();
  const composed = `${email}?subject=${encodeURIComponent(topic)}${body ? `&body=${encodeURIComponent(body)}` : ""}`;
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    window.location.href = composed;
  };
  return (
    <form className="composer" action={email} method="get" onSubmit={submit} aria-labelledby="composer-title" data-mailto={composed}>
      <div className="composer-head">
        <p id="composer-title">New message</p>
        <p className="composer-to"><span>To</span> <code>{emailAddress}</code></p>
      </div>
      <label className="composer-field">
        <span>Topic</span>
        <select name="subject" value={topic} onChange={(event) => setTopic(event.target.value)}>
          {topics.map((item) => <option key={item}>{item}</option>)}
        </select>
      </label>
      <label className="composer-field">
        <span>Message</span>
        <textarea name="body" rows={5} value={message} onChange={(event) => setMessage(event.target.value)}
          placeholder="A line about the role or the workflow is plenty." />
      </label>
      <div className="composer-foot">
        <p>Opens in your email app. Nothing is sent from this page.</p>
        <Button type="submit" size="md" iconTrailing={Send01}>Open in email</Button>
      </div>
    </form>
  );
}

const auditSteps = [
  ["Week 1", "Map the workflow", "I sit with the people who run one workflow, such as intake, claims, documents, or reporting, and trace where the time goes, where the data lives, and which rules apply."],
  ["Week 2", "Test where AI helps", "I try AI on synthetic or approved data and show where it earns its place, where it doesn't, and what it would take to run it for real."],
  ["Handoff", "Leave with a plan", "You get ranked opportunities, the risks, and a scoped first build, walked through with your team so it doesn't sit in a drawer."],
] as const;

/** The close of every page: the question, a composer, the direct routes, the audit offer and the small print. */
export function Closing() {
  return (
    <footer className="closing" id="contact" aria-labelledby="contact-heading" data-sc-act="input">
      <div className="wb-container">
        <div className="closing-grid">
          <div className="closing-intro">
            <h2 id="contact-heading">Hiring a Forward Deployed Engineer, or have one workflow that needs fixing?</h2>
            <p>Write a line and it opens in your email app, addressed to me. Or use any of these.</p>
            <dl className="closing-direct">
              <div><dt>Email</dt><dd><a href={email}>{emailAddress}</a><CopyEmail /></dd></div>
              <div><dt>LinkedIn</dt><dd><a href={linkedInUrl}>linkedin.com/in/moheyeldin</a></dd></div>
              <div><dt>GitHub</dt><dd><a href={gitHubUrl}>github.com/mohamedmoheyeldin</a></dd></div>
              <div><dt>Resume</dt><dd>One page or full, as <ResumeMenu variant="inline" format="pdf" /> or <ResumeMenu variant="inline" format="docx" /></dd></div>
            </dl>
          </div>
          <Composer />
        </div>
        <section className="audit" aria-labelledby="audit-heading" id="work-with-me">
          <div className="audit-intro">
            <h3 id="audit-heading">For teams: a two-week AI workflow audit</h3>
            <p>Fixed price, quoted after a short intro call. For teams that want AI in a real workflow but don't have the people to scope it yet. <a href={`${email}?subject=${encodeURIComponent("AI workflow audit")}`}>Ask about the audit</a>.</p>
          </div>
          <ol className="audit-steps">
            {auditSteps.map(([label, title, text]) => <li key={label}><span>{label}</span><h4>{title}</h4><p>{text}</p></li>)}
          </ol>
        </section>
        <div className="closing-small">
          {/* The prerendered year can lag the visitor's clock until the next build. */}
          <p><span suppressHydrationWarning>© {new Date().getFullYear()} {careerProfile.name}.</span> Set in Inter and Geist Mono. <a href={href("experience/portfolio-career-content-system/")}>How this site is built</a></p>
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
      </div>
    </footer>
  );
}
