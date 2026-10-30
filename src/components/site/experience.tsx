import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight } from "@untitledui/icons";
import { Button, type Props as ButtonComponentProps } from "@/components/base/buttons/button";
import credentialImages from "@/content/credential-images.json";
import { Page } from "./chrome";
import { CaseStudy } from "./case-study";
import { CareerSection, SectionHead } from "./home";
import { type Chapter, type Profile, href, projectDisplayName, root } from "./shared";

const chapters: Chapter[] = [
  { id: "introduction", label: "Introduction" },
  { id: "experience-projects", label: "Projects" },
  { id: "work-history", label: "Work history" },
  { id: "approach", label: "Approach" },
  { id: "engineering-toolkit", label: "Skills" },
  { id: "learning", label: "Learning" },
];

export function Work({ profile }: { profile: Profile }) {
  return (
    <Page chapters={chapters}>
      <section className="sec page-head" id="introduction" aria-labelledby="title-heading" data-sc-act="surface">
        <div className="wb-container">
          <p className="doc-path"><code>experience</code><span>The full record</span></p>
          <h1 id="title-heading">{profile.experienceYears} years of building software, and checking it holds up.</h1>
          <p className="page-dek">My roles, the projects behind them, and the tools I use, across federal healthcare, e-commerce and banking.</p>
          <CredentialStrip profile={profile} />
        </div>
      </section>
      <section className="sec" id="experience-projects" aria-labelledby="projects-heading" data-sc-act="explorer">
        <div className="wb-container">
          <SectionHead title="Projects" id="projects-heading">
            <p>Pick a project to read its overview, implementation and evidence here, or open the full case study.</p>
          </SectionHead>
          <ProjectExplorer profile={profile} />
        </div>
      </section>
      <CareerSection profile={profile} detailed />
      <section className="sec" id="approach" aria-labelledby="approach-heading" data-sc-act="prose">
        <div className="wb-container">
        <SectionHead title="How I approach the work" id="approach-heading" />
        <div className="prose">
          <p>
            I work directly with stakeholders to learn how they work and what is getting in their way, then build the
            application features and internal tools that fix it. I stay involved after that: demos, troubleshooting, and user feedback.
          </p>
          <p>
            At Booz Allen Hamilton I work on a VA healthcare claims platform. I build React features, work with health providers
            and VA stakeholders, and investigate application and data issues. I also built and support Data Generator &amp; File
            Processing, a desktop app that creates referral test data, packages files, and uploads them for internal use.
          </p>
          <p>
            After {profile.experienceYears} years in software development and quality engineering across federal, banking, and
            e-commerce, I start by understanding the system, check that it behaves the way people expect, and make sure they can use
            the result. That is why I am focused on Forward Deployed Engineering.
          </p>
        </div>
        </div>
      </section>
      <EngineeringToolkit profile={profile} />
      <Learning profile={profile} />
    </Page>
  );
}

function ExplorerChoice({ title, description, active, index, outcome, ...props }: {
  title: string;
  description: string;
  active: boolean;
  /** Optional entry number and headline outcome, used by the project menu. */
  index?: string;
  outcome?: string;
  href: string;
  id?: string;
  onClick: NonNullable<ButtonComponentProps["onClick"]>;
}) {
  return <Button {...props} color="tertiary"
    className={`w-full items-start justify-start rounded-lg px-3 py-3 whitespace-normal text-left [&>[data-text]]:w-full ${active ? "bg-secondary shadow-xs ring-1 ring-secondary ring-inset" : ""}`}
    aria-current={active ? "true" : undefined}>
    <span className="explorer-choice-inner">
      {index && <span aria-hidden="true" className="explorer-choice-number">{index}</span>}
      <span className="explorer-choice-text">
        <span className="explorer-choice-title">{title}</span>
        <span className="explorer-choice-description">{description}</span>
        {outcome && <span className="explorer-choice-outcome">{outcome}</span>}
      </span>
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
  }, [projects]);
  const selectProject = (slug: string) => {
    if (!projects.some((project) => project.slug === slug)) return;
    setSelected(slug);
    window.history.pushState(null, "", `#project-${slug}`);
  };
  const project = projects.find((item) => item.slug === selected) ?? projects[0]!;
  return <div className="explorer">
      <nav className="explorer-menu" aria-label="Choose a project">
        {projects.map((item, index) => <ExplorerChoice key={item.slug} id={`project-${item.slug}`} href={href(`experience/${item.slug}/`)}
          index={String(index + 1).padStart(2, "0")}
          outcome={item.metric?.value}
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
    </div>;
}

/** Five broad areas over the 16 detailed categories. All categories render, with anchors, when JavaScript is unavailable. */
function EngineeringToolkit({ profile }: { profile: Profile }) {
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [interactive, setInteractive] = useState(false);
  const descriptions: Record<string, string> = {
    "Application development": "I build interfaces and reusable features around the problem a team is trying to solve.",
    "Data and integration": "Connecting workflows, checking API behavior, and digging into the data behind what the application shows.",
    "Delivery and quality": "Making changes repeatable and giving teams feedback before release.",
    "AI-assisted engineering": "I use coding assistants to explore options, write and debug code, and refactor, then review and test what they produce.",
  };
  const additionalSkills: Record<string, string[]> = {
    "Customer discovery & delivery": ["Healthcare claims workflow mapping", "Stakeholder demonstrations", "Working sessions with end users", "Production issue triage", "Feedback-driven improvements", "Operational constraints"],
    "Application development": ["Frontend feature implementation", "Workflow and status interfaces", "Responsive behavior", "Cross-browser validation"],
    "Data and integration": ["DataGrip", "API schema validation", "Service contract checks", "Provider API integration", "Live claim status", "Tableau dashboards", "System health monitoring", "Application-to-database reconciliation", "Referral-data uploads", "Network stubbing"],
    "Delivery and quality": ["Reusable smoke & regression frameworks", "Parallel and headless execution", "Applitools Eyes", "Diagnostic artifacts"],
    "AI-assisted engineering": ["Implementation exploration", "Test creation", "Review and validation of generated changes", "Code review", "Debugging & refactoring"],
    "Troubleshooting & team enablement": ["Reproducible defect reports", "Screenshots and execution evidence", "Developer coordination", "Single and bulk upload guidance"],
  };
  const groups = [
    { label: "Customer discovery & delivery", description: "Working with stakeholders from the first requirements conversation through demos and adoption.", items: [...profile.competencies, "Requirements & acceptance criteria", "Technical constraints", "Product demonstrations", "User feedback"] },
    { label: "Business requirements & delivery coordination", description: "Turning business workflows into clear acceptance criteria, and keeping stakeholders posted on blockers, dependencies, and operational impact.", items: ["Jira", "Confluence", "YouTrack", "Business & functional requirements", "Acceptance criteria", "Requirements traceability", "Business-impact reporting", "Delivery dependencies", "Progress and blocker tracking", "Product owner & analyst collaboration"] },
    { label: "Solution evaluation & technical decisions", description: "Comparing options on maintainability, reuse, authentication, and environment limits, including the Playwright evaluation and internal tooling.", items: ["Tool and framework evaluation", "Legacy automation assessment", "Maintainability tradeoffs", "Reusable component design", "Environment access constraints", "Implementation alternatives"] },
    ...profile.skillGroups.map((group) => ({ ...group, description: descriptions[group.label] ?? "" })),
    { label: "Internal tools & file workflows", description: "Turning repeated manual work into a desktop tool the team can use and maintain.", items: ["Electron", "Test data generation", "JSON editing", "gzip packaging", "SFTP", "WinSCP", "Upload status", "Retry handling"] },
    { label: "Web platforms & deployment", description: "What this portfolio runs on: shared content, accessible components, and static builds for Cloudflare or a GitHub Pages path.", items: ["Vite", "Untitled UI", "Tailwind CSS", "React Aria", "pnpm", "Cloudflare deployment configuration", "GitHub Pages", "Static prerendering"] },
    { label: "Troubleshooting & team enablement", description: "Tracing issues across interfaces, data, and delivery workflows, then helping the team use the fix.", items: ["Frontend & backend investigation", "Database checks", "Defect diagnosis", "API validation", "Technical documentation", "Workflow walkthroughs", "Ongoing tool support"] },
    { label: "Version control & repositories", description: "Version control and repository platforms I use for source code and collaboration.", items: ["Git", "GitHub", "GitLab", "Bitbucket", "Azure Repos"] },
    { label: "Development environments", description: "Editors and IDEs I use to write code, navigate it, and debug. Database tools are listed under data and integration.", items: ["VS Code", "WebStorm", "IntelliJ IDEA"] },
    { label: "Continuous integration & build tools", description: "Tools for repeatable builds, automated checks, and early feedback.", items: ["GitHub Actions", "Jenkins", "TeamCity"] },
    { label: "Operating systems", description: "I use Windows, Linux, and macOS day to day, at work and at home.", items: ["Windows", "Linux", "macOS"] },
    { label: "Identity & environment troubleshooting", description: "Checking sign-in flows and looking into authentication or environment problems that affect the application or automated runs.", items: ["OIDC workflow validation", "Okta MFA", "Single sign-on checks", "Microsoft Entra ID investigation", "Restricted environment access", "Authentication failure evidence"] },
    { label: "Release readiness & operational validation", description: "Repeatable evidence for developers and product owners about expected behavior, defects, and fixes across environments.", items: ["Development, QA, UAT & staging", "Smoke and sanity checks", "Regression validation", "Deployment checks", "Hotfix verification", "Exploratory testing", "Fix verification", "Release-readiness evidence"] },
  ].map((group) => ({
    ...group,
    items: [...new Set([...group.items, ...(additionalSkills[group.label] ?? [])])].filter((item) =>
      !(group.label === "Delivery and quality" && ["Git", "Jira", "GitHub Actions", "Jenkins"].includes(item)) &&
      !(group.label === "AI-assisted engineering" && item === "VS Code")),
  }));
  const areas = [
    { label: "Customer & Business", summary: "Discovery, requirements & decisions", categories: [0, 1, 2] },
    { label: "Application Engineering", summary: "Development, internal tools & AI", categories: [3, 6, 7] },
    { label: "Data & Integration", summary: "Data, identity & troubleshooting", categories: [4, 9, 14] },
    { label: "Quality & Delivery", summary: "Validation, builds & releases", categories: [5, 12, 15] },
    { label: "Platforms & Tools", summary: "Web, repositories & environments", categories: [8, 10, 11, 13] },
  ];
  const selectedArea = areas.find((area) => area.categories.includes(selectedCategory)) ?? areas[0]!;
  useEffect(() => {
    const syncCategory = () => {
      const match = /^#toolkit-category-(\d+)$/.exec(window.location.hash);
      const index = match ? Number(match[1]) : 0;
      if (index < groups.length) setSelectedCategory(index);
    };
    syncCategory();
    setInteractive(true);
    window.addEventListener("hashchange", syncCategory);
    return () => window.removeEventListener("hashchange", syncCategory);
  }, [groups.length]);
  return <section className="sec" id="engineering-toolkit" aria-labelledby="toolkit-heading" data-sc-act="explorer">
    <div className="wb-container">
    <SectionHead title="The tools behind the work" id="toolkit-heading">
      <p>From business workflows and requirements to implementation, integration, and release checks.</p>
    </SectionHead>
    <div className="explorer">
      <nav className="explorer-menu" aria-label="Choose an expertise category">
        {areas.map((area) => <ExplorerChoice key={area.label}
          href={`#toolkit-category-${area.categories[0]}`}
          title={area.label} description={area.summary} active={area === selectedArea}
          onClick={(event) => {
            if (!interactive || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            setSelectedCategory(area.categories[0]!);
          }} />)}
      </nav>
      <div className="explorer-panel">
        {interactive && <header className="toolkit-area-heading"><h3>{selectedArea.label}</h3><p>{selectedArea.summary}</p></header>}
        <div className="toolkit-categories">
          {groups.map((group, index) => <article key={group.label} id={`toolkit-category-${index}`} hidden={interactive && !selectedArea.categories.includes(index)}>
            <h4>{group.label}</h4>
            <p>{group.description}</p>
            <ul className="tags" aria-label={`${group.label} skills`}>
              {group.items.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </article>)}
        </div>
        <Button className="whitespace-normal text-left" href="#experience-projects" color="link-color" iconTrailing={ArrowRight}>Explore the projects behind these skills</Button>
      </div>
    </div>
    </div>
  </section>;
}

/** Official credential badge images, uncropped, with readable titles, year-only captions and verification links. */
function CredentialStrip({ profile }: { profile: Profile }) {
  const previews = profile.verifiedCredentials.flatMap((credential) => {
    const image = credentialImages.find((asset) => (credential.href ? asset.credentialHref === credential.href : asset.credentialName === credential.name));
    return image ? [{ credential, image }] : [];
  });
  if (!previews.length) return null;
  return (
    <section className="credential-strip" aria-labelledby="credentials-heading">
      <h2 className="sr-only" id="credentials-heading">Verified credentials</h2>
      <ul className="credential-grid" tabIndex={0} aria-label="Credential badges">
        {previews.map(({ credential, image }) => (
          <li className="credential-card" key={credential.href ?? credential.name}>
            <div className="credential-preview">
              <img src={/^https:/.test(image.src) ? image.src : `${root}${image.src}`} alt={`${credential.name}, ${credential.issuer} credential`}
                width={image.width} height={image.height} loading="lazy" decoding="async" />
            </div>
            <h3>{credential.name}</h3>
            <p>{credential.issuer} · Issued <time dateTime={credential.issuedOn}>{credential.issuedOn.slice(0, 4)}</time></p>
            {credential.href && <Button className="mt-auto" color="link-color" size="sm" href={credential.href} iconTrailing={ArrowUpRight}>View credential<span className="sr-only">: {credential.name}</span></Button>}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Learning({ profile }: { profile: Profile }) {
  const credentialGroups = profile.verifiedCredentials.reduce<Map<string, Profile["verifiedCredentials"]>>((groups, credential) => {
    groups.set(credential.issuer, [...(groups.get(credential.issuer) ?? []), credential]);
    return groups;
  }, new Map());
  return (
    <section className="sec" id="learning" aria-labelledby="learning-heading" data-sc-act="list">
      <div className="wb-container">
      <SectionHead title="Learning" id="learning-heading" />
      <div className="learning">
        <section aria-labelledby="education-heading">
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
        <section aria-labelledby="courses-heading">
          <h3 id="courses-heading">Courses &amp; certifications</h3>
          {Array.from(credentialGroups, ([issuer, credentials]) => (
            <div className="learning-issuer" key={issuer}>
              <h4>{issuer}</h4>
              <ul className="learning-list">
                {credentials.map((credential) => (
                  <li key={`${credential.name}-${credential.issuedOn}`}>
                    <h5>{credential.name}</h5>
                    <p>Issued <time dateTime={credential.issuedOn}>{credential.issuedOn.slice(0, 4)}</time>
                      {credential.href && <> · <a href={credential.href}>View credential<span className="sr-only">: {credential.name}</span></a></>}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {profile.credentials.length > 0 && (
            <div className="learning-issuer">
              <h4>Earlier training</h4>
              <ul className="learning-list">{profile.credentials.map((credential) => <li key={credential}><h5>{credential}</h5></li>)}</ul>
            </div>
          )}
        </section>
      </div>
      </div>
    </section>
  );
}
