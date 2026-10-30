import type { CSSProperties, ReactNode } from "react";
import { ArrowRight, ArrowUpRight, Mail01 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import GitHub from "@/components/foundations/social-icons/github";
import { formatCareerDate, veteransAffairsName } from "@/lib/career";
import { DepthNote, Page, ResumeMenu } from "./chrome";
import { type Chapter, type Profile, type Project, caseStudyHref, evidenceSource, href, metricLabel, projectContext, projectDisplayName, roleEmail } from "./shared";

const chapters: Chapter[] = [
  { id: "introduction", label: "Introduction" },
  { id: "work", label: "The work" },
  { id: "method", label: "How the work is checked" },
  { id: "career", label: "Career" },
  { id: "index", label: "Index of tools" },
];

export function Home({ profile }: { profile: Profile }) {
  return (
    <Page chapters={chapters}>
      <TitlePage profile={profile} />
      <WorkChapter profile={profile} />
      <MethodChapter profile={profile} />
      <CareerChapter profile={profile} number={3} />
      <ToolIndex profile={profile} />
    </Page>
  );
}

/** The hero is a title page: type on the paper ground, no media, four text elements, then the imprint below it. */
function TitlePage({ profile }: { profile: Profile }) {
  return (
    <section className="title-page" id="introduction" aria-labelledby="title-heading" data-anchor data-sc-act="in">
      <p className="title-kicker">{profile.headline} · {profile.experienceYears} years in software development and quality engineering</p>
      <h1 id="title-heading">Built with the people who use it. <em>Tested before they do.</em></h1>
      <p className="title-dek">I integrate APIs, build internal tools and automate release checks, across federal healthcare, banking and e-commerce.</p>
      <div className="title-actions">
        <Button size="xl" href="#work" iconTrailing={ArrowRight}>See the work</Button>
        <ResumeMenu variant="hero" />
        <Button size="xl" color="link-color" href={roleEmail} iconLeading={Mail01}>Email me</Button>
      </div>
      <Imprint profile={profile} />
      <DepthNote />
    </section>
  );
}

/** The facts a recruiter screens for first, typeset like a book's imprint page. All read from the career record. */
function Imprint({ profile }: { profile: Profile }) {
  const [current, ...earlier] = profile.experience;
  const degree = profile.education[0];
  const issuers = [...new Set(profile.verifiedCredentials.map((credential) => credential.issuer))];
  return (
    <dl className="imprint">
      {current && <div><dt>Now</dt><dd>{current.professionalTitle ?? current.title}, {current.employer}{current.customer && <>, for the {current.customer}</>}. Since {formatCareerDate(current.start)}.</dd></div>}
      {earlier.length > 0 && <div><dt>Before</dt><dd>{earlier.map((role) => `${role.title}, ${role.employer} (${role.start.slice(0, 4)} to ${role.end?.slice(0, 4)})`).join("; ")}.</dd></div>}
      {degree && <div><dt>Education</dt><dd>{degree.credential} in {degree.field}, {degree.institution}.</dd></div>}
      <div><dt>Credentials</dt><dd><a href={href("experience/#learning")}>{profile.verifiedCredentials.length} verified</a>, from {issuers.join(", ")}.</dd></div>
      <div><dt>Based in</dt><dd>{profile.location.replace(/\s+\d{5}(?:-\d{4})?$/, "")}. Open to Forward Deployed Engineer roles.</dd></div>
    </dl>
  );
}

export function ChapterOpener({ number, title, id, children }: { number: number; title: string; id: string; children?: ReactNode }) {
  return (
    <header className="chapter-opener">
      <p className="chapter-number" aria-hidden="true">{number}</p>
      <h2 id={id}>{title}</h2>
      {children && <div className="chapter-standfirst">{children}</div>}
    </header>
  );
}

/** The peak. The first three projects open as spreads; the rest follow as a ruled list with the same label schema. */
function WorkChapter({ profile }: { profile: Profile }) {
  const featured = profile.projects.slice(0, 3);
  const more = profile.projects.slice(3);
  return (
    <section className="chapter chapter-work" id="work" aria-labelledby="work-heading" data-anchor data-sc-act="reveal">
      <ChapterOpener number={1} title="The work" id="work-heading">
        <p>{profile.projects.length} projects. Each says what was wrong, what I did, what changed, and where the evidence comes from: public source, a user report, or documented responsibilities.</p>
      </ChapterOpener>
      <ProjectRegister projects={profile.projects} />
      {featured.map((project, index) => <ProjectEntry key={project.slug} project={project} number={`1.${index + 1}`} layout={index === 1 ? "trail" : "lead"} />)}
      <div className="entry-list">
        <h3 className="entry-list-heading">Also in this chapter</h3>
        {more.map((project, index) => <ProjectEntry key={project.slug} project={project} number={`1.${index + 4}`} layout="row" />)}
      </div>
    </section>
  );
}

/**
 * The chapter's register: every project on one line (number, name, who it was for, headline result), each a jump
 * link to its entry. A recruiter can read the whole chapter here at Skim depth, and it works without JavaScript.
 */
function ProjectRegister({ projects }: { projects: Project[] }) {
  return (
    <nav className="register" aria-label="Projects in this chapter">
      <ol>
        {projects.map((project, index) => (
          <li key={project.slug}>
            <a href={`#entry-${project.slug}`}>
              <span className="register-number" aria-hidden="true">1.{index + 1}</span>
              <span className="register-name">{projectDisplayName(project)}<span className="register-context">{projectContext(project)}</span></span>
              {project.metric && <span className="register-result">{project.metric.value}</span>}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function ProjectEntry({ project, number, layout }: { project: Project; number: string; layout: "lead" | "trail" | "row" }) {
  const name = projectDisplayName(project);
  const publicSource = project.repository && project.repositoryVisibility === "public";
  return (
    <article className={`entry entry-${layout}`} id={`entry-${project.slug}`} aria-labelledby={`entry-${project.slug}-title`} data-anchor>
      <header className="entry-header">
        <p className="entry-meta"><span className="entry-number">{number}</span>{projectContext(project)} · {project.period}</p>
        <h3 id={`entry-${project.slug}-title`}><a href={caseStudyHref(project)}>{name}</a></h3>
      </header>
      {project.metric && <div className="entry-result">
        <p className="entry-metric">{project.metric.value}</p>
        <p className="entry-metric-label">{metricLabel(project)}</p>
        <p className="evidence-tag"><span className="evidence-rule" aria-hidden="true" />Evidence: {evidenceSource(project)}</p>
      </div>}
      <dl className="entry-schema">
        <div data-detail="standard"><dt>Problem</dt><dd>{project.challenge}</dd></div>
        <div data-detail="standard"><dt>What I did</dt><dd>{project.description}</dd></div>
        <div data-detail="standard"><dt>My role</dt><dd>{project.role}</dd></div>
        <div data-detail="full"><dt>Decisions</dt><dd><ul>{project.decisions.map((decision) => <li key={decision}>{decision}</li>)}</ul></dd></div>
        <div data-detail="full"><dt>Evidence</dt><dd><ul>{project.evidence.map((item) => <li key={item.label}><strong>{item.label}.</strong> {item.detail}</li>)}</ul></dd></div>
        <div><dt>Built with</dt><dd>{project.technologies.join(", ")}</dd></div>
      </dl>
      {project.slug === "claims-document-assistant" && <PipelineFigure />}
      <p className="entry-links">
        <Button color="link-color" href={caseStudyHref(project)} iconTrailing={ArrowRight}>Read the case study<span className="sr-only">: {name}</span></Button>
        {publicSource && <Button color="link-gray" href={project.repository!} iconLeading={GitHub} iconTrailing={ArrowUpRight}>Source<span className="sr-only"> code for {name} on GitHub</span></Button>}
      </p>
    </article>
  );
}

/**
 * Figure 1, the drawn moment at the peak: how a claim moves through the Claims Document Assistant. Each stage restates
 * the project description in career.json. It is an ordered list, so it reads in order without CSS or motion.
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
    <figure className="pipeline" data-detail="standard">
      <ol>
        {stages.map(([title, text]) => <li key={title}><strong>{title}</strong><span>{text}</span></li>)}
      </ol>
      <figcaption>Figure 1. How a claim moves through the Claims Document Assistant. Tested on 60 synthetic claims, with a 26-test suite.</figcaption>
    </figure>
  );
}

/** Quality strategy as one ruled row: each stage names where I have done it. Lines restate career.json highlights. */
const methodStages = [
  { title: "Define done", text: "Requirements and acceptance criteria written with stakeholders before building, traceable to tests.", slug: "banking-risk-validation" },
  { title: "Build in small steps", text: "React and TypeScript features and internal tools, shown to the people who use them each release.", slug: "federal-quality-delivery-system" },
  { title: "Automate the checks", text: "Browser, API, visual and SSO login checks running together in GitHub Actions on AWS test environments.", slug: "ecommerce-feedback-platform" },
  { title: "Prove the release", text: "A Playwright smoke and regression framework on the VA claims platform; before that, smoke, regression and deployment checks across dev, QA, UAT and staging.", slug: "federal-quality-delivery-system" },
  { title: "Stay for adoption", text: "Versioned releases, a user guide and release notes, and support after the tool ships.", slug: "ccrs-test-data-tooling" },
];

function MethodChapter({ profile }: { profile: Profile }) {
  return (
    <section className="chapter chapter-method" id="method" aria-labelledby="method-heading" data-anchor data-sc-act="flow">
      <ChapterOpener number={2} title="How the work is checked" id="method-heading">
        <p>I started in quality engineering, so testing is part of how I build, not a phase at the end. Five habits, each with the project where you can see it.</p>
      </ChapterOpener>
      <ol className="method-row">
        {methodStages.map(({ title, text, slug }) => {
          const project = profile.projects.find((item) => item.slug === slug);
          return (
            <li key={title}>
              <h3>{title}</h3>
              <p data-detail="standard">{text}</p>
              {project && <a href={caseStudyHref(project)}>{projectDisplayName(project)}</a>}
            </li>
          );
        })}
      </ol>
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

/** The career, newest first. Large years drift in the margin; scope widens from role to role. Shared with Experience. */
export function CareerChapter({ profile, number, detailed = false }: { profile: Profile; number: number; detailed?: boolean }) {
  return (
    <section className="chapter chapter-career" id={detailed ? "work-history" : "career"} aria-labelledby="career-heading" data-anchor data-sc-act="parallax">
      <ChapterOpener number={number} title={detailed ? "Work history" : "Career"} id="career-heading">
        <p>{profile.experienceYears} years with {new Set(profile.experience.map((role) => role.employer)).size} employers, in one direction: from checking software to building it with the people who use it.</p>
      </ChapterOpener>
      <CareerSpan roles={profile.experience} asOf={profile.experienceAsOf} />
      <ol className="roles">
        {profile.experience.map((role) => {
          const projects = profile.projects.filter((project) => project.experienceId === role.id);
          const stack = [...new Set(projects.flatMap((project) => project.technologies))].slice(0, 8);
          return (
            <li key={role.id} className="role" data-anchor>
              <p className="role-year" aria-hidden="true">{role.start.slice(0, 4)}</p>
              <div className="role-body">
                <p className="role-dates"><time dateTime={role.start}>{formatCareerDate(role.start)}</time> to {role.end ? <time dateTime={role.end}>{formatCareerDate(role.end)}</time> : "present"} · {role.location}</p>
                <h3>{role.professionalTitle ?? role.title}, {role.employer}</h3>
                {role.customer && <p className="role-customer">End customer: {role.customer === veteransAffairsName ? <a href="https://en.wikipedia.org/wiki/United_States_Department_of_Veterans_Affairs">{role.customer}</a> : role.customer}</p>}
                <dl className="role-scope">
                  <div><dt>Tenure</dt><dd>{tenure(roleMonths(role, profile.experienceAsOf))}</dd></div>
                  {roleDomains[role.id] && <div><dt>Domain</dt><dd>{roleDomains[role.id]}</dd></div>}
                  {stack.length > 0 && <div><dt>Stack in these projects</dt><dd>{stack.join(", ")}</dd></div>}
                </dl>
                <p className="role-summary">{role.summary}</p>
                <ul className="role-highlights">
                  {role.highlights.map((highlight, index) => <li key={highlight} data-detail={index < 3 && !detailed ? "standard" : "full"}>{highlight}</li>)}
                </ul>
                {projects.length > 0 && <p className="role-projects">Projects: {projects.map((project, index) => <span key={project.slug}>{index > 0 && ", "}<a href={caseStudyHref(project)}>{projectDisplayName(project)}</a></span>)}</p>}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/**
 * A back-of-book index. Every tool named in a project links to the entries that used it, so "where did he use
 * Playwright" has an answer one click away. Skills from the record that no project names appear at full depth.
 */
function ToolIndex({ profile }: { profile: Profile }) {
  type Entry = { name: string; refs: { number: string; project: Project }[] };
  const entries = new Map<string, Entry>();
  const add = (name: string, ref?: { number: string; project: Project }) => {
    const key = name.toLowerCase();
    const entry = entries.get(key) ?? { name, refs: [] };
    if (ref && !entry.refs.some((item) => item.project.slug === ref.project.slug)) entry.refs.push(ref);
    entries.set(key, entry);
  };
  profile.projects.forEach((project, index) => project.technologies.forEach((tool) => add(tool, { number: `1.${index + 1}`, project })));
  profile.skillGroups.forEach((group) => group.items.forEach((item) => add(item)));
  const letters = [...entries.values()].sort((a, b) => a.name.localeCompare(b.name)).reduce<Map<string, Entry[]>>((groups, entry) => {
    const letter = /[a-z]/i.test(entry.name[0]!) ? entry.name[0]!.toUpperCase() : "#";
    return groups.set(letter, [...(groups.get(letter) ?? []), entry]);
  }, new Map());
  return (
    <section className="chapter chapter-index" id="index" aria-labelledby="index-heading" data-anchor data-sc-act="in">
      <ChapterOpener number={4} title="Index of tools" id="index-heading">
        <p>Every tool, with the projects that used it. The <a href={href("experience/#engineering-toolkit")}>full toolkit</a> on the Experience page groups them by area.</p>
      </ChapterOpener>
      <div className="tool-index">
        {[...letters].map(([letter, items]) => (
          <div key={letter} className="tool-index-group" data-detail={items.every((item) => !item.refs.length) ? "full" : undefined}>
            <h3>{letter}</h3>
            <ul>
              {items.map(({ name, refs }) => (
                <li key={name} data-detail={refs.length ? undefined : "full"}>
                  {name}
                  {refs.map(({ number, project }) => <a key={project.slug} href={`#entry-${project.slug}`}>{number}<span className="sr-only">, {projectDisplayName(project)}</span></a>)}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
