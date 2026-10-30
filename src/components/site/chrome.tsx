import { useEffect, useState, type ReactNode } from "react";
import { ArrowUpRight, Check, ChevronDown, Copy01, Download01, Mail01, Menu02, Moon01, Sun } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { Dropdown } from "@/components/base/dropdown/dropdown";
import { SlideoutMenu } from "@/components/application/slideout-menus/slideout-menu";
import { NavItemBase } from "@/components/application/app-navigation/base-components/nav-item";
import GitHub from "@/components/foundations/social-icons/github";
import LinkedIn from "@/components/foundations/social-icons/linkedin";
import { TraceProvider } from "./trace";
import { type Chapter, email, emailAddress, gitHubUrl, href, linkedInUrl, resumeFile, roleEmail, root } from "./shared";

const useHydrated = () => {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return ready;
};

/**
 * The masthead is static and scrolls away. On the home page it sits on the blue plate as the top line of the poster
 * and leaves the name to the wordmark below it; elsewhere it carries the name. After it leaves, the dock takes over.
 */
export function Masthead({ name, headline, path }: { name: string; headline: string; path: string }) {
  const home = path === "/";
  // Pages that open on the plate (home and the case studies) carry the masthead on it too.
  const plate = home || /^\/experience\/[^/]+\/$/.test(path);
  return (
    <header className={plate ? "masthead plate" : "masthead"}>
      <div className="shell masthead-inner">
        <a className="masthead-name" href={root}>
          <span className={home ? "sr-only" : undefined}>{name}</span>
          <span className="masthead-role">{headline}</span>
        </a>
        <nav className="masthead-nav" aria-label="Primary navigation">
          <a href={home ? "#work" : href("#work")}>Work</a>
          <a href={href("experience/")} aria-current={path.startsWith("/experience/") ? "page" : undefined}>Experience</a>
          <a href="#contact">Contact</a>
        </nav>
        <div className="masthead-actions">
          <ThemeToggle />
          <ResumeMenu variant="masthead" />
        </div>
      </div>
    </header>
  );
}

// Theme choice is applied before first paint by the inline script in index.html; this only flips and stores it.
function ThemeToggle() {
  const [dark, setDark] = useState<boolean | null>(null);
  useEffect(() => setDark(document.documentElement.classList.contains("dark-mode")), []);
  if (dark === null) return <span className="theme-toggle-placeholder" aria-hidden="true" />;
  return <ButtonUtility className="theme-toggle plate-ghost" color="tertiary" size="sm" icon={dark ? Sun : Moon01} tooltip={dark ? "Switch to light mode" : "Switch to dark mode"} tooltipPlacement="bottom"
    onPress={() => {
      const next = !dark;
      document.documentElement.classList.toggle("dark-mode", next);
      try { localStorage.setItem("theme", next ? "dark" : "light"); } catch { /* storage can be unavailable */ }
      setDark(next);
    }} />;
}

// Lets visitors pick the one-page or full resume. Without JavaScript the trigger stays a plain link to the full resume.
export function ResumeMenu({ variant, format = "pdf" }: { variant: "masthead" | "hero" | "closing"; format?: "pdf" | "docx" }) {
  const ready = useHydrated();
  const formatName = format === "pdf" ? "PDF" : "Word";
  const label = variant === "closing" ? formatName : "Resume";
  const button = {
    masthead: { className: "plate-ghost max-[560px]:hidden", color: "tertiary", size: "sm", iconLeading: Download01 },
    hero: { color: "tertiary", size: "xl", iconLeading: Download01, className: "plate-ghost ring-1 ring-inset ring-(--pf-plate-rule)" },
    // Set inside a sentence, so it takes the sentence's size and weight rather than the button scale.
    closing: { className: "text-[length:inherit]! font-semibold! underline decoration-1 underline-offset-[0.2em]", color: "link-color", size: "md" },
  } as const;
  if (!ready) return <Button {...button[variant]} href={resumeFile("detailed", format)} download>{label}</Button>;
  return (
    <Dropdown.Root>
      <Button {...button[variant]} iconTrailing={ChevronDown} aria-label={`Download resume as ${formatName}`}>{label}</Button>
      <Dropdown.Popover placement={variant === "masthead" ? "bottom end" : "bottom start"}>
        <Dropdown.Menu aria-label={`Choose a ${formatName} resume`}>
          <Dropdown.Item href={resumeFile("one-page", format)} download addon="1 page" textValue="One-page resume">One-page resume</Dropdown.Item>
          <Dropdown.Item href={resumeFile("detailed", format)} download addon="2 pages" textValue="Full resume">Full resume</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown.Root>
  );
}

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
  return active;
}

/** The dock waits until the opening section has left the screen, so it never sits on top of the hero's own actions. */
function useIntroGone() {
  const [gone, setGone] = useState(false);
  useEffect(() => {
    const intro = document.getElementById("introduction");
    if (!intro) return setGone(true);
    const observer = new IntersectionObserver(([entry]) => setGone(!entry!.isIntersecting && entry!.boundingClientRect.top < 0), { rootMargin: "-25% 0px 0px 0px" });
    observer.observe(intro);
    return () => observer.disconnect();
  }, []);
  return gone;
}

/**
 * A page of sections. With JavaScript it adds the dock (index and "Email me", bottom right) and the trace bar.
 * Without it, the masthead links and the sections themselves are the navigation.
 */
export function Page({ chapters, children }: { chapters: Chapter[]; children: ReactNode }) {
  const active = useActiveChapter(chapters);
  const ready = useHydrated();
  return (
    <TraceProvider>
      <div className="page">{children}</div>
      {ready && <Dock chapters={chapters} active={chapters.find((chapter) => chapter.id === active) ?? chapters[0]!} />}
    </TraceProvider>
  );
}

function Dock({ chapters, active }: { chapters: Chapter[]; active: Chapter }) {
  const shown = useIntroGone();
  return (
    <div className="dock" role="region" aria-label="Page index and contact" data-shown={shown || undefined} inert={!shown || undefined}>
      <SlideoutMenu.Trigger>
        <Button color="tertiary" size="md" iconLeading={Menu02} className="dock-index" aria-label={`Index. Current section: ${active.label}`}>
          <span className="truncate">{active.label}</span>
        </Button>
        <SlideoutMenu isDismissable className="z-50">
          {({ close }) => (
            <>
              <SlideoutMenu.Header onClose={close}><p className="text-lg font-semibold text-primary">Index</p></SlideoutMenu.Header>
              <SlideoutMenu.Content role="presentation">
                <nav aria-label="On this page" className="sheet-section">
                  <p className="sheet-label">On this page</p>
                  <ol className="sheet-chapters">
                    {chapters.map((chapter) => (
                      <li key={chapter.id}><a href={`#${chapter.id}`} onClick={close} aria-current={chapter.id === active.id ? "location" : undefined}>{chapter.label}</a></li>
                    ))}
                  </ol>
                </nav>
                <nav aria-label="Site" className="sheet-section flex flex-col gap-1">
                  <p className="sheet-label">Pages</p>
                  <NavItemBase type="link" href={root}>Home</NavItemBase>
                  <NavItemBase type="link" href={href("experience/")}>Experience</NavItemBase>
                  <NavItemBase type="link" href={linkedInUrl} icon={LinkedIn}>LinkedIn</NavItemBase>
                  <NavItemBase type="link" href={gitHubUrl} icon={GitHub}>GitHub</NavItemBase>
                </nav>
              </SlideoutMenu.Content>
              <SlideoutMenu.Footer className="flex flex-col gap-3">
                <Button href={resumeFile("one-page", "pdf")} download color="secondary" iconLeading={Download01}>One-page resume (PDF)</Button>
                <Button href={resumeFile("detailed", "pdf")} download color="secondary" iconLeading={Download01}>Full resume (PDF)</Button>
                <Button href={roleEmail} iconLeading={Mail01}>Email me</Button>
              </SlideoutMenu.Footer>
            </>
          )}
        </SlideoutMenu>
      </SlideoutMenu.Trigger>
      <Button href={roleEmail} size="md" iconLeading={Mail01}>Email me</Button>
    </div>
  );
}

// Clipboard copy needs JavaScript, so the button appears only after hydration; the mailto link always works.
export function CopyEmail() {
  const ready = useHydrated();
  const [copied, setCopied] = useState(false);
  if (!ready) return null;
  return <ButtonUtility className="copy-email plate-ghost" color="tertiary" size="xs" icon={copied ? Check : Copy01} tooltip={copied ? "Copied" : "Copy email address"}
    onPress={() => navigator.clipboard?.writeText(emailAddress).then(() => setCopied(true), () => setCopied(false))} />;
}

const auditSteps = [
  ["Week 1", "Map the workflow", "I sit with the people who run one workflow, such as intake, claims, documents, or reporting, and trace where the time goes, where the data lives, and which rules apply."],
  ["Week 2", "Test where AI helps", "I try AI on synthetic or approved data and show where it earns its place, where it doesn't, and what it would take to run it for real."],
  ["Handoff", "Leave with a plan", "You get ranked opportunities, the risks, and a scoped first build, walked through with your team so it doesn't sit in a drawer."],
] as const;

/**
 * The close of every page: the blue plate again, and the one action at poster scale. It holds still; the resume,
 * LinkedIn and GitHub follow as a sentence, then the audit offer and the small print.
 */
export function Closing({ name }: { name: string }) {
  return (
    <footer className="closing plate" id="contact" aria-labelledby="contact-heading" data-sc-act="plate">
      <div className="shell closing-inner">
        <h2 id="contact-heading">Hiring a Forward Deployed Engineer, or have one workflow that needs fixing?</h2>
        <a className="closing-mail" href={roleEmail}>Email me<ArrowUpRight aria-hidden="true" /></a>
        <p className="closing-lede">
          <span className="closing-address">{emailAddress}<CopyEmail /></span> Or find me on <a href={linkedInUrl}>LinkedIn</a> and <a href={gitHubUrl}>GitHub</a>.
          My resume comes in a one-page and a full version, as <ResumeMenu variant="closing" format="pdf" /> or <ResumeMenu variant="closing" format="docx" />.
        </p>
        <section className="audit" aria-labelledby="audit-heading" id="work-with-me">
          <div>
            <p className="audit-kicker">For teams</p>
            <h3 id="audit-heading">A two-week AI workflow audit.</h3>
            <p>Fixed price, quoted after a short intro call. For teams that want AI in a real workflow but don't have the people to scope it yet. <a href={`${email}?subject=${encodeURIComponent("AI workflow audit")}`}>Ask about the audit</a>.</p>
          </div>
          <ol>
            {auditSteps.map(([label, title, text]) => <li key={label}><span>{label}</span><h4>{title}</h4><p>{text}</p></li>)}
          </ol>
        </section>
        <div className="closing-small">
          {/* The prerendered year can lag the visitor's clock until the next build. */}
          <p><span suppressHydrationWarning>© {new Date().getFullYear()} {name}.</span> Set in Archivo and Inter. <a href={href("experience/portfolio-career-content-system/")}>How this site is built<ArrowUpRight aria-hidden="true" className="inline size-3.5 align-[-2px]" /></a></p>
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
