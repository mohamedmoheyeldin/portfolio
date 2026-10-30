import type { CSSProperties, ReactNode } from "react";
import { ArrowRight, ArrowUpRight, Mail01 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import GitHub from "@/components/foundations/social-icons/github";
import { formatCareerDate, veteransAffairsName } from "@/lib/career";
import { Page, ResumeMenu } from "./chrome";
import { TraceChip, useTraceReady, useTraceState } from "./trace";
import { type Chapter, type Profile, type Project, caseStudyHref, evidenceSource, gitHubUrl, href, linkedInUrl, metricLabel, projectContext, projectDisplayName, projectVerb, roleEmail, toolKey } from "./shared";

const chapters: Chapter[] = [
  { id: "introduction", label: "Introduction" },
  { id: "work", label: "Selected work" },
  { id: "method", label: "How the work is checked" },
  { id: "career", label: "Career" },
  { id: "stack", label: "Stack" },
];

export function Home({ profile }: { profile: Profile }) {
  return (
    <Page chapters={chapters}>
      <Hero profile={profile} />
      <Facts profile={profile} />
      <WorkChapter profile={profile} />
      <MethodChapter profile={profile} />
      <CareerChapter profile={profile} />
      <StackChapter profile={profile} />
    </Page>
  );
}

/**
 * The poster. The name is the image: set across the blue plate at composition scale, with the claim, one line of
 * substance and the actions under it. No media, no cards; scale does the work.
 */
function Hero({ profile }: { profile: Profile }) {
  const [first, ...rest] = profile.name.split(" ");
  const publicSource = profile.projects.filter((project) => project.repository && project.repositoryVisibility === "public").length;
  return (
    <section className="hero plate" id="introduction" aria-labelledby="title-heading" data-anchor data-sc-act="kinetic">
      <div className="shell hero-inner">
        <h1 id="title-heading" className="hero-name"><span>{first}</span> <span>{rest.join(" ")}</span></h1>
        <div className="hero-copy">
          <p className="hero-claim">Built with the people who use it. <em>Tested before they do.</em></p>
          <div className="hero-side">
            <p className="hero-dek">{profile.headline}, {profile.experienceYears} years in software and quality engineering. I integrate APIs, build internal tools and automate release checks.</p>
            <div className="hero-actions">
              <Button size="xl" color="secondary" href="#work" iconTrailing={ArrowRight}>See the work</Button>
              <ResumeMenu variant="hero" />
              <Button size="xl" color="link-color" href={roleEmail} iconLeading={Mail01}>Email me</Button>
            </div>
            <p className="hero-elsewhere">Also on <a href={linkedInUrl}>LinkedIn</a> and <a href={gitHubUrl}>GitHub</a>, where {publicSource} of these projects have public source.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/** The facts a recruiter screens for first, in one ruled row under the poster. All read from the career record. */
function Facts({ profile }: { profile: Profile }) {
  const [current, ...earlier] = profile.experience;
  const degree = profile.education[0];
  const issuers = [...new Set(profile.verifiedCredentials.map((credential) => credential.issuer))];
  return (
    <section className="facts" aria-label="At a glance">
      <dl className="shell facts-list">
        {current && <div><dt>Now</dt><dd>{current.professionalTitle ?? current.title}, {current.employer}{current.customer && <>, for the {current.customer}</>}. Since {formatCareerDate(current.start)}.</dd></div>}
        {earlier.length > 0 && <div><dt>Before</dt><dd>{earlier.map((role) => `${role.title}, ${role.employer} (${role.start.slice(0, 4)} to ${role.end?.slice(0, 4)})`).join("; ")}.</dd></div>}
        {degree && <div><dt>Education</dt><dd>{degree.credential} in {degree.field}, {degree.institution}.</dd></div>}
        <div><dt>Credentials</dt><dd><a href={href("experience/#learning")}>{profile.verifiedCredentials.length} verified</a>, from {issuers.join(", ")}.</dd></div>
        <div><dt>Based in</dt><dd>{profile.location.replace(/\s+\d{5}(?:-\d{4})?$/, "")}. Open to Forward Deployed Engineer roles.</dd></div>
      </dl>
    </section>
  );
}

/** A section's heading. Large, left-set, with an optional standfirst; no numbers, because the order is not information. */
export function ChapterOpener({ title, id, children }: { title: string; id: string; children?: ReactNode }) {
  return (
    <header className="chapter-opener">
      <h2 id={id}>{title}</h2>
      {children && <div className="chapter-standfirst">{children}</div>}
    </header>
  );
}

/** The peak. Each project opens on its verb at poster scale, then the evidence: result, problem, role, tools, links. */
function WorkChapter({ profile }: { profile: Profile }) {
  return (
    <section className="chapter chapter-work" id="work" aria-labelledby="work-heading" data-anchor data-sc-act="reveal">
      <div className="shell">
        <ChapterOpener title="Selected work" id="work-heading">
          <p>{profile.projects.length} projects. Each says what was wrong, what I did, what changed, and where the evidence comes from: public source, a user report, or documented responsibilities. Press any tool to trace it through the work.</p>
        </ChapterOpener>
        <ProjectRegister projects={profile.projects} />
      </div>
      {profile.projects.map((project, index) => <ProjectSpread key={project.slug} project={project} number={index + 1} trail={index % 2 === 1} />)}
    </section>
  );
}

/** Every project on one line: verb, name, headline result. Jump links, so the whole chapter can be read here first. */
function ProjectRegister({ projects }: { projects: Project[] }) {
  return (
    <nav className="register" aria-label="Projects in this section">
      <ol>
        {projects.map((project, index) => (
          <li key={project.slug}>
            <a href={`#entry-${project.slug}`}>
              <span className="register-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <span className="register-name">{projectDisplayName(project)}<span className="register-context">{projectContext(project)}</span></span>
              {project.metric && <span className="register-result">{project.metric.value}</span>}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function ProjectSpread({ project, number, trail }: { project: Project; number: number; trail: boolean }) {
  const name = projectDisplayName(project);
  const publicSource = project.repository && project.repositoryVisibility === "public";
  const trace = useTraceState(project.technologies);
  return (
    <article className={trail ? "spread spread-trail" : "spread"} id={`entry-${project.slug}`} aria-labelledby={`entry-${project.slug}-title`} data-anchor data-trace={trace}>
      <div className="shell">
        <p className="spread-verb" aria-hidden="true">{projectVerb(project)}.</p>
        <div className="spread-grid">
          <header className="spread-head">
            <p className="spread-meta"><span className="spread-number">{String(number).padStart(2, "0")}</span>{projectContext(project)} · {project.period}</p>
            <h3 id={`entry-${project.slug}-title`}><a href={caseStudyHref(project)}>{name}</a></h3>
            <p className="spread-dek">{project.description}</p>
          </header>
          {project.metric && <div className="spread-result">
            <p className="spread-metric">{project.metric.value}</p>
            <p className="spread-metric-label">{metricLabel(project)}</p>
            <p className="evidence-tag"><span className="evidence-rule" aria-hidden="true" />Evidence: {evidenceSource(project)}</p>
          </div>}
          <div className="spread-body">
            <dl className="spread-schema">
              <div><dt>Problem</dt><dd>{project.challenge}</dd></div>
              <div><dt>My role</dt><dd>{project.role}</dd></div>
            </dl>
            <details className="spread-more">
              <summary>Decisions and evidence</summary>
              <dl className="spread-schema">
                <div><dt>Decisions</dt><dd><ul>{project.decisions.map((decision) => <li key={decision}>{decision}</li>)}</ul></dd></div>
                <div><dt>Evidence</dt><dd><ul>{project.evidence.map((item) => <li key={item.label}><strong>{item.label}.</strong> {item.detail}</li>)}</ul></dd></div>
              </dl>
            </details>
            <div className="spread-tools">
              <p className="label">Built with</p>
              <ul>{project.technologies.map((tool) => <li key={tool}><TraceChip name={tool} /></li>)}</ul>
            </div>
            <p className="spread-links">
              <Button color="link-color" size="lg" href={caseStudyHref(project)} iconTrailing={ArrowRight}>Read the case study<span className="sr-only">: {name}</span></Button>
              {publicSource && <Button color="link-gray" size="lg" href={project.repository!} iconLeading={GitHub} iconTrailing={ArrowUpRight}>Source<span className="sr-only"> code for {name} on GitHub</span></Button>}
            </p>
          </div>
          {project.slug === "claims-document-assistant" && <PipelineFigure />}
        </div>
      </div>
    </article>
  );
}

/**
 * The one drawn figure: how a claim moves through the Claims Document Assistant. Each stage restates the project
 * description in career.json. It is an ordered list, so it reads in order without CSS or motion.
 */
function PipelineFigure() {
  const stages = [
    ["Claim PDF", "Forms, cover letters and shorthand notes, in any layout."],
    ["Claude extracts", "17 fields into a fixed schema, returning null rather than guessing."],
    ["Rules check", "Fixed validation rules flag what is missing or invalid."],
    ["Reply drafted", "The status reply to the billing office is written for review."],
    ["A person approves", "Nothing is sent until a reviewer signs off."],
  ];
  return (
    <figure className="pipeline">
      <ol>
        {stages.map(([title, text]) => <li key={title}><strong>{title}</strong><span>{text}</span></li>)}
      </ol>
      <figcaption>How a claim moves through the Claims Document Assistant. Tested on 60 synthetic claims, with a 26-test suite.</figcaption>
    </figure>
  );
}

/** Quality strategy as five habits, each naming where I have done it. Lines restate career.json highlights. */
const methodStages = [
  { title: "Define done", text: "Requirements and acceptance criteria written with stakeholders before building, traceable to tests.", slug: "banking-risk-validation" },
  { title: "Build in small steps", text: "React and TypeScript features and internal tools, shown to the people who use them each release.", slug: "federal-quality-delivery-system" },
  { title: "Automate the checks", text: "Browser, API, visual and SSO login checks running together in GitHub Actions on AWS test environments.", slug: "ecommerce-feedback-platform" },
  { title: "Prove the release", text: "A Playwright smoke and regression framework on the VA claims platform; before that, smoke, regression and deployment checks across dev, QA, UAT and staging.", slug: "federal-quality-delivery-system" },
  { title: "Stay for adoption", text: "Versioned releases, a user guide and release notes, and support after the tool ships.", slug: "ccrs-test-data-tooling" },
];

/** Five lines at display scale; the one in the middle of the screen is at full ink, so the eye reads one at a time. */
function MethodChapter({ profile }: { profile: Profile }) {
  return (
    <section className="chapter chapter-method" id="method" aria-labelledby="method-heading" data-anchor data-sc-act="focus">
      <div className="shell">
        <ChapterOpener title="How the work is checked" id="method-heading">
          <p>I started in quality engineering, so testing is part of how I build, not a phase at the end. Five habits, each with the project where you can see it.</p>
        </ChapterOpener>
        <ol className="habits">
          {methodStages.map(({ title, text, slug }) => {
            const project = profile.projects.find((item) => item.slug === slug);
            return (
              <li key={title}>
                <h3>{title}</h3>
                <div>
                  <p>{text}</p>
                  {project && <a href={`#entry-${project.slug}`}>{projectDisplayName(project)}</a>}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

/** The industry each role served, as the site already states it: federal healthcare, e-commerce and banking. */
const roleDomains: Record<string, string> = {
  "booz-allen-hamilton": "Federal healthcare claims",
  "chick-fil-a": "E-commerce",
  "ally-bank": "Banking",
};

type Role = Profile["experience"][number];
const monthsBetween = (start: string, end: string) => {
  const [startYear, startMonth] = start.split("-").map(Number) as [number, number];
  const [endYear, endMonth] = end.split("-").map(Number) as [number, number];
  return Math.max(1, (endYear - startYear) * 12 + (endMonth - startMonth));
};
/** The record's own "as of" date ends the current role, so the prerendered page does not drift with the build clock. */
const roleMonths = (role: Role, asOf: string) => monthsBetween(role.start, role.end ?? asOf);
const tenure = (months: number) => {
  const years = Math.floor(months / 12);
  const rest = months % 12;
  return [years && `${years} yr${years > 1 ? "s" : ""}`, rest && `${rest} mo`].filter(Boolean).join(" ");
};

/**
 * The career at a glance: one bar from the first role to now, each role's segment as wide as its tenure.
 * A plain ordered list underneath, so it reads in order without CSS.
 */
function CareerSpan({ roles, asOf }: { roles: Role[]; asOf: string }) {
  const ordered = [...roles].reverse();
  const total = ordered.reduce((sum, role) => sum + roleMonths(role, asOf), 0);
  return (
    <ol className="career-span" aria-label="Career span, oldest role first">
      {ordered.map((role) => {
        const months = roleMonths(role, asOf);
        return (
          <li key={role.id} style={{ flexGrow: months, "--span": (months / total).toFixed(3) } as CSSProperties} className={role.end ? undefined : "career-span-current"}>
            <span className="career-span-bar" aria-hidden="true" />
            <strong>{role.employer}</strong>
            <span>{role.professionalTitle ?? role.title}</span>
            <span className="career-span-years">{role.start.slice(0, 4)} to {role.end ? role.end.slice(0, 4) : "now"} · {tenure(months)}</span>
          </li>
        );
      })}
    </ol>
  );
}

function CareerRole({ role, profile, detailed }: { role: Role; profile: Profile; detailed: boolean }) {
  const projects = profile.projects.filter((project) => project.experienceId === role.id);
  const stack = [...new Set(projects.flatMap((project) => project.technologies))];
  const trace = useTraceState(stack);
  return (
    <li className="role" data-anchor data-trace={trace}>
      <p className="role-year" aria-hidden="true">{role.start.slice(0, 4)}</p>
      <div className="role-body">
        <p className="role-dates"><time dateTime={role.start}>{formatCareerDate(role.start)}</time> to {role.end ? <time dateTime={role.end}>{formatCareerDate(role.end)}</time> : "present"} · {role.location}</p>
        <h3>{role.professionalTitle ?? role.title}, {role.employer}</h3>
        {role.customer && <p className="role-customer">End customer: {role.customer === veteransAffairsName ? <a href="https://en.wikipedia.org/wiki/United_States_Department_of_Veterans_Affairs">{role.customer}</a> : role.customer}</p>}
        <dl className="role-scope">
          <div><dt>Tenure</dt><dd>{tenure(roleMonths(role, profile.experienceAsOf))}</dd></div>
          {roleDomains[role.id] && <div><dt>Domain</dt><dd>{roleDomains[role.id]}</dd></div>}
          {stack.length > 0 && <div><dt>Stack in these projects</dt><dd>{stack.slice(0, 8).join(", ")}</dd></div>}
        </dl>
        <p className="role-summary">{role.summary}</p>
        <ul className="role-highlights">
          {(detailed ? role.highlights : role.highlights.slice(0, 3)).map((highlight) => <li key={highlight}>{highlight}</li>)}
        </ul>
        {!detailed && role.highlights.length > 3 && (
          <details className="role-more">
            <summary>{role.highlights.length - 3} more from this role</summary>
            <ul className="role-highlights">{role.highlights.slice(3).map((highlight) => <li key={highlight}>{highlight}</li>)}</ul>
          </details>
        )}
        {projects.length > 0 && <p className="role-projects">Projects: {projects.map((project, index) => <span key={project.slug}>{index > 0 && ", "}<a href={detailed ? caseStudyHref(project) : `#entry-${project.slug}`}>{projectDisplayName(project)}</a></span>)}</p>}
      </div>
    </li>
  );
}

/** The career, newest first, over the span bar. Shared with Experience, where every highlight shows. */
export function CareerChapter({ profile, detailed = false }: { profile: Profile; detailed?: boolean }) {
  return (
    <section className="chapter chapter-career" id={detailed ? "work-history" : "career"} aria-labelledby="career-heading" data-anchor data-sc-act="draw">
      <div className="shell">
        <ChapterOpener title={detailed ? "Work history" : "Career"} id="career-heading">
          <p>{profile.experienceYears} years with {new Set(profile.experience.map((role) => role.employer)).size} employers, in one direction: from checking software to building it with the people who use it.</p>
        </ChapterOpener>
        <CareerSpan roles={profile.experience} asOf={profile.experienceAsOf} />
        <ol className="roles">
          {profile.experience.map((role) => <CareerRole key={role.id} role={role} profile={profile} detailed={detailed} />)}
        </ol>
      </div>
    </section>
  );
}

/**
 * The stack as a wall of type: every tool from the projects and the skill record, set larger the more projects used it.
 * Each name is a trace control. Without JavaScript each name links to the projects that used it instead.
 */
function StackChapter({ profile }: { profile: Profile }) {
  const ready = useTraceReady();
  type Entry = { name: string; projects: Project[] };
  const entries = new Map<string, Entry>();
  const add = (name: string, project?: Project) => {
    const entry = entries.get(toolKey(name)) ?? { name, projects: [] };
    if (project && !entry.projects.includes(project)) entry.projects.push(project);
    entries.set(toolKey(name), entry);
  };
  profile.projects.forEach((project) => project.technologies.forEach((tool) => add(tool, project)));
  profile.skillGroups.forEach((group) => group.items.forEach((item) => add(item)));
  const sorted = [...entries.values()].sort((a, b) => a.name.localeCompare(b.name));
  const used = sorted.filter((entry) => entry.projects.length).length;
  return (
    <section className="chapter chapter-stack" id="stack" aria-labelledby="stack-heading" data-anchor data-sc-act="trace">
      <div className="shell">
        <ChapterOpener title="Stack" id="stack-heading">
          <p>{sorted.length} tools and skills; {used} of them appear in the projects above, set larger the more projects used them. Press one to trace it through the work. The <a href={href("experience/#engineering-toolkit")}>full toolkit</a> groups them by area.</p>
        </ChapterOpener>
        <ul className="stack-wall">
          {sorted.map(({ name, projects }) => (
            <li key={name} data-weight={Math.min(projects.length, 3)}>
              <TraceChip name={name} weight={Math.min(projects.length, 3)} />
              {!ready && projects.map((project) => <a key={project.slug} className="stack-ref" href={`#entry-${project.slug}`}>{String(profile.projects.indexOf(project) + 1).padStart(2, "0")}<span className="sr-only">, {projectDisplayName(project)}</span></a>)}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
