import { useEffect, useRef, useState } from "react";
import { ButtonGroup, ButtonGroupItem } from "@/components/base/button-group/button-group";
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
} from "@untitledui/icons";
import { Button, type Props as ButtonComponentProps } from "@/components/base/buttons/button";
import { Badge } from "@/components/base/badges/badges";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { NavItemBase } from "@/components/application/app-navigation/base-components/nav-item";
import type { getCareerProfile } from "@/lib/career";
import { profile as careerProfile, veteransAffairsName } from "@/lib/career";
import credentialImages from "@/content/credential-images.json";

type Profile = Awaited<ReturnType<typeof getCareerProfile>>;
type Project = Profile["projects"][number];
const emailAddress = "mohamedmoheyeldin.jobs@gmail.com";
const email = `mailto:${emailAddress}`;
const root = `${import.meta.env.BASE_URL.replace(/\/?$/, "")}/`;
const href = (path = "") => `${root}${path}`;
const date = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }).format(new Date(`${value}-01T00:00:00Z`))
    : "Present";

export function Header({ name, location, path }: { name: string; location: string; path: string }) {
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
          <span className="wordmark-caption">Bridging customer needs and technical solutions.</span>
          <span className="header-location">{location}</span>
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
          <NavItemBase type="link"
            href={href("resume/")}
            current={path.includes("/resume")}
          >
            Resume
          </NavItemBase>
        </nav>
        <div className="header-contact">
          <Button
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

export function Footer({ name }: { name: string }) {
  return (
    <footer className="site-footer">
      <div className="shell footer-top">
        <div>
          <Button color="link-gray" size="lg" href={root}>
            {name}
          </Button>
          <p>Bridging customer needs and technical solutions.</p>
        </div>
        <nav className="footer-links" aria-label="Footer navigation">
          <Button color="link-gray" href={root}>Home</Button>
          <Button color="link-gray" href={href("experience/")}>Experience</Button>
          <Button color="link-gray" href={href("resume/")}>Resume</Button>
          <Button color="link-gray" href="https://www.linkedin.com/in/moheyeldin/" iconTrailing={ArrowUpRight}>LinkedIn</Button>
          <Button color="link-gray" href="https://github.com/mohamedmoheyeldin" iconTrailing={ArrowUpRight}>GitHub</Button>
        </nav>
      </div>
      <div className="shell footer-bottom">
        <span>
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
  return (
    <article className="project-card">
      <div className="project-card-body">
        <div className="card-kicker">
          <span>
            {project.kind === "independent"
              ? "INDEPENDENT PROJECT"
              : project.context.toUpperCase()}
          </span>
          <span>{project.period}</span>
        </div>
        <h3>
          <Button color="link-gray" className="w-full justify-between text-left text-xl whitespace-normal" href={href(`experience/#project-${project.slug}`)} iconTrailing={ArrowUpRight}>
            {project.name}
          </Button>
        </h3>
        <p>{project.description}</p>
        <Tags items={project.technologies.slice(0, 4)} />
      </div>
      <aside className="project-card-connection" aria-label={`${project.name} experience`}>
        <ResumeConnection project={project} />
      </aside>
    </article>
  );
}

function orderedProjects(projects: Project[]) {
  return [...projects].sort(
    (a, b) =>
      Number(b.kind === "independent") - Number(a.kind === "independent"),
  );
}

export function Home({ profile }: { profile: Profile }) {
  return (
    <>
      <section className="shell home-hero" id="professional-profile">
        <div className="hero-copy">
          <h1>
            Practical software. <span>Connected systems.</span>
          </h1>
          <p>
            {profile.heroSummary}
          </p>
        </div>
      </section>
      <section className="section shell">
        <header className="section-heading-centered">
            <h2>Engineering solutions. Delivering value.</h2>
            <p>
              A look at the systems I’ve built and the decisions behind them.
            </p>
        </header>
        <div className="project-grid">
          {orderedProjects(profile.projects)
            .map((p) => (
              <ProjectCard key={p.slug} project={p} />
            ))}
        </div>
      </section>
      <section className="expertise-section">
        <div className="section shell">
          <header className="section-heading-centered">
          <p className="eyebrow">What I bring</p>
          <h2>Build it. Connect it. Make it work.</h2>
          <p className="section-intro">
            I bring implementation, integration, and troubleshooting together
            to solve problems across software and delivery environments.
          </p>
          </header>
          <div className="expertise-grid">
            {[
              {
                icon: Code02,
                title: "APIs, tools, and integrations",
                text: "API integrations, data-provisioning utilities, and automation that connect systems and make complex workflows repeatable.",
              },
              {
                icon: GitBranch01,
                title: "Cloud and delivery systems",
                text: "GitHub Actions pipelines, AWS environments, and diagnostics that help teams deploy, investigate, and improve their software.",
              },
              {
                icon: LayersTwo01,
                title: "Hands-on technical leadership",
                text: "Stakeholder discovery, demonstrations, and practical documentation that help teams adopt and maintain useful tools.",
              },
            ].map(({ icon: Icon, title, text }) => (
              <article key={title}>
                <FeaturedIcon icon={Icon} color="brand" theme="light" size="lg" />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <EngineeringToolkit profile={profile} />
      <section className="section shell profile-centered" aria-labelledby="how-i-work-heading">
        <header>
          <p className="eyebrow">How I work</p>
          <h2 id="how-i-work-heading">From customer discovery to practical delivery.</h2>
        </header>
        <div className="resume-summary">
          <p>
            I work with stakeholders to understand their workflows, clarify
            requirements, and turn technical constraints into practical decisions.
            My work spans application features, integrations, and internal tools,
            followed by demonstrations, feedback, and ongoing support.
          </p>
          <p>
            I bring {profile.experienceYears} years
            of development and quality engineering experience across federal,
            e-commerce, and banking environments. My focus is connecting customer
            needs with products, services, and systems people can adopt and rely on.
          </p>
          <div className="mt-5">
          <Button
            href={href("experience/")}
            color="link-color"
            iconTrailing={ArrowRight}
          >
            Explore my experience
          </Button>
          </div>
        </div>
      </section>
      <Contact />
    </>
  );
}

function ExplorerChoice({ title, description, active, ...props }: {
  title: string;
  description: string;
  active: boolean;
  href: string;
  id?: string;
  onClick: NonNullable<ButtonComponentProps["onClick"]>;
}) {
  return <Button {...props} color="tertiary"
    className={`h-full min-h-28 w-full items-start justify-start rounded-lg px-4 py-4 whitespace-normal text-left ring-1 ring-inset max-sm:min-h-0 [&>[data-text]]:w-full ${active ? "bg-brand-50 text-brand-secondary ring-brand-300 hover:bg-brand-50" : "bg-primary text-secondary ring-secondary hover:bg-secondary hover:ring-primary"}`}
    aria-current={active ? "true" : undefined}>
    <span className="flex w-full min-w-0 flex-col gap-2">
      <span>{title}</span>
      <span className={`text-xs leading-5 font-normal ${active ? "text-brand-secondary" : "text-tertiary"}`}>{description}</span>
    </span>
  </Button>;
}

function ProjectExplorer({ profile, showExperience = false }: { profile: Profile; showExperience?: boolean }) {
  const projects = showExperience ? profile.projects : orderedProjects(profile.projects);
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
  }, [profile, showExperience]);
  const selectProject = (slug: string) => {
    if (!projects.some((project) => project.slug === slug)) return;
    setSelected(slug);
    window.history.pushState(null, "", `#project-${slug}`);
  };
  const project = projects.find((item) => item.slug === selected) ?? projects[0]!;
  return <section className="work-explorer" aria-label="Project explorer">
      <nav className="project-selector" aria-label="Choose a project">
        <p className="sr-only">Projects &amp; employment</p>
        {projects.map((item) => <ExplorerChoice key={item.slug} id={`project-${item.slug}`} href={href(`experience/${item.slug}/`)}
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
    "Application development": "Build interfaces and reusable application features around the problem a team needs solved.",
    "Data and integration": "Connect workflows, validate API behavior, and investigate the data behind application results.",
    "Delivery and quality": "Make changes repeatable and give teams useful feedback before release.",
    "AI-assisted engineering": "Use coding assistants to explore approaches, develop features, debug, and refactor—with review and validation.",
  };
  const groups = [
    {
      label: "Customer discovery & delivery",
      description: "Work directly with stakeholders from the first requirements conversation through demonstrations and adoption.",
      items: [...profile.competencies, "Requirements & acceptance criteria", "Technical constraints", "Product demonstrations", "User feedback"],
    },
    ...profile.skillGroups.map(group => ({
      ...group,
      description: descriptions[group.label],
      items: group.label === "AI-assisted engineering" ? [...group.items, "Codex", "Code review", "Debugging & refactoring"] : group.items,
    })),
    {
      label: "Internal tools & file workflows",
      description: "Turn recurring manual work into a desktop tool that teammates can use and maintain.",
      items: ["Electron", "Test data generation", "JSON editing", "gzip packaging", "SFTP", "WinSCP", "Upload status", "Retry handling"],
    },
    {
      label: "Web platforms & deployment",
      description: "Build and maintain this portfolio with shared content, accessible components, and portable static builds.",
      items: ["Vite", "Untitled UI", "Tailwind CSS", "React Aria", "pnpm", "Cloudflare deployment configuration", "GitHub Pages", "Static prerendering"],
    },
    {
      label: "Troubleshooting & team enablement",
      description: "Trace issues across interfaces, data, and delivery workflows, then help the team put the fix to use.",
      items: ["Frontend & backend investigation", "Database checks", "Defect diagnosis", "API validation", "Technical documentation", "Workflow walkthroughs", "Ongoing tool support"],
    },
  ];
  const additionalSkills: Record<string, string[]> = {
    "Customer discovery & delivery": ["Healthcare claims workflow mapping", "Stakeholder demonstrations", "Feedback-driven improvements", "Operational constraints"],
    "Application development": ["Frontend feature implementation", "Workflow and status interfaces", "Responsive behavior", "Cross-browser validation"],
    "Data and integration": ["DataGrip", "API schema validation", "Service contract checks", "Application-to-database reconciliation", "Referral-data uploads", "Network stubbing"],
    "Delivery and quality": ["Reusable smoke & regression frameworks", "Parallel and headless execution", "Applitools Eyes", "Diagnostic artifacts"],
    "AI-assisted engineering": ["Implementation exploration", "Test creation", "Review and validation of generated changes"],
    "Troubleshooting & team enablement": ["Reproducible defect reports", "Screenshots and execution evidence", "Developer coordination", "Single and bulk upload guidance"],
  };
  const businessGroups = [
    {
      label: "Business requirements & delivery coordination",
      description: "Translate business workflows into clear acceptance criteria and keep stakeholders informed about blockers, dependencies, and operational impact.",
      items: ["Jira", "Confluence", "YouTrack", "Business & functional requirements", "Acceptance criteria", "Requirements traceability", "Business-impact reporting", "Delivery dependencies", "Progress and blocker tracking", "Product owner & analyst collaboration"],
    },
    {
      label: "Solution evaluation & technical decisions",
      description: "Compare implementation options against maintainability, reuse, authentication, and environment constraints, drawing on the evaluation of Playwright and internal tooling.",
      items: ["Tool and framework evaluation", "Legacy automation assessment", "Maintainability tradeoffs", "Reusable component design", "Environment access constraints", "Implementation alternatives"],
    },
  ];
  const operationalGroups = [
    {
      label: "Version control & repositories",
      description: "Version control and repository platforms I use for source code and development collaboration.",
      items: ["Git", "GitHub", "GitLab", "Bitbucket", "Azure Repos"],
    },
    {
      label: "Development environments",
      description: "Editors and IDEs I use for application development, code navigation, and debugging. Database tooling is listed under data and integration.",
      items: ["VS Code", "WebStorm", "IntelliJ IDEA"],
    },
    {
      label: "Continuous integration & build tools",
      description: "Tools for repeatable builds, automated checks, and feedback during development and delivery.",
      items: ["GitHub Actions", "Jenkins", "TeamCity"],
    },
    {
      label: "Operating systems",
      description: "Daily personal and professional use across Windows, Linux, and macOS.",
      items: ["Windows", "Linux", "macOS"],
    },
    {
      label: "Identity & environment troubleshooting",
      description: "Validate sign-in workflows and investigate authentication or environment dependencies that affect application behavior and automated execution.",
      items: ["OIDC workflow validation", "Okta MFA", "Single sign-on checks", "Microsoft Entra ID investigation", "Restricted environment access", "Authentication failure evidence"],
    },
    {
      label: "Release readiness & operational validation",
      description: "Give developers and product owners repeatable evidence about expected behavior, defects, and fixes across delivery environments.",
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
        <p className="section-intro">{detailed ? "From business workflows and stakeholder requirements to implementation, integration, and release readiness." : "The tools and practices I use to understand, build, and deliver."}</p>
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
              {group.items.map(item => <li key={item}>{item}</li>)}
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

function CredentialStrip({ profile }: { profile: Profile }) {
  const previews = profile.verifiedCredentials.flatMap((credential) => {
    if (!credential.href) return [];
    const image = credentialImages.find((asset) => asset.credentialHref === credential.href);
    return image ? [{ credential, image, verificationHref: credential.href }] : [];
  });
  if (!previews.length) return null;

  return (
    <section className="credential-strip shell" aria-label="OpenAI Academy credentials">
      <ul className="credential-grid">
        {previews.map(({ credential, image, verificationHref }) => (
          <li className="credential-card" key={verificationHref}>
            <div className="credential-preview">
              <img
                src={image.src}
                alt={`${credential.name} — OpenAI Academy credential`}
                width={image.width}
                height={image.height}
                loading="lazy"
                decoding="async"
              />
            </div>
            <h3>{credential.name}</h3>
            <p>{credential.issuer} · Issued <time dateTime={credential.issuedOn}>{credential.issuedOn.slice(0, 4)}</time></p>
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
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Work({ profile }: { profile: Profile }) {
  return (
    <>
      <section className="page-hero shell about-hero">
        <div>
          <h1>
            Work history.
            {" "}
            <span>Projects in practice.</span>
          </h1>
          <p>
            Explore my roles, the projects I’ve contributed to, and the tools
            I’ve built across federal, e-commerce, and banking environments.
          </p>
        </div>
      </section>
      <CredentialStrip profile={profile} />
      <section className="section shell" id="experience-projects">
        <header className="section-heading-centered">
          <h2>Professional experience &amp; projects.</h2>
          <p className="section-intro">{profile.experienceYears} years across federal, e-commerce, and banking environments. Explore the work below.</p>
        </header>
        <ProjectExplorer profile={profile} showExperience />
      </section>
      <section className="section shell profile-centered" aria-labelledby="approach-heading">
        <header>
          <p className="eyebrow">My approach</p>
          <h2 id="approach-heading">Understand the problem. Deliver the solution.</h2>
        </header>
        <div className="resume-summary">
          <p>
            I work directly with stakeholders to understand how they work,
            identify technical obstacles, and turn requirements into application
            features and internal tools. I stay involved through implementation,
            demonstrations, troubleshooting, and user feedback—connecting
            engineering decisions to the problem the customer needs solved.
          </p>
          <p>
            At Booz Allen Hamilton, this includes contributing React features
            and investigating application and data issues for the United States
            Department of Veterans Affairs. I also independently built and
            support Data Generator &amp; File Processing, a desktop application that creates referral test data,
            packages files, and supports uploads for internal workflows.
          </p>
          <p>
            My {profile.experienceYears} years across software development and quality engineering
            in federal, banking, and e-commerce environments inform how I approach
            delivery: understand the systems involved, validate the behavior,
            and help people adopt the solution. That combination of customer
            collaboration and technical execution is the foundation of my focus
            on Forward Deployed Engineering.
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
          <section className="learning-column" aria-labelledby="education-heading">
            <FeaturedIcon icon={BookOpen01} color="brand" theme="light" size="lg" />
            <h3 id="education-heading">Education</h3>
            <ul className="learning-list">
              {profile.education.map((education) => (
                <li key={`${education.institution}-${education.credential}-${education.end}`}>
                  <h4>{education.credential} in {education.field}</h4>
                  <p>{education.institution} · {education.end.slice(0, 4)}</p>
                </li>
              ))}
            </ul>
          </section>
          <section className="learning-column" aria-labelledby="courses-heading">
            <FeaturedIcon icon={Award01} color="brand" theme="light" size="lg" />
            <h3 id="courses-heading">Courses &amp; certifications</h3>
            <ul className="learning-list">
              {profile.verifiedCredentials.map((credential) => (
                <li key={`${credential.issuer}-${credential.name}-${credential.issuedOn}`}>
                  <h4>{credential.name}</h4>
                  <p>{credential.issuer} · Issued <time dateTime={credential.issuedOn}>{credential.issuedOn.slice(0, 4)}</time></p>
                  {credential.href && (
                    <Button color="link-color" className="mt-3" href={credential.href} iconTrailing={ArrowUpRight}>
                      View credential
                    </Button>
                  )}
                </li>
              ))}
              {profile.credentials.map((credential) => (
                <li key={credential}><p>{credential}</p></li>
              ))}
            </ul>
          </section>
        </div>
      </section>
      <Contact />
    </>
  );
}

export function Resume() {
  return (
    <>
      <section className="page-hero shell resume-hero">
        <h1>
          Two resumes. One
          {" "}
          <span>consistent career story.</span>
        </h1>
        <p>
          A concise introduction or the full technical picture. Choose the
          format that works for your conversation.
        </p>
      </section>
      <section className="shell resume-choices" aria-label="Resume downloads">
        {[
          {
            id: "one-page",
            label: "The introduction",
            title: "One-page resume",
            text: "A focused overview for recruiters, applications, and first conversations.",
            items: [
              "Professional summary and core capabilities",
              "Experience across all three roles",
              "React, integration, and customer delivery",
            ],
          },
          {
            id: "detailed",
            label: "The full picture",
            title: "Detailed resume",
            text: "The complete technical record for a deeper look at my experience.",
            items: [
              "Expanded responsibilities and delivery context",
              "Complete engineering and quality toolkit",
              "Expanded stakeholder work and internal tool development",
            ],
          },
        ].map((r) => (
          <article className="resume-choice" key={r.id}>
            <FeaturedIcon icon={File06} color="brand" theme="light" size="lg" />
            <p className="eyebrow">{r.label}</p>
            <h2>{r.title}</h2>
            <p>{r.text}</p>
            <ul>
              {r.items.map((item) => (
                <li key={item}>
                  <Check />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="resume-downloads">
              <Button
                href={href(`resume/mohamed-moheyeldin-resume-${r.id}.pdf`)}
                download
                iconLeading={Download01}
              >
                Download PDF
              </Button>
              <Button
                color="secondary"
                href={href(`resume/mohamed-moheyeldin-resume-${r.id}.docx`)}
                download
              >
                Download Word
              </Button>
            </div>
          </article>
        ))}
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
                <p>{role.professionalTitle ?? role.title} · {date(role.start)} — {date(role.end)}</p>
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
          <div className={embedded && interactive && section === "overview" ? "project-detail-content overview-columns" : "project-detail-content"}>
            {interactive && <div className="detail-selector">
              <ButtonGroup className="w-full sm:w-max" aria-label="Project detail sections" disallowEmptySelection selectedKeys={new Set([section])}
                onSelectionChange={(keys) => setSection(String([...keys][0] ?? "overview"))}>
                {sections.map(([id, label]) => <ButtonGroupItem className="flex-1 justify-center px-2 text-xs selected:bg-brand-50 selected:text-brand-secondary selected:ring-brand-300 selected:hover:bg-brand-100 selected:hover:text-brand-secondary not-last:pr-2 sm:px-4 sm:text-sm sm:not-last:pr-4" key={id} id={id} aria-controls={id === "overview" ? "project-details-overview outcome" : `project-details-${id}`}>{label}</ButtonGroupItem>)}
              </ButtonGroup>
            </div>}
            <section id={embedded ? "project-details-overview" : "challenge"} hidden={interactive && section !== "overview"} tabIndex={-1}>
              {!embedded && <p className="eyebrow">01 / Challenge</p>}
              <h2>{embedded ? "The challenge" : "The delivery problem."}</h2>
              <p>{project.challenge}</p>
              <p><strong>Who needed it:</strong> {project.audience}</p>
            </section>
            <section id={embedded ? "project-details-implementation" : "approach"} hidden={interactive && section !== "implementation"} tabIndex={-1}>
              {!embedded && <p className="eyebrow">02 / Approach</p>}
              <h2>What I personally built.</h2>
              <ol className="approach-list">
                {project.approach.map((s, i) => (
                  <li key={s}>
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    <p>{s}</p>
                  </li>
                ))}
              </ol>
            </section>
            <section id="outcome" hidden={interactive && section !== "overview"} tabIndex={-1}>
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
            </section>
            <section id="systems" hidden={interactive && section !== "implementation"} tabIndex={-1}>
              {!embedded && <p className="eyebrow">04 / Systems & decisions</p>}
              <h2>APIs, data, and infrastructure.</h2>
              {project.systems.map((text) => <p key={text}>{text}</p>)}
              <h3>Constraints and tradeoffs</h3>
              <ul className="plain-list">{project.decisions.map((text) => <li key={text}>{text}</li>)}</ul>
            </section>
            <section id={embedded ? "project-details-evidence" : "evidence"} hidden={interactive && section !== "evidence"} tabIndex={-1}>
              {!embedded && <p className="eyebrow">05 / Evidence</p>}
              <h2>What you can inspect.</h2>
              {project.evidence.map((item) => <div key={item.label}>
                <h3>{item.label}</h3><p>{item.detail}</p>
                {item.href && <Button className="whitespace-normal text-left" color="link-color" href={item.href} iconTrailing={ArrowUpRight}>{item.label}</Button>}
              </div>)}
              <h3>How this supports my FDE direction</h3><p>{project.relevance}</p>
              {project.relatedProjects.length > 0 && <div>
                <h3>Related work</h3>
                {project.relatedProjects.map((related) => <p key={related.slug}><Button className="whitespace-normal text-left" color="link-color" href={href(`experience/${related.slug}/`)} onClick={(event) => {
                  if (!interactive || !onSelectProject || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
                  event.preventDefault(); onSelectProject(related.slug);
                }} iconTrailing={ArrowRight}>{related.label}</Button></p>)}
              </div>}
            </section>
            <section id="toolkit" hidden={interactive && section !== "implementation"} tabIndex={-1}>
              {!embedded && <p className="eyebrow">06 / Toolkit</p>}
              <h2>Tools in context.</h2>
              <Tags items={project.technologies} />
            </section>
            {project.kind === "independent" && <section id="walkthrough" hidden={interactive && section !== "implementation"} tabIndex={-1}>
              {!embedded && <p className="eyebrow">07 / Implementation walkthrough</p>}
              <h2>Follow one content change through the system.</h2>
              <ol className="approach-list">
                {[
                  ["Start with data", "Edit the public career record in src/content/career.json. Required fields and unique project slugs are checked before a build."],
                  ["Render the interface", "React composes the record with free Untitled UI controls. Browse the work page or follow a project link; static HTML keeps the case studies readable without JavaScript."],
                  ["Generate documents", "pnpm resume:generate creates the resume formats from the same record, with Inter and the website’s blue theme tokens."],
                  ["Validate and package", "pnpm verify checks types, content, production output, and GitHub Pages paths. pnpm build:cloudflare restores the root-path build."],
                  ["Deploy explicitly", "wrangler.jsonc points Cloudflare Static Assets at dist. Deployment is a separate release action; this walkthrough does not claim the current branch is live."]
                ].map(([title, text], i) => <li key={title}><span>{String(i + 1).padStart(2, "0")}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}
              </ol>
              <p>This implementation connects a UI, structured data, generated documents, and deployment packaging. It has no runtime API; the career case studies describe my API and environment integration work.</p>
              <div className="hero-buttons"><Button color="secondary" href={href("experience/")}>Explore the interface</Button><Button color="secondary" href={href("resume/")}>Inspect the resume outputs</Button></div>
            </section>}
            <div className="disclosure" role="note">
              <ShieldTick />
              <p>
                {project.kind === "career"
                  ? "This account is derived from documented career responsibilities. Client-sensitive details are intentionally generalized, and no undisclosed metrics are presented."
                  : "I designed and developed this public project. Its source, content model, and automated checks can be reviewed in the linked repository. The Untitled UI redesign is developed on the untitledui branch."}
              </p>
            </div>
          </div>
        </div>
      </article>
      {!embedded && <Contact />}
    </>
  );
}

export function Contact() {
  return (
    <section className="contact-section">
      <div className="shell contact-inner">
        <div>
          <p className="eyebrow">Let’s build something dependable</p>
          <h2>
            Good work starts with
            <br />a conversation.
          </h2>
          <p>
            Have an integration challenge or a Forward Deployed Engineer opportunity?
            <br />
            I’d love to hear about it.
          </p>
        </div>
        <div className="contact-actions">
          <Button href={email} size="xl" iconLeading={Mail01}>
            Get in touch
          </Button>
          <Button className="max-w-full whitespace-normal break-all text-center" href={email} color="link-color" size="sm">
            {emailAddress}
          </Button>
        </div>
      </div>
    </section>
  );
}

export function NotFound() {
  return (
    <section className="page-hero shell not-found">
      <p className="eyebrow">404 / Page not found</p>
      <h1>
        This page didn’t pass
        {" "}
        <span>the existence check.</span>
      </h1>
      <p>The link may have changed. Let’s get you back to something useful.</p>
      <Button href={root} iconLeading={ArrowLeft}>
        Back to home
      </Button>
    </section>
  );
}
