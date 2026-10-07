import { useEffect, useRef, useState } from "react";
import { Tabs } from "@/components/application/tabs/tabs";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  Check,
  Code02,
  LayersTwo01,
  GitBranch01,
  Download01,
  Mail01,
  File06,
  BookOpen01,
  Award01,
  ShieldTick,
  Copy01,
  SearchLg,
  MessageChatCircle,
  ClipboardCheck,
  PresentationChart01,
  LifeBuoy01,
  CheckVerified01,
  Moon01,
  Sun,
  Menu02,
  Briefcase01,
} from "@untitledui/icons";
import { Button, type Props as ButtonComponentProps } from "@/components/base/buttons/button";
import { Badge, BadgeWithIcon } from "@/components/base/badges/badges";
import { BadgeGroup } from "@/components/base/badges/badge-groups";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import GitHub from "@/components/foundations/social-icons/github";
import LinkedIn from "@/components/foundations/social-icons/linkedin";
import { BackgroundPattern } from "@/components/shared-assets/background-patterns";
import { Illustration } from "@/components/shared-assets/illustrations";
import { SlideoutMenu } from "@/components/application/slideout-menus/slideout-menu";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { NavItemBase } from "@/components/application/app-navigation/base-components/nav-item";
import { formatCareerDate, profile as careerProfile, veteransAffairsName } from "@/lib/career";
import credentialImages from "@/content/credential-images.json";

type Profile = typeof careerProfile;
type Project = Profile["projects"][number];
const emailAddress = "mohamedmoheyeldin.jobs@gmail.com";
const email = `mailto:${emailAddress}`;
const root = `${import.meta.env.BASE_URL.replace(/\/?$/, "")}/`;
const href = (path = "") => `${root}${path}`;
const resumePdf = href("resume/mohamed-moheyeldin-resume-detailed.pdf");
const resumeWord = href("resume/mohamed-moheyeldin-resume-detailed.docx");
const linkedInUrl = "https://www.linkedin.com/in/moheyeldin/";
const gitHubUrl = "https://github.com/mohamedmoheyeldin";

export function Header({ name, headline, location, path }: { name: string; headline: string; location: string; path: string }) {
  const headerRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const updateHeight = () => document.documentElement.style.setProperty("--site-header-height", `${header.getBoundingClientRect().height}px`);
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(header);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty("--site-header-height");
    };
  }, []);
  return (
    <header className="site-header" ref={headerRef}>
      <div className="shell header-inner">
        <div className="header-brand">
          <Button color="link-gray" size="lg" href={root} aria-label={`${name}, home`}>
            {name}
          </Button>
          <span className="wordmark-caption">{headline}</span>
          <span className="header-location">{location.replace(/\s+\d{5}(?:-\d{4})?$/, "")}</span>
        </div>
        <nav aria-label="Primary navigation">
          <NavItemBase type="link" href={root} current={path === "/"}>
            Home
          </NavItemBase>
          <NavItemBase type="link"
            href={href("experience/")}
            current={path.includes("/experience")}
          >
            Experience
          </NavItemBase>
        </nav>
        <div className="header-contact">
          <ThemeToggle />
          <MobileMenu path={path} />
          <Button className="max-[720px]:hidden" href={resumePdf} download color="secondary" size="sm" iconLeading={Download01}>
            Download resume
          </Button>
          <Button
            className="max-[720px]:hidden"
            href={email}
            color="secondary"
            size="sm"
            iconLeading={Mail01}
          >
            Get in touch
          </Button>
        </div>
      </div>
    </header>
  );
}

// Phone-width navigation. The trigger appears after hydration because the dialog needs JavaScript;
// without it, the header's inline Home and Experience links still work.
function MobileMenu({ path }: { path: string }) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready) return null;
  return (
    <SlideoutMenu.Trigger>
      <ButtonUtility className="min-[721px]:hidden" color="tertiary" size="sm" icon={Menu02} tooltip="Open menu" tooltipPlacement="bottom" />
      <SlideoutMenu isDismissable className="z-50">
        {({ close }) => (
          <>
            <SlideoutMenu.Header onClose={close}>
              <p className="text-lg font-semibold text-primary">Menu</p>
            </SlideoutMenu.Header>
            <SlideoutMenu.Content role="presentation">
              <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
                <NavItemBase type="link" href={root} current={path === "/"}>Home</NavItemBase>
                <NavItemBase type="link" href={href("experience/")} current={path.includes("/experience")}>Experience</NavItemBase>
              </nav>
            </SlideoutMenu.Content>
            <SlideoutMenu.Footer className="flex flex-col gap-3">
              <Button href={resumePdf} download color="secondary" iconLeading={Download01}>Download resume</Button>
              <Button href={email} iconLeading={Mail01}>Get in touch</Button>
            </SlideoutMenu.Footer>
          </>
        )}
      </SlideoutMenu>
    </SlideoutMenu.Trigger>
  );
}

// Theme choice is applied before first paint by the inline script in index.html; this only flips and stores it.
function ThemeToggle() {
  const [dark, setDark] = useState<boolean | null>(null);
  useEffect(() => setDark(document.documentElement.classList.contains("dark-mode")), []);
  if (dark === null) return null;
  return <ButtonUtility color="tertiary" size="sm" icon={dark ? Sun : Moon01} tooltip={dark ? "Switch to light mode" : "Switch to dark mode"} tooltipPlacement="bottom"
    onPress={() => {
      const next = !dark;
      document.documentElement.classList.toggle("dark-mode", next);
      try { localStorage.setItem("theme", next ? "dark" : "light"); } catch { /* storage can be unavailable */ }
      setDark(next);
    }} />;
}

export function Footer({ name, headline }: { name: string; headline: string }) {
  return (
    <footer className="site-footer">
      <div className="shell footer-top">
        <div className="footer-brand">
          <Button color="link-gray" size="lg" href={root}>
            {name}
          </Button>
          <p>{headline} building software with the people who use it.</p>
          <div className="footer-social">
            <ButtonUtility color="secondary" size="sm" icon={LinkedIn} tooltip="LinkedIn" href={linkedInUrl} />
            <ButtonUtility color="secondary" size="sm" icon={GitHub} tooltip="GitHub" href={gitHubUrl} />
            <ButtonUtility color="secondary" size="sm" icon={Mail01} tooltip="Email" href={email} />
          </div>
        </div>
        <nav className="footer-columns" aria-label="Footer navigation">
          <div>
            <p className="footer-heading">Site</p>
            <Button color="link-gray" href={root}>Home</Button>
            <Button color="link-gray" href={href("experience/")}>Experience</Button>
            <Button color="link-gray" href={href("experience/#learning")}>Credentials</Button>
          </div>
          <div>
            <p className="footer-heading">Resume</p>
            <Button color="link-gray" href={resumePdf}>PDF</Button>
            <Button color="link-gray" href={resumeWord} download>Word</Button>
          </div>
          <div>
            <p className="footer-heading">Connect</p>
            <Button color="link-gray" href={email}>Email</Button>
            <Button color="link-gray" href={linkedInUrl}>LinkedIn</Button>
            <Button color="link-gray" href={gitHubUrl}>GitHub</Button>
          </div>
        </nav>
      </div>
      <div className="shell footer-bottom">
        {/* The prerendered year can lag the visitor's clock until the next build. */}
        <span suppressHydrationWarning>
          © {new Date().getFullYear()} {name}
        </span>
        <Button className="max-w-full whitespace-normal text-left" color="link-gray" href={href("experience/portfolio-career-content-system/")} iconTrailing={ArrowUpRight}>
          Designed & developed by Mohamed Moheyeldin
        </Button>
      </div>
      <div className="shell trademark-notice" role="note" aria-label="Professional references and intellectual property notice">
        <p>
          References to employers, clients, customers, government agencies, projects,
          products, and services—including names, trademarks, and other
          identifiers—are used solely to identify and describe my professional
          experience, contributions, and the tools I have used. All third-party
          trademarks and other intellectual property remain the property
          of their respective owners. Their inclusion does not imply sponsorship,
          endorsement, approval, partnership, or authorization of this website.
        </p>
        <p>
          This is my personal portfolio. Statements and views are my own and do
          not represent any employer, client, customer, or government agency.
          Descriptions focus on my individual contributions within broader team
          efforts and do not claim ownership of an organization’s projects,
          systems, or intellectual property. Project headings may be descriptive
          portfolio labels rather than official project or product names.
          Client-sensitive details are intentionally generalized.
        </p>
        <p>
          Nothing on this website grants rights to third-party materials or
          changes any applicable confidentiality, contractual, or intellectual
          property obligations. For concerns about a reference or attribution,
          please <Button className="text-xs" color="link-gray" size="xs" href={email}>contact me</Button> for review and appropriate correction
          or removal.
        </p>
      </div>
    </footer>
  );
}

function Tags({ items }: { items: string[] }) {
  return (
    <div className="tags">
      {items.map((item) => (
        <Badge key={item} color="gray" size="sm">
          {item}
        </Badge>
      ))}
    </div>
  );
}

function EndCustomer({ customer }: { customer: string }) {
  return customer === veteransAffairsName ? (
    <Button color="link-color" className="whitespace-normal text-left" href="https://en.wikipedia.org/wiki/United_States_Department_of_Veterans_Affairs">
      {veteransAffairsName}
    </Button>
  ) : <>{customer}</>;
}

function ResumeConnection({ project }: { project: Project }) {
  const role = careerProfile.experience.find((item) => item.id === project.experienceId);
  if (!role) return <dl className="project-resume-link project-affiliation">
    <div><dt>Independent project</dt><dd><Button color="link-color" className="whitespace-normal text-left" href={href(`experience/#project-${project.slug}`)}>Designed and developed by {careerProfile.name}</Button></dd></div>
  </dl>;
  return <dl className="project-resume-link project-affiliation">
    <div><dt>Employer</dt><dd><Button color="link-color" className="whitespace-normal" href={href(`experience/#project-${project.slug}`)}>{role.employer}</Button></dd></div>
    <div><dt>Employment role</dt><dd>{role.professionalTitle ?? role.title}</dd></div>
    {role.customer && <div><dt>End customer</dt><dd><EndCustomer customer={role.customer} /></dd></div>}
  </dl>;
}

function ProjectCard({ project }: { project: Project }) {
  const target = href(`experience/#project-${project.slug}`);
  return (
    <article className="project-card">
      <div className="card-kicker">
        <Badge color={project.kind === "independent" ? "brand" : "gray"} size="md">
          {project.kind === "independent" ? "Independent project" : project.context.replace(veteransAffairsName, "VA")}
        </Badge>
        <span>{project.period}</span>
      </div>
      <h3>
        <Button color="link-gray" className="text-left text-xl font-semibold whitespace-normal text-primary" href={target}>
          {projectDisplayName(project)}
        </Button>
      </h3>
      <p>{project.description}</p>
      <Tags items={project.technologies.slice(0, 4)} />
      <Button className="project-card-link" color="link-color" href={target} iconTrailing={ArrowRight} aria-label={`Read the ${projectDisplayName(project)} case study`}>
        Read case study
      </Button>
    </article>
  );
}

function orderedProjects(projects: Project[]) {
  return [...projects].sort(
    (a, b) =>
      Number(a.kind === "independent") - Number(b.kind === "independent"),
  );
}

export function Home({ profile }: { profile: Profile }) {
  return (
    <>
      <section className="shell home-hero relative isolate overflow-hidden" id="professional-profile">
        <BackgroundPattern pattern="grid" size="lg" className="absolute top-0 left-1/2 -z-10 -translate-x-1/2 max-md:hidden" />
        <div className="hero-copy">
          <BadgeGroup className="mb-6 w-fit max-w-full cursor-default text-left" theme="modern" color="success" addonText="Open to FDE roles" iconTrailing={null}>
            {profile.experienceYears} years · Federal, e-commerce &amp; banking
          </BadgeGroup>
          <h1>
            Forward Deployed Engineer <span>building software with the people who use it.</span>
          </h1>
          <p>
            {profile.heroSummary}
          </p>
          <div className="hero-buttons hero-actions">
            <Button size="xl" href={href("experience/#experience-projects")} iconTrailing={ArrowRight}>View my work</Button>
            <Button size="xl" color="secondary" href={resumePdf} download iconLeading={Download01}>Download resume</Button>
          </div>
        </div>
      </section>
      <CredentialSummary profile={profile} />
      <section className="section shell">
        <header className="section-heading-centered">
            <h2>Selected work</h2>
            <p>
              What I built, who it was for, and the decisions along the way.
            </p>
        </header>
        <div className="project-grid">
          {orderedProjects(profile.projects)
            .map((p) => (
              <ProjectCard key={p.slug} project={p} />
            ))}
        </div>
      </section>
      <section className="section shell profile-centered" aria-labelledby="how-i-work-heading">
        <header className="section-heading-centered">
          <p className="eyebrow">How I work</p>
          <h2 id="how-i-work-heading">Start with the people using it.</h2>
          <p className="section-intro">
            Most of my work is connecting systems, building small tools, and
            working closely with the people who use them.
          </p>
        </header>
        <ol className="process-steps">
          {processSteps.map(({ icon, title, text }, index) => (
            <li key={title}>
              <FeaturedIcon icon={icon} color="brand" theme="light" size="lg" />
              <span className="process-step-number">Step {index + 1}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ol>
        <div className="resume-summary">
          <p>
            After {profile.experienceYears} years in development and quality
            engineering across federal, e-commerce, and banking, I trace a
            problem through the whole system, from what a user sees to the data
            behind it.
          </p>
        </div>
      </section>
      <EngineeringToolkit profile={profile} />
      <Contact />
    </>
  );
}

function ExplorerChoice({ title, description, active, compact = false, ...props }: {
  title: string;
  description: string;
  active: boolean;
  /** Shorter rows for the vertical project menu. */
  compact?: boolean;
  href: string;
  id?: string;
  onClick: NonNullable<ButtonComponentProps["onClick"]>;
}) {
  return <Button {...props} color="tertiary"
    className={`${compact ? "py-3" : "h-full min-h-28 py-4"} w-full items-start justify-start rounded-lg px-4 whitespace-normal text-left ring-1 ring-inset max-sm:min-h-0 [&>[data-text]]:w-full ${active ? "bg-brand-primary_alt text-brand-secondary ring-brand hover:bg-brand-primary_alt" : "bg-primary text-secondary ring-secondary hover:bg-secondary hover:ring-primary"}`}
    aria-current={active ? "true" : undefined}>
    <span className="flex w-full min-w-0 flex-col gap-2">
      <span>{title}</span>
      <span className={`text-xs leading-5 font-normal ${active ? "text-brand-secondary" : "text-tertiary"}`}>{description}</span>
    </span>
  </Button>;
}

function ProjectExplorer({ profile }: { profile: Profile }) {
  const projects = profile.projects;
  const [selected, setSelected] = useState(projects[0]!.slug);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const sync = () => {
      const slug = window.location.hash.replace(/^#project-/, "");
      setSelected(projects.find((project) => project.slug === slug)?.slug ?? projects[0]!.slug);
    };
    sync();
    setReady(true);
    window.addEventListener("hashchange", sync);
    window.addEventListener("popstate", sync);
    return () => {
      window.removeEventListener("hashchange", sync);
      window.removeEventListener("popstate", sync);
    };
  }, [profile]);
  const selectProject = (slug: string) => {
    if (!projects.some((project) => project.slug === slug)) return;
    setSelected(slug);
    window.history.pushState(null, "", `#project-${slug}`);
  };
  const project = projects.find((item) => item.slug === selected) ?? projects[0]!;
  return <section className="work-explorer" aria-label="Project explorer">
      <nav className="project-selector" aria-label="Choose a project">
        <p className="sr-only">Projects &amp; employment</p>
        {projects.map((item) => <ExplorerChoice compact key={item.slug} id={`project-${item.slug}`} href={href(`experience/${item.slug}/`)}
          title={projectDisplayName(item)}
          description={profile.experience.find((role) => role.id === item.experienceId)?.employer ?? "Independent project"}
          active={item.slug === selected}
          onClick={(event) => {
            if (!ready || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            selectProject(item.slug);
          }} />)}
      </nav>
      <p className="sr-only" aria-live="polite">Selected project: {project.name}</p>
      <CaseStudy key={project.slug} project={project} embedded interactive={ready} onSelectProject={selectProject} />
    </section>;
}

function EngineeringToolkit({ profile, detailed = false }: { profile: Profile; detailed?: boolean }) {
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [interactive, setInteractive] = useState(false);
  const icons: Record<string, typeof Code02> = {
    "Customer discovery & delivery": LayersTwo01,
    "Application development": Code02,
    "Data and integration": GitBranch01,
    "Delivery and quality": ShieldTick,
    "AI-assisted engineering": Code02,
    "Internal tools & file workflows": File06,
    "Web platforms & deployment": GitBranch01,
    "Troubleshooting & team enablement": LayersTwo01,
  };
  const descriptions: Record<string, string> = {
    "Application development": "I build interfaces and reusable features around the problem a team is trying to solve.",
    "Data and integration": "Connecting workflows, checking API behavior, and digging into the data behind what the application shows.",
    "Delivery and quality": "Making changes repeatable and giving teams feedback before release.",
    "AI-assisted engineering": "I use coding assistants to explore options, write and debug code, and refactor, then review and test what they produce.",
  };
  const groups = [
    {
      label: "Customer discovery & delivery",
      description: "Working with stakeholders from the first requirements conversation through demos and adoption.",
      items: [...profile.competencies, "Requirements & acceptance criteria", "Technical constraints", "Product demonstrations", "User feedback"],
    },
    ...profile.skillGroups.map(group => ({
      ...group,
      description: descriptions[group.label],
      items: group.label === "AI-assisted engineering" ? [...group.items, "Code review", "Debugging & refactoring"] : group.items,
    })),
    {
      label: "Internal tools & file workflows",
      description: "Turning repeated manual work into a desktop tool the team can use and maintain.",
      items: ["Electron", "Test data generation", "JSON editing", "gzip packaging", "SFTP", "WinSCP", "Upload status", "Retry handling"],
    },
    {
      label: "Web platforms & deployment",
      description: "What this portfolio runs on: shared content, accessible components, and static builds for Cloudflare or a GitHub Pages path.",
      items: ["Vite", "Untitled UI", "Tailwind CSS", "React Aria", "pnpm", "Cloudflare deployment configuration", "GitHub Pages", "Static prerendering"],
    },
    {
      label: "Troubleshooting & team enablement",
      description: "Tracing issues across interfaces, data, and delivery workflows, then helping the team use the fix.",
      items: ["Frontend & backend investigation", "Database checks", "Defect diagnosis", "API validation", "Technical documentation", "Workflow walkthroughs", "Ongoing tool support"],
    },
  ];
  const additionalSkills: Record<string, string[]> = {
    "Customer discovery & delivery": ["Healthcare claims workflow mapping", "Stakeholder demonstrations", "Working sessions with end users", "Production issue triage", "Feedback-driven improvements", "Operational constraints"],
    "Application development": ["Frontend feature implementation", "Workflow and status interfaces", "Responsive behavior", "Cross-browser validation"],
    "Data and integration": ["DataGrip", "API schema validation", "Service contract checks", "Provider API integration", "Live claim status", "Tableau dashboards", "System health monitoring", "Application-to-database reconciliation", "Referral-data uploads", "Network stubbing"],
    "Delivery and quality": ["Reusable smoke & regression frameworks", "Parallel and headless execution", "Applitools Eyes", "Diagnostic artifacts"],
    "AI-assisted engineering": ["Implementation exploration", "Test creation", "Review and validation of generated changes"],
    "Troubleshooting & team enablement": ["Reproducible defect reports", "Screenshots and execution evidence", "Developer coordination", "Single and bulk upload guidance"],
  };
  const businessGroups = [
    {
      label: "Business requirements & delivery coordination",
      description: "Turning business workflows into clear acceptance criteria, and keeping stakeholders posted on blockers, dependencies, and operational impact.",
      items: ["Jira", "Confluence", "YouTrack", "Business & functional requirements", "Acceptance criteria", "Requirements traceability", "Business-impact reporting", "Delivery dependencies", "Progress and blocker tracking", "Product owner & analyst collaboration"],
    },
    {
      label: "Solution evaluation & technical decisions",
      description: "Comparing options on maintainability, reuse, authentication, and environment limits, including the Playwright evaluation and internal tooling.",
      items: ["Tool and framework evaluation", "Legacy automation assessment", "Maintainability tradeoffs", "Reusable component design", "Environment access constraints", "Implementation alternatives"],
    },
  ];
  const operationalGroups = [
    {
      label: "Version control & repositories",
      description: "Version control and repository platforms I use for source code and collaboration.",
      items: ["Git", "GitHub", "GitLab", "Bitbucket", "Azure Repos"],
    },
    {
      label: "Development environments",
      description: "Editors and IDEs I use to write code, navigate it, and debug. Database tools are listed under data and integration.",
      items: ["VS Code", "WebStorm", "IntelliJ IDEA"],
    },
    {
      label: "Continuous integration & build tools",
      description: "Tools for repeatable builds, automated checks, and early feedback.",
      items: ["GitHub Actions", "Jenkins", "TeamCity"],
    },
    {
      label: "Operating systems",
      description: "I use Windows, Linux, and macOS day to day, at work and at home.",
      items: ["Windows", "Linux", "macOS"],
    },
    {
      label: "Identity & environment troubleshooting",
      description: "Checking sign-in flows and looking into authentication or environment problems that affect the application or automated runs.",
      items: ["OIDC workflow validation", "Okta MFA", "Single sign-on checks", "Microsoft Entra ID investigation", "Restricted environment access", "Authentication failure evidence"],
    },
    {
      label: "Release readiness & operational validation",
      description: "Repeatable evidence for developers and product owners about expected behavior, defects, and fixes across environments.",
      items: ["Development, QA, UAT & staging", "Smoke and sanity checks", "Regression validation", "Deployment checks", "Hotfix verification", "Exploratory testing", "Fix verification", "Release-readiness evidence"],
    },
  ];
  const displayGroups = detailed
    ? [groups[0]!, ...businessGroups, ...groups.slice(1), ...operationalGroups].map(group => ({
        ...group,
        items: [...new Set([...group.items, ...(additionalSkills[group.label] ?? [])])].filter(item =>
          !(group.label === "Delivery and quality" && ["Git", "Jira", "GitHub Actions", "Jenkins"].includes(item)) &&
          !(group.label === "AI-assisted engineering" && item === "VS Code")),
      }))
    : groups;
  const areas = [
    { label: "Customer & business", summary: "Discovery, requirements & decisions", categories: [0, 1, 2] },
    { label: "Application engineering", summary: "Development, internal tools & AI", categories: [3, 6, 7] },
    { label: "Data & integration", summary: "Data, identity & troubleshooting", categories: [4, 9, 14] },
    { label: "Quality & delivery", summary: "Validation, builds & releases", categories: [5, 12, 15] },
    { label: "Platforms & tools", summary: "Web, repositories & environments", categories: [8, 10, 11, 13] },
  ];
  const selectedArea = areas.find(area => area.categories.includes(selectedCategory)) ?? areas[0]!;
  useEffect(() => {
    const syncCategory = () => {
      const match = /^#toolkit-category-(\d+)$/.exec(window.location.hash);
      const index = match ? Number(match[1]) : 0;
      if (index < displayGroups.length) setSelectedCategory(index);
    };
    syncCategory();
    setInteractive(true);
    window.addEventListener("hashchange", syncCategory);
    return () => window.removeEventListener("hashchange", syncCategory);
  }, [displayGroups.length]);
  return <section className={detailed ? "toolkit-full" : "expertise-section toolkit-overview"} id="engineering-toolkit" aria-labelledby="toolkit-heading">
    <div className="section shell">
      <header className="section-heading-centered">
        {!detailed && <p className="eyebrow">Core expertise</p>}
        <h2 id="toolkit-heading">{detailed ? "The tools behind the work." : "Engineering toolkit."}</h2>
        <p className="section-intro">{detailed ? "From business workflows and requirements to implementation, integration, and release checks." : "The tools and practices I use day to day."}</p>
      </header>
      <div className={detailed ? "work-explorer toolkit-explorer" : undefined}>
        {detailed && <nav className="project-selector toolkit-selector" aria-label="Choose an expertise category">
          <p className="sr-only">Skills &amp; tools</p>
          {areas.map(area => <ExplorerChoice key={area.label}
            href={`#toolkit-category-${area.categories[0]}`}
            title={area.label} description={area.summary} active={area === selectedArea}
            onClick={event => {
              if (!interactive || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
              event.preventDefault();
              setSelectedCategory(area.categories[0]!);
            }} />)}
        </nav>}
      <div className={detailed ? "toolkit-panel embedded-case" : undefined}>
        {detailed && interactive && <header className="toolkit-area-heading"><h3>{selectedArea.label}</h3><p>{selectedArea.summary}</p></header>}
        <div className={detailed ? "toolkit-area-grid" : "toolkit-list"}>
        {displayGroups.map((group, index) => <article key={group.label} id={detailed ? `toolkit-category-${index}` : undefined}
          hidden={detailed && interactive && !selectedArea.categories.includes(index)}>
          {!detailed && <FeaturedIcon icon={icons[group.label] ?? Code02} color="brand" theme="light" size="sm" />}
          <div className="toolkit-category">
            <div className="toolkit-category-intro">
              {detailed ? <h4>{group.label}</h4> : <h3>{group.label}</h3>}
              <div className="toolkit-details"><p>{group.description}</p></div>
            </div>
            {detailed && <ul className="toolkit-skills" aria-label={`${group.label} skills`}>
              {group.items.map(item => <li key={item}><Badge className="max-w-full whitespace-normal" color="gray" size="md">{item}</Badge></li>)}
            </ul>}
          </div>
        </article>)}
        </div>
      </div>
      </div>
      <div className="toolkit-evidence"><Button className="whitespace-normal text-left" href={href(detailed ? "experience/#experience-projects" : "experience/#engineering-toolkit")} color="link-color" iconTrailing={ArrowRight}>{detailed ? "Explore the projects behind these skills" : "Explore my full engineering toolkit"}</Button></div>
    </div>
  </section>;
}

function CredentialSummary({ profile }: { profile: Profile }) {
  const issuers = profile.verifiedCredentials.reduce<Map<string, number>>((counts, credential) => counts.set(credential.issuer, (counts.get(credential.issuer) ?? 0) + 1), new Map());
  if (!issuers.size) return null;
  return (
    <section className="shell credential-summary" aria-labelledby="credential-summary-heading">
      <h2 id="credential-summary-heading">Verified credentials</h2>
      <ul>
        {Array.from(issuers, ([issuer, count]) => (
          <li key={issuer}>
            <BadgeWithIcon type="modern" color="gray" size="lg" iconLeading={CheckVerified01}>
              {issuer} · {count} {count === 1 ? "credential" : "credentials"}
            </BadgeWithIcon>
          </li>
        ))}
      </ul>
      <Button color="link-color" size="sm" href={href("experience/#learning")} iconTrailing={ArrowRight}>See all credentials</Button>
    </section>
  );
}

const processSteps = [
  { icon: MessageChatCircle, title: "Listen first", text: "I talk with the people who will use the software and ask how they work today." },
  { icon: ClipboardCheck, title: "Define done", text: "I write down the requirements and what done looks like before I build." },
  { icon: PresentationChart01, title: "Build and demo", text: "I build it, show them, and let their feedback decide what happens next." },
  { icon: LifeBuoy01, title: "Support adoption", text: "I keep supporting it after release, from troubleshooting to workflow walkthroughs." },
];

function CredentialStrip({ profile }: { profile: Profile }) {
  const previews = profile.verifiedCredentials.flatMap((credential) => {
    const image = credentialImages.find((asset) => (credential.href ? asset.credentialHref === credential.href : asset.credentialName === credential.name));
    return image ? [{ credential, image, verificationHref: credential.href }] : [];
  });
  if (!previews.length) return null;

  return (
    <section className="credential-strip shell" aria-labelledby="credentials-heading">
      <h2 className="sr-only" id="credentials-heading">Verified credentials</h2>
      <ul className="credential-grid">
        {previews.map(({ credential, image, verificationHref }) => (
          <li className="credential-card" key={verificationHref ?? credential.name}>
            <div className="credential-preview">
              <img
                src={/^https:/.test(image.src) ? image.src : `${root}${image.src}`}
                alt={`${credential.name} — ${credential.issuer} credential`}
                width={image.width}
                height={image.height}
                loading="lazy"
                decoding="async"
              />
            </div>
            <h3>{credential.name}</h3>
            <p>{credential.issuer} · Issued <time dateTime={credential.issuedOn}>{credential.issuedOn.slice(0, 4)}</time></p>
            {verificationHref && (
              <Button
                className="mt-auto"
                color="link-color"
                size="sm"
                href={verificationHref}
                aria-label={`View ${credential.name} credential`}
                iconTrailing={ArrowUpRight}
              >
                View credential
              </Button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function WorkHistory({ profile }: { profile: Profile }) {
  return (
    <section className="section shell" id="work-history" aria-labelledby="work-history-heading">
      <header className="section-heading-centered">
        <p className="eyebrow">Work history</p>
        <h2 id="work-history-heading">Where I have worked.</h2>
      </header>
      <ol className="work-timeline">
        {profile.experience.map((role) => (
          <li key={role.id}>
            <FeaturedIcon icon={Briefcase01} color={role.end ? "gray" : "brand"} theme="modern" size="md" />
            <div>
              <p className="work-timeline-dates">
                <time dateTime={role.start}>{formatCareerDate(role.start)}</time> — {role.end ? <time dateTime={role.end}>{formatCareerDate(role.end)}</time> : "Present"}
              </p>
              <h3>{role.professionalTitle ?? role.title}</h3>
              <p className="work-timeline-employer">{role.employer} · {role.location}</p>
              {role.customer && <p className="work-timeline-customer">End customer: {role.customer}</p>}
              <p>{role.summary}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function Work({ profile }: { profile: Profile }) {
  const credentialGroups = profile.verifiedCredentials.reduce<Map<string, Profile["verifiedCredentials"]>>((groups, credential) => {
    groups.set(credential.issuer, [...(groups.get(credential.issuer) ?? []), credential]);
    return groups;
  }, new Map());
  return (
    <>
      <section className="page-hero shell about-hero">
        <div>
          <h1>
            Work history
            {" "}
            <span>and projects.</span>
          </h1>
          <p>
            My roles, the projects I have worked on, and the tools I have
            built, across federal, e-commerce, and banking.
          </p>
        </div>
      </section>
      <nav className="shell page-sections" aria-label="On this page">
        <NavItemBase type="link" href="#experience-projects">Projects</NavItemBase>
        <NavItemBase type="link" href="#work-history">Work history</NavItemBase>
        <NavItemBase type="link" href="#approach">Approach</NavItemBase>
        <NavItemBase type="link" href="#engineering-toolkit">Skills</NavItemBase>
        <NavItemBase type="link" href="#learning">Learning</NavItemBase>
      </nav>
      <CredentialStrip profile={profile} />
      <section className="section shell" id="experience-projects">
        <header className="section-heading-centered">
          <h2>Experience &amp; projects</h2>
          <p className="section-intro">{profile.experienceYears} years across federal, e-commerce, and banking. The work is below.</p>
        </header>
        <ProjectExplorer profile={profile} />
      </section>
      <WorkHistory profile={profile} />
      <section className="section shell profile-centered" id="approach" aria-labelledby="approach-heading">
        <header>
          <p className="eyebrow">My approach</p>
          <h2 id="approach-heading">How I approach the work.</h2>
        </header>
        <div className="resume-summary">
          <p>
            I work directly with stakeholders to learn how they work and what
            is getting in their way, then build the application features and
            internal tools that fix it. I stay involved after that: demos,
            troubleshooting, and user feedback.
          </p>
          <p>
            At Booz Allen Hamilton I work on a VA healthcare claims platform.
            I build React features, work with health providers and VA
            stakeholders, and investigate application and data issues. I also
            built and support Data Generator &amp; File Processing, a desktop
            app that creates referral test data, packages files, and uploads
            them for internal use.
          </p>
          <p>
            After {profile.experienceYears} years in software development and
            quality engineering across federal, banking, and e-commerce, I start
            by understanding the system, check that it behaves the way people
            expect, and make sure they can use the result. That is why I am
            focused on Forward Deployed Engineering.
          </p>
        </div>
      </section>
      <EngineeringToolkit profile={profile} detailed />
      <section className="section shell" id="learning" aria-labelledby="learning-heading">
        <header className="toolkit-heading">
          <p className="eyebrow">Always learning</p>
          <h2 id="learning-heading">A foundation to build on.</h2>
        </header>
        <div className="learning-grid">
          <section className="learning-card" aria-labelledby="education-heading">
            <FeaturedIcon icon={BookOpen01} color="brand" theme="light" size="lg" />
            <h3 id="education-heading">Education</h3>
            <ul className="learning-list">
              {profile.education.map((education) => (
                <li key={`${education.institution}-${education.credential}-${education.end}`}>
                  <div>
                    <h4>{education.credential} in {education.field}</h4>
                    <p>{education.institution} · {education.end.slice(0, 4)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
          <section className="learning-card" aria-labelledby="courses-heading">
            <FeaturedIcon icon={Award01} color="brand" theme="light" size="lg" />
            <h3 id="courses-heading">Courses &amp; certifications</h3>
            <div className="learning-issuers">
              {Array.from(credentialGroups, ([issuer, credentials]) => (
                <div className="learning-issuer" key={issuer}>
                  <h4 className="learning-subheading">{issuer}</h4>
                  <ul className="learning-list">
                    {credentials.map((credential) => (
                      <li key={`${credential.name}-${credential.issuedOn}`}>
                        <div>
                          <h5>{credential.name}</h5>
                          <p>Issued <time dateTime={credential.issuedOn}>{credential.issuedOn.slice(0, 4)}</time></p>
                        </div>
                        {credential.href && (
                          <Button color="link-color" href={credential.href} iconTrailing={ArrowUpRight} aria-label={`View ${credential.name} credential`}>
                            View credential
                          </Button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {profile.credentials.length > 0 && (
                <div className="learning-issuer">
                  <h4 className="learning-subheading">Earlier training</h4>
                  <ul className="learning-list">
                    {profile.credentials.map((credential) => (
                      <li key={credential}>
                        <div>
                          <h5>{credential}</h5>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        </div>
      </section>
      <Contact />
    </>
  );
}

function projectDisplayName(project: Project) {
  if (project.slug === "ecommerce-feedback-platform") return "E-commerce Quality Feedback Platform";
  if (project.slug === "banking-risk-validation") return "Banking Risk-Based Validation System";
  return project.name.replace(veteransAffairsName, "VA");
}

export function CaseStudy({ project, embedded = false, interactive = false, onSelectProject }: {
  project: Project; embedded?: boolean; interactive?: boolean; onSelectProject?: (slug: string) => void;
}) {
  const [section, setSection] = useState("overview");
  const role = careerProfile.experience.find(item => item.id === project.experienceId);
  const sections = [["overview", "Overview"], ["implementation", "Implementation"], ["evidence", "Evidence"]] as const;
  const challenge = <section id={embedded ? "project-details-overview" : "challenge"} tabIndex={-1}>
      {!embedded && <p className="eyebrow">01 / Challenge</p>}
      <h2>{embedded ? "The challenge" : "The problem."}</h2>
      <p>{project.challenge}</p>
      <p><strong>Who needed it:</strong> {project.audience}</p>
    </section>;
  const approach = <section id={embedded ? "project-details-implementation" : "approach"} tabIndex={-1}>
      {!embedded && <p className="eyebrow">02 / Approach</p>}
      <h2>What I did.</h2>
      <ol className="approach-list">
        {project.approach.map((s, i) => (
          <li key={s}>
            <span>{i + 1}</span>
            <p>{s}</p>
          </li>
        ))}
      </ol>
    </section>;
  const outcome = <section id="outcome" tabIndex={-1}>
      {!embedded && <p className="eyebrow">03 / Outcome</p>}
      <h2>{embedded ? "My contribution & results" : "What changed."}</h2>
      <p>{project.outcome}</p>
      <ul className="outcomes">
        {project.highlights.map((h) => (
          <li key={h}>
            <Check />
            {h}
          </li>
        ))}
      </ul>
    </section>;
  const systems = <section id="systems" tabIndex={-1}>
      {!embedded && <p className="eyebrow">04 / Systems & decisions</p>}
      <h2>How it fit together.</h2>
      {project.systems.map((text) => <p key={text}>{text}</p>)}
      <h3>Constraints and tradeoffs</h3>
      <ul className="plain-list">{project.decisions.map((text) => <li key={text}>{text}</li>)}</ul>
    </section>;
  const evidence = <section id={embedded ? "project-details-evidence" : "evidence"} tabIndex={-1}>
      {!embedded && <p className="eyebrow">05 / Evidence</p>}
      <h2>What you can check.</h2>
      {project.evidence.map((item) => <div key={item.label}>
        <h3>{item.label}</h3><p>{item.detail}</p>
        {item.href && <Button className="whitespace-normal text-left" color="link-color" href={item.href} iconTrailing={ArrowUpRight}>{item.label}</Button>}
      </div>)}
      <h3>Why it matters for FDE work</h3><p>{project.relevance}</p>
      {project.relatedProjects.length > 0 && <div>
        <h3>Related work</h3>
        {project.relatedProjects.map((related) => <p key={related.slug}><Button className="whitespace-normal text-left" color="link-color" href={href(`experience/${related.slug}/`)} onClick={(event) => {
          if (!interactive || !onSelectProject || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
          event.preventDefault(); onSelectProject(related.slug);
        }} iconTrailing={ArrowRight}>{related.label}</Button></p>)}
      </div>}
    </section>;
  const toolkit = <section id="toolkit" tabIndex={-1}>
      {!embedded && <p className="eyebrow">06 / Toolkit</p>}
      <h2>Tools used.</h2>
      <Tags items={project.technologies} />
    </section>;
  const walkthrough = project.kind === "independent" && <section id="walkthrough" tabIndex={-1}>
      {!embedded && <p className="eyebrow">07 / Implementation walkthrough</p>}
      <h2>How a content change reaches the site.</h2>
      <ol className="approach-list">
        {[
          ["Edit the data", "Content lives in src/content/career.json. Required fields and unique project slugs are checked before a build."],
          ["Render the pages", "React builds the pages from that record using free Untitled UI components. The HTML is generated ahead of time, so the project pages are readable without JavaScript."],
          ["Generate the resumes", "pnpm resume:generate builds every resume format from the same record, using the site’s font and blue theme."],
          ["Check and build", "pnpm verify checks types, content, the production build, and GitHub Pages paths. pnpm build:cloudflare rebuilds for the root path."],
          ["Deploy", "wrangler.jsonc points Cloudflare Static Assets at dist. Merging to main starts the production build."]
        ].map(([title, text], i) => <li key={title}><span>{String(i + 1).padStart(2, "0")}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}
      </ol>
      <p>This site has no runtime API or database. My API and integration work is described in the work projects.</p>
      <div className="hero-buttons"><Button color="secondary" href={href("experience/")}>Explore the interface</Button><Button color="secondary" href={href("resume/mohamed-moheyeldin-resume-detailed.pdf")}>Inspect the resume output</Button></div>
    </section>;
  return (
    <>
      <article className={embedded ? "embedded-case" : undefined}>
        <header className={embedded ? "case-hero" : "case-hero shell"}>
          {!embedded && <Button
            href={href("experience/")}
            color="link-gray"
            iconLeading={ArrowLeft}
          >
            All projects
          </Button>}
          {!embedded && project.kind !== "independent" && <div className="case-badge">
            <Badge color="brand">Work project</Badge>
          </div>}
          {embedded ? <h2>{projectDisplayName(project)}</h2> : <h1>{project.name}</h1>}
          {!embedded && <p>{project.description}</p>}
          {embedded ? <div className="project-summary-meta">
            {role ? <>
              <div><span className="eyebrow">Employer &amp; role</span>
                <strong className="project-employer">{role.employer}</strong>
                <p>{role.professionalTitle ?? role.title} · {formatCareerDate(role.start)} — {formatCareerDate(role.end)}</p>
              </div>
              {role.customer && <div><span className="eyebrow">End customer</span><EndCustomer customer={role.customer} /></div>}
            </> : <p>Independent project · Designed and developed by me · {project.period}</p>}
          </div> : <>
            <dl className="case-facts">
              <div><dt>My role</dt><dd>{project.role}</dd></div>
              <div><dt>Context</dt><dd>{project.context}</dd></div>
              <div><dt>Period</dt><dd>{project.period}</dd></div>
            </dl>
            <ResumeConnection project={project} />
          </>}
          {project.repository && (
            <Button
              href={project.repository}
              color="secondary"
              iconTrailing={ArrowUpRight}
            >
              {project.repositoryVisibility === "private" ? "GitHub repository (private)" : "View source on GitHub"}
            </Button>
          )}
          {project.repositoryVisibility === "private" && <p>Private source. GitHub access requires repository permission.</p>}
        </header>
        <div className={embedded ? "case-body" : "shell case-body"}>
          {!embedded && <aside>
            <p className="eyebrow">Inside this project</p>
            <NavItemBase type="link" href="#challenge">01　The challenge</NavItemBase>
            <NavItemBase type="link" href="#approach">02　What I built</NavItemBase>
            <NavItemBase type="link" href="#outcome">03　The outcome</NavItemBase>
            <NavItemBase type="link" href="#systems">04　Systems & decisions</NavItemBase>
            <NavItemBase type="link" href="#evidence">05　Evidence</NavItemBase>
            <NavItemBase type="link" href="#toolkit">06　The toolkit</NavItemBase>
            {project.kind === "independent" && <NavItemBase type="link" href="#walkthrough">07　Walkthrough</NavItemBase>}
          </aside>}
          <div className="project-detail-content">
            {interactive ? <Tabs selectedKey={section} onSelectionChange={(key) => setSection(String(key))}>
              <div className="detail-selector">
                <Tabs.List type="button-border" aria-label="Project detail sections" items={sections.map(([id, label]) => ({ id, label }))} />
              </div>
              <Tabs.Panel id="overview" className="overview-columns">{challenge}{outcome}</Tabs.Panel>
              <Tabs.Panel id="implementation">{approach}{systems}{toolkit}{walkthrough}</Tabs.Panel>
              <Tabs.Panel id="evidence">{evidence}</Tabs.Panel>
            </Tabs> : <>{challenge}{approach}{outcome}{systems}{evidence}{toolkit}{walkthrough}</>}
            <div className="disclosure" role="note">
              <FeaturedIcon icon={ShieldTick} color="gray" theme="modern" size="md" />
              <p>
                {project.kind === "career"
                  ? "This is based on my documented career responsibilities. I left out client-sensitive details on purpose, and I have not added numbers I can't support."
                  : "I designed and built this project. The source, content model, and automated checks are in the linked repository."}
              </p>
            </div>
          </div>
        </div>
      </article>
      {!embedded && <ProjectPager project={project} />}
      {!embedded && <Contact />}
    </>
  );
}

// Clipboard copy needs JavaScript, so the button appears only after hydration; the mailto link always works.
function CopyEmail() {
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready) return null;
  return <ButtonUtility color="tertiary" size="xs" icon={copied ? Check : Copy01} tooltip={copied ? "Copied" : "Copy email address"}
    onPress={() => navigator.clipboard?.writeText(emailAddress).then(() => setCopied(true), () => setCopied(false))} />;
}

function ProjectPager({ project }: { project: Project }) {
  const projects = careerProfile.projects;
  const index = projects.findIndex((item) => item.slug === project.slug);
  const previous = projects[(index - 1 + projects.length) % projects.length]!;
  const next = projects[(index + 1) % projects.length]!;
  return (
    <nav className="shell project-pager" aria-label="More projects">
      <Button color="secondary" size="lg" className="whitespace-normal text-left" href={href(`experience/${previous.slug}/`)} iconLeading={ArrowLeft}>
        <span className="flex flex-col"><span className="text-xs font-medium text-tertiary">Previous project</span>{projectDisplayName(previous)}</span>
      </Button>
      <Button color="secondary" size="lg" className="whitespace-normal text-right" href={href(`experience/${next.slug}/`)} iconTrailing={ArrowRight}>
        <span className="flex flex-col"><span className="text-xs font-medium text-tertiary">Next project</span>{projectDisplayName(next)}</span>
      </Button>
    </nav>
  );
}

export function Contact() {
  return (
    <section className="contact-section">
      <div className="shell contact-inner">
        <div>
          <p className="eyebrow">Contact</p>
          <h2>Get in touch.</h2>
          <p>
            If you have an integration problem or a Forward Deployed Engineer
            role, send me an email.
          </p>
        </div>
        <div className="contact-actions">
          <div className="contact-buttons">
            <Button href={email} size="xl" iconLeading={Mail01}>
              Get in touch
            </Button>
            <Button href={linkedInUrl} size="xl" color="secondary" iconLeading={LinkedIn}>
              Message me on LinkedIn
            </Button>
          </div>
          <div className="flex max-w-full items-center gap-1">
            <Button className="max-w-full whitespace-normal break-all text-center" href={email} color="link-color" size="sm">
              {emailAddress}
            </Button>
            <CopyEmail />
          </div>
        </div>
      </div>
    </section>
  );
}

export function NotFound() {
  return (
    <section className="page-hero shell not-found">
      <Illustration type="cloud" size="md" className="mx-auto mb-8">
        <SearchLg className="size-7" />
      </Illustration>
      <p className="eyebrow">404 / Page not found</p>
      <h1>
        This page
        {" "}
        <span>doesn’t exist.</span>
      </h1>
      <p>The link may be old or mistyped. The home page is a good place to start.</p>
      <div className="hero-buttons">
        <Button color="secondary" size="lg" href={href("experience/")}>View my experience</Button>
        <Button size="lg" href={root} iconLeading={ArrowLeft}>Back to home</Button>
      </div>
    </section>
  );
}
