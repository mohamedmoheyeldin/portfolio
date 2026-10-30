import { useEffect, useState, type ReactNode } from "react";
import { Radio, RadioGroup } from "react-aria-components";
import { ArrowUpRight, Check, ChevronDown, Copy01, Download01, Mail01, Menu02, Moon01, Sun } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { Dropdown } from "@/components/base/dropdown/dropdown";
import { SlideoutMenu } from "@/components/application/slideout-menus/slideout-menu";
import { NavItemBase } from "@/components/application/app-navigation/base-components/nav-item";
import GitHub from "@/components/foundations/social-icons/github";
import LinkedIn from "@/components/foundations/social-icons/linkedin";
import { type Chapter, type Depth, depths, email, emailAddress, gitHubUrl, href, linkedInUrl, resumeFile, roleEmail, root } from "./shared";

const useHydrated = () => {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return ready;
};

/** The masthead scrolls away with the title page; on wide screens the folio takes over navigation. */
export function Masthead({ name, headline, path }: { name: string; headline: string; path: string }) {
  return (
    <header className="masthead">
      <div className="shell masthead-inner">
        <a className="masthead-name" href={root}>
          <span>{name}</span>
          <span className="masthead-role">{headline}</span>
        </a>
        <nav className="masthead-nav" aria-label="Primary navigation">
          <a href={path === "/" ? "#work" : href("#work")}>Work</a>
          <a href={href("experience/")} aria-current={path.startsWith("/experience/") ? "page" : undefined}>Experience</a>
          <a href="#contact">Contact</a>
        </nav>
        <div className="masthead-actions">
          <ThemeToggle />
          <ResumeMenu variant="masthead" />
          <Button className="max-[720px]:hidden" href={roleEmail} size="sm" iconLeading={Mail01}>Email me</Button>
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
  return <ButtonUtility color="tertiary" size="sm" icon={dark ? Sun : Moon01} tooltip={dark ? "Switch to light mode" : "Switch to dark mode"} tooltipPlacement="bottom"
    onPress={() => {
      const next = !dark;
      document.documentElement.classList.toggle("dark-mode", next);
      try { localStorage.setItem("theme", next ? "dark" : "light"); } catch { /* storage can be unavailable */ }
      setDark(next);
    }} />;
}

// Lets visitors pick the one-page or full resume. Without JavaScript the trigger stays a plain link to the full resume.
export function ResumeMenu({ variant, format = "pdf" }: { variant: "masthead" | "hero" | "folio" | "colophon"; format?: "pdf" | "docx" }) {
  const ready = useHydrated();
  const formatName = format === "pdf" ? "PDF" : "Word";
  const label = variant === "colophon" ? formatName : "Resume";
  const button = {
    masthead: { className: "max-[720px]:hidden", color: "secondary", size: "sm", iconLeading: Download01 },
    hero: { color: "secondary", size: "xl", iconLeading: Download01 },
    folio: { color: "link-gray", size: "sm", iconLeading: Download01 },
    // Set inside a sentence, so it takes the sentence's size and weight rather than the button scale.
    colophon: { className: "text-[length:inherit]! text-(--pf-accent)! font-normal! underline decoration-1 underline-offset-[0.2em]", color: "link-color", size: "md" },
  } as const;
  if (!ready) return <Button {...button[variant]} href={resumeFile("detailed", format)} download>{label}</Button>;
  return (
    <Dropdown.Root>
      <Button {...button[variant]} iconTrailing={ChevronDown} aria-label={`Download resume as ${formatName}`}>{label}</Button>
      <Dropdown.Popover placement={variant === "masthead" ? "bottom end" : variant === "folio" ? "right" : "bottom start"}>
        <Dropdown.Menu aria-label={`Choose a ${formatName} resume`}>
          <Dropdown.Item href={resumeFile("one-page", format)} download addon="1 page" textValue="One-page resume">One-page resume</Dropdown.Item>
          <Dropdown.Item href={resumeFile("detailed", format)} download addon="2 pages" textValue="Full resume">Full resume</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown.Root>
  );
}

const isDepth = (value: unknown): value is Depth => depths.some((depth) => depth.id === value);

/**
 * The signature move: one reading depth for the whole site. The inline script in index.html applies the saved
 * depth before first paint. Changing it keeps the block at the top of the screen in place, so the reader never loses
 * their spot, and every control on the page stays in sync through the "depthchange" event.
 */
function useDepth() {
  const [depth, setDepthState] = useState<Depth | null>(null);
  useEffect(() => {
    const read = () => {
      const value = document.documentElement.dataset.read;
      setDepthState(isDepth(value) ? value : "full");
    };
    read();
    window.addEventListener("depthchange", read);
    return () => window.removeEventListener("depthchange", read);
  }, []);
  const setDepth = (next: Depth) => {
    // Keep the visible block nearest the top of the screen fixed: the smallest, closest anchor, not its chapter.
    const anchor = [...document.querySelectorAll<HTMLElement>("[data-anchor]")]
      .map((element) => ({ element, rect: element.getBoundingClientRect() }))
      .filter(({ rect }) => rect.height > 0 && rect.bottom > 80 && rect.top < window.innerHeight)
      .sort((a, b) => Math.abs(a.rect.top) - Math.abs(b.rect.top))[0]?.element;
    const before = anchor?.getBoundingClientRect().top ?? 0;
    document.documentElement.dataset.read = next;
    try { localStorage.setItem("read", next); } catch { /* storage can be unavailable */ }
    const keepPlace = () => {
      if (anchor && window.scrollY > 0) window.scrollTo({ top: window.scrollY + anchor.getBoundingClientRect().top - before, behavior: "instant" });
    };
    keepPlace();
    window.dispatchEvent(new Event("depthchange"));
    // Components that react to the change (the depth note) render after this; correct once more when they have.
    requestAnimationFrame(keepPlace);
  };
  return [depth, setDepth] as const;
}

export function DepthControl({ compact = false }: { compact?: boolean }) {
  const [depth, setDepth] = useDepth();
  if (!depth) return null;
  const current = depths.find((item) => item.id === depth)!;
  return (
    <div className={compact ? "depth-control depth-control-compact" : "depth-control"}>
      <RadioGroup aria-label="How much to read" value={depth} onChange={(value) => isDepth(value) && setDepth(value)} orientation="horizontal" className="depth-options">
        {!compact && <span className="folio-label" aria-hidden="true">How much to read</span>}
        <div className="depth-segments">
          {depths.map((item) => (
            <Radio key={item.id} value={item.id} className="depth-option" aria-label={`${item.label}: ${item.description}`}>{item.label}</Radio>
          ))}
        </div>
      </RadioGroup>
      {!compact && <p className="depth-description" aria-live="polite">{current.description}.</p>}
    </div>
  );
}

/** Shown under a title page when the chosen depth hides some of it, with a one-tap way to see everything. */
export function DepthNote() {
  const [depth, setDepth] = useDepth();
  if (!depth || depth === "full") return null;
  return <p className="depth-note">You are reading the {depth === "brief" ? "skim" : "standard"} version. <button type="button" onClick={() => setDepth("full")}>Show everything</button></p>;
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

/**
 * A page set as a printed feature: the folio sits in the margin on wide screens with the contents, the depth
 * control and the resume; on narrow screens it becomes a bar at the bottom edge. Chapter links work without JavaScript.
 */
export function Page({ chapters, children }: { chapters: Chapter[]; children: ReactNode }) {
  const active = useActiveChapter(chapters);
  const ready = useHydrated();
  const activeIndex = Math.max(0, chapters.findIndex((chapter) => chapter.id === active));
  return (
    <div className="page">
      <aside className="folio" aria-label="Contents">
        <div className="folio-inner">
          <p className="folio-label">Contents</p>
          <ol className="folio-chapters">
            {chapters.map((chapter, index) => (
              <li key={chapter.id}>
                <a href={`#${chapter.id}`} aria-current={ready && chapter.id === active ? "location" : undefined}>
                  <span className="folio-number" aria-hidden="true">{index}</span>{chapter.label}
                </a>
              </li>
            ))}
          </ol>
          <div className="folio-progress" aria-hidden="true" />
          <DepthControl />
          <div className="folio-links">
            <ResumeMenu variant="folio" />
            <Button color="link-gray" size="sm" href={roleEmail} iconLeading={Mail01}>Email me</Button>
          </div>
        </div>
      </aside>
      {ready && <FolioBar chapters={chapters} active={chapters[activeIndex]!} />}
      <div className="page-body">{children}</div>
    </div>
  );
}

function FolioBar({ chapters, active }: { chapters: Chapter[]; active: Chapter }) {
  return (
    <div className="folio-bar" role="region" aria-label="Reading controls">
      <SlideoutMenu.Trigger>
        <Button color="tertiary" size="sm" iconLeading={Menu02} className="folio-bar-contents" aria-label={`Contents. Current chapter: ${active.label}`}>
          <span className="truncate">{active.label}</span>
        </Button>
        <SlideoutMenu isDismissable className="z-50">
          {({ close }) => (
            <>
              <SlideoutMenu.Header onClose={close}><p className="text-lg font-semibold text-primary">Contents</p></SlideoutMenu.Header>
              <SlideoutMenu.Content role="presentation">
                <nav aria-label="Chapters" className="sheet-section">
                  <ol className="folio-chapters">
                    {chapters.map((chapter, index) => (
                      <li key={chapter.id}><a href={`#${chapter.id}`} onClick={close} aria-current={chapter.id === active.id ? "location" : undefined}><span className="folio-number" aria-hidden="true">{index}</span>{chapter.label}</a></li>
                    ))}
                  </ol>
                </nav>
                <nav aria-label="Site" className="sheet-section flex flex-col gap-1">
                  <NavItemBase type="link" href={root}>Home</NavItemBase>
                  <NavItemBase type="link" href={href("experience/")}>Experience</NavItemBase>
                </nav>
              </SlideoutMenu.Content>
              <SlideoutMenu.Footer className="flex flex-col gap-3">
                <Button href={resumeFile("one-page", "pdf")} download color="secondary" iconLeading={Download01}>One-page resume</Button>
                <Button href={resumeFile("detailed", "pdf")} download color="secondary" iconLeading={Download01}>Full resume</Button>
                <Button href={roleEmail} iconLeading={Mail01}>Email me</Button>
              </SlideoutMenu.Footer>
            </>
          )}
        </SlideoutMenu>
      </SlideoutMenu.Trigger>
      <DepthControl compact />
    </div>
  );
}

// Clipboard copy needs JavaScript, so the button appears only after hydration; the mailto link always works.
export function CopyEmail() {
  const ready = useHydrated();
  const [copied, setCopied] = useState(false);
  if (!ready) return null;
  return <ButtonUtility color="tertiary" size="xs" icon={copied ? Check : Copy01} tooltip={copied ? "Copied" : "Copy email address"}
    onPress={() => navigator.clipboard?.writeText(emailAddress).then(() => setCopied(true), () => setCopied(false))} />;
}

const auditSteps = [
  ["Week 1", "Map the workflow", "I sit with the people who run one workflow, such as intake, claims, documents, or reporting, and trace where the time goes, where the data lives, and which rules apply."],
  ["Week 2", "Test where AI helps", "I try AI on synthetic or approved data and show where it earns its place, where it doesn't, and what it would take to run it for real."],
  ["Handoff", "Leave with a plan", "You get ranked opportunities, the risks, and a scoped first build, walked through with your team so it doesn't sit in a drawer."],
] as const;

/**
 * The close of every page: a hard cut to the opposite ground, the offer, and the ways to reach me set as running text.
 * It always uses the dark tokens so the Untitled UI components inside keep their dark-theme contrast.
 */
export function Colophon({ name }: { name: string }) {
  return (
    <footer className="colophon dark-mode" id="contact" aria-labelledby="contact-heading">
      <div className="shell colophon-inner">
        <h2 id="contact-heading">Hiring a Forward Deployed Engineer, or have one workflow that needs fixing?</h2>
        <p className="colophon-lede">
          Email me at <a href={roleEmail}>{emailAddress}</a><CopyEmail />, or find me on <a href={linkedInUrl}>LinkedIn</a> and <a href={gitHubUrl}>GitHub</a>.
          My resume comes in a one-page and a full version, as <ResumeMenu variant="colophon" format="pdf" /> or <ResumeMenu variant="colophon" format="docx" />.
        </p>
        <div className="colophon-actions">
          <Button href={roleEmail} size="xl" iconLeading={Mail01}>Email me</Button>
          <ButtonUtility color="secondary" size="sm" icon={LinkedIn} tooltip="LinkedIn" href={linkedInUrl} />
          <ButtonUtility color="secondary" size="sm" icon={GitHub} tooltip="GitHub" href={gitHubUrl} />
        </div>
        <section className="audit" aria-labelledby="audit-heading" id="work-with-me" data-detail="standard">
          <div>
            <p className="audit-kicker">For teams</p>
            <h3 id="audit-heading">A two-week AI workflow audit.</h3>
            <p>Fixed price, quoted after a short intro call. For teams that want AI in a real workflow but don't have the people to scope it yet. <a href={`${email}?subject=${encodeURIComponent("AI workflow audit")}`}>Ask about the audit</a>.</p>
          </div>
          <ol>
            {auditSteps.map(([label, title, text]) => <li key={label}><span>{label}</span><h4>{title}</h4><p>{text}</p></li>)}
          </ol>
        </section>
        <div className="colophon-small">
          {/* The prerendered year can lag the visitor's clock until the next build. */}
          <p><span suppressHydrationWarning>© {new Date().getFullYear()} {name}.</span> Set in Newsreader and Inter. <a href={href("experience/portfolio-career-content-system/")}>How this site is built<ArrowUpRight aria-hidden="true" className="inline size-3.5 align-[-2px]" /></a></p>
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
