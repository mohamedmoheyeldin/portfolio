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
import { formatCareerDate, profile as careerProfile, veteransAffairsName } from "@/lib/career";
import credentialImages from "@/content/credential-images.json";

type Profile = typeof careerProfile;
type Project = Profile["projects"][number];
const emailAddress = "mohamedmoheyeldin.jobs@gmail.com";
const email = `mailto:${emailAddress}`;
const root = `${import.meta.env.BASE_URL.replace(/\/?$/, "")}/`;
const href = (path = "") => `${root}${path}`;

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

export function Footer({ name, headline }: { name: string; headline: string }) {
  return (
    <footer className="site-footer">
      <div className="shell footer-top">
        <div>
          <Button color="link-gray" size="lg" href={root}>
            {name}
          </Button>
          <p>{headline}</p>
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
            Forward Deployed Engineer <span>building software with the people who use it.</span>
          </h1>
          <p>
            {profile.heroSummary}
          </p>
        </div>
      </section>
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
      <section className="expertise-section">
        <div className="section shell">
          <header className="section-heading-centered">
          <p className="eyebrow">What I do</p>
          <h2>What my days look like.</h2>
          <p className="section-intro">
            Most of my work is connecting systems, building small tools, and
            working closely with the people who use them.
          </p>
          </header>
          <div className="expertise-grid">
            {[
              {
                icon: Code02,
                title: "APIs, tools, and integrations",
                text: "I integrate APIs, build tools that generate and process data, and automate work that would otherwise be repeated by hand.",
              },
              {
                icon: GitBranch01,
                title: "Cloud and delivery systems",
                text: "I have used GitHub Actions and AWS test environments to run checks and track down why something failed.",
              },
              {
                icon: LayersTwo01,
                title: "Working with stakeholders",
                text: "I meet with stakeholders and users, write down what they need, demo the work, and keep supporting it after release.",
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
          <h2 id="how-i-work-heading">Start with the people using it.</h2>
        </header>
        <div className="resume-summary">
          <p>
            I start by talking with the people who will use the software. I ask
            how they work today, write down the requirements and what done looks
            like, then build it and show them. Their feedback decides what
            happens next, and I keep supporting it after release.
          </p>
          <p>
            After {profile.experienceYears} years in development and quality
            engineering across federal, e-commerce, and banking, I trace a
            problem through the whole system, from what a user sees to the data
            behind it.
          </p>
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
      items: group.label === "AI-assisted engineering" ? [...group.items, "Codex", "Code review", "Debugging & refactoring"] : group.items,
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
      <CredentialStrip profile={profile} />
      <section className="section shell" id="experience-projects">
        <header className="section-heading-centered">
          <h2>Experience &amp; projects</h2>
          <p className="section-intro">{profile.experienceYears} years across federal, e-commerce, and banking. The work is below.</p>
        </header>
        <ProjectExplorer profile={profile} />
      </section>
      <section className="section shell profile-centered" aria-labelledby="approach-heading">
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

/* Resumes listed on the Resume page. To add one, generate its files as
   public/resume/mohamed-moheyeldin-resume-<id>.<ext> and add an entry here. */
const resumes = [
  {
    id: "detailed",
    label: "PDF and Word",
    title: "Detailed resume",
    text: "My roles, projects, skills, and certifications, with the details behind each one.",
    items: [
      "Booz Allen Hamilton, Chick-fil-A, and Ally Bank, role by role",
      "VA claims work, stakeholder demos, and internal tools",
      "Skills, education, and certifications",
    ],
    formats: [
      { ext: "pdf", label: "Download PDF", primary: true },
      { ext: "docx", label: "Download Word", primary: false },
    ],
  },
];

export function Resume() {
  return (
    <>
      <section className="page-hero shell resume-hero">
        <h1>
          Resume
          {" "}
          <span>downloads.</span>
        </h1>
        <p>
          Download my resume as a PDF or Word file.
        </p>
      </section>
      <section className="shell resume-choices" aria-label="Resume downloads">
        {resumes.map((r) => (
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
              {r.formats.map((format) => (
                <Button
                  key={format.ext}
                  color={format.primary ? "primary" : "secondary"}
                  href={href(`resume/mohamed-moheyeldin-resume-${r.id}.${format.ext}`)}
                  download
                  iconLeading={format.primary ? Download01 : undefined}
                >
                  {format.label}
                </Button>
              ))}
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
          <div className={embedded && interactive && section === "overview" ? "project-detail-content overview-columns" : "project-detail-content"}>
            {interactive && <div className="detail-selector">
              <ButtonGroup className="w-full sm:w-max" aria-label="Project detail sections" disallowEmptySelection selectedKeys={new Set([section])}
                onSelectionChange={(keys) => setSection(String([...keys][0] ?? "overview"))}>
                {sections.map(([id, label]) => <ButtonGroupItem className="flex-1 justify-center px-2 text-xs selected:bg-brand-50 selected:text-brand-secondary selected:ring-brand-300 selected:hover:bg-brand-100 selected:hover:text-brand-secondary not-last:pr-2 sm:px-4 sm:text-sm sm:not-last:pr-4" key={id} id={id} aria-controls={id === "overview" ? "project-details-overview outcome" : `project-details-${id}`}>{label}</ButtonGroupItem>)}
              </ButtonGroup>
            </div>}
            <section id={embedded ? "project-details-overview" : "challenge"} hidden={interactive && section !== "overview"} tabIndex={-1}>
              {!embedded && <p className="eyebrow">01 / Challenge</p>}
              <h2>{embedded ? "The challenge" : "The problem."}</h2>
              <p>{project.challenge}</p>
              <p><strong>Who needed it:</strong> {project.audience}</p>
            </section>
            <section id={embedded ? "project-details-implementation" : "approach"} hidden={interactive && section !== "implementation"} tabIndex={-1}>
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
              <h2>How it fit together.</h2>
              {project.systems.map((text) => <p key={text}>{text}</p>)}
              <h3>Constraints and tradeoffs</h3>
              <ul className="plain-list">{project.decisions.map((text) => <li key={text}>{text}</li>)}</ul>
            </section>
            <section id={embedded ? "project-details-evidence" : "evidence"} hidden={interactive && section !== "evidence"} tabIndex={-1}>
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
            </section>
            <section id="toolkit" hidden={interactive && section !== "implementation"} tabIndex={-1}>
              {!embedded && <p className="eyebrow">06 / Toolkit</p>}
              <h2>Tools used.</h2>
              <Tags items={project.technologies} />
            </section>
            {project.kind === "independent" && <section id="walkthrough" hidden={interactive && section !== "implementation"} tabIndex={-1}>
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
              <div className="hero-buttons"><Button color="secondary" href={href("experience/")}>Explore the interface</Button><Button color="secondary" href={href("resume/")}>Inspect the resume outputs</Button></div>
            </section>}
            <div className="disclosure" role="note">
              <ShieldTick />
              <p>
                {project.kind === "career"
                  ? "This is based on my documented career responsibilities. I left out client-sensitive details on purpose, and I have not added numbers I can't support."
                  : "I designed and built this project. The source, content model, and automated checks are in the linked repository."}
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
          <p className="eyebrow">Contact</p>
          <h2>Get in touch.</h2>
          <p>
            If you have an integration problem or a Forward Deployed Engineer
            role, send me an email.
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
        This page
        {" "}
        <span>doesn’t exist.</span>
      </h1>
      <p>The link may be old or mistyped. The home page is a good place to start.</p>
      <Button href={root} iconLeading={ArrowLeft}>
        Back to home
      </Button>
    </section>
  );
}
