import type { CSSProperties, ReactNode } from "react";
import { ArrowRight, ArrowUpRight, Mail01 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import GitHub from "@/components/foundations/social-icons/github";
import { formatCareerDate, veteransAffairsName } from "@/lib/career";
import { Page, ResumeMenu } from "./chrome";
import { GeneratorDemo, RulesDemo } from "./demos";
import { type Evidence, Fact, InspectToggle } from "./inspect";
import { type Chapter, type Profile, type Project, type Role, caseStudyHref, evidenceSource, gitHubUrl, href, linkedInUrl, metricLabel, projectContext, projectDisplayName, projectNumber, roleEmail, toolKey } from "./shared";

const chapters: Chapter[] = [
  { id: "introduction", label: "Overview" },
  { id: "work", label: "Work" },
  { id: "practice", label: "How I work" },
  { id: "career", label: "Career" },
  { id: "stack", label: "Stack" },
];

export function Home({ profile }: { profile: Profile }) {
  return (
    <Page chapters={chapters}>
      <Overview profile={profile} />
      <WorkSection profile={profile} />
      <Practice profile={profile} />
      <CareerSection profile={profile} />
      <StackSection profile={profile} />
    </Page>
  );
}

/** A section's heading and standfirst. Moderate scale: on a working surface the content carries the page, not the titles. */
export function SectionHead({ title, id, children }: { title: string; id: string; children?: ReactNode }) {
  return (
    <header className="sec-head">
      <h2 id={id}>{title}</h2>
      {children && <div className="sec-stand">{children}</div>}
    </header>
  );
}

const projectEvidence = (project: Project) => evidenceSource(project) as Evidence;

/**
 * The first screen is the surface already in a state: who this is, what he does, the three actions, and the profile
 * record open beside it. Every fact in the panel is rendered from the career record and can be inspected.
 */
function Overview({ profile }: { profile: Profile }) {
  const [current, ...earlier] = profile.experience;
  const degree = profile.education[0];
  const issuers = [...new Set(profile.verifiedCredentials.map((credential) => credential.issuer))];
  const publicSource = profile.projects.filter((project) => project.repository && project.repositoryVisibility === "public").length;
  const city = profile.location.replace(/\s+\d{5}(?:-\d{4})?$/, "");
  return (
    <section className="sec overview" id="introduction" aria-labelledby="title-heading" data-sc-act="surface">
      <div className="wb-container overview-grid">
        <div className="overview-intro">
          <p className="overview-status"><span aria-hidden="true" />Open to Forward Deployed Engineer roles · <Fact path="profile.location" evidence="Career record">{city}</Fact></p>
          <h1 id="title-heading">{profile.name}</h1>
          <p className="overview-claim">Built with the people who use it. Tested before they do.</p>
          <p className="overview-dek">
            <Fact path="profile.headline · profile.experienceYears" evidence="Career record">{profile.headline}, {profile.experienceYears} years in software and quality engineering.</Fact>{" "}
            I integrate APIs, build internal tools, and automate the checks that decide a release.
          </p>
          <div className="overview-actions">
            <Button size="lg" href={roleEmail} iconLeading={Mail01}>Email me</Button>
            <ResumeMenu variant="hero" />
            <Button size="lg" color="link-color" href="#work" iconTrailing={ArrowRight}>See the work</Button>
          </div>
          <p className="overview-elsewhere">Also on <a href={linkedInUrl}>LinkedIn</a> and <a href={gitHubUrl}>GitHub</a>, where {publicSource} of these projects have public source.</p>
        </div>
        <div className="panel profile-panel" aria-labelledby="profile-title">
          <div className="panel-head">
            <h2 id="profile-title" className="panel-title">Profile</h2>
            <code>career.json</code>
          </div>
          <dl className="props">
            {current && <div><dt>Now</dt><Fact as="dd" path={`experience.${current.id}`} evidence="Career record">{current.professionalTitle ?? current.title}, {current.employer}{current.customer && <>, for the {current.customer.replace(veteransAffairsName, "VA")}</>}. Since {formatCareerDate(current.start)}.</Fact></div>}
            {earlier.map((role) => <div key={role.id}><dt>{role.start.slice(0, 4)} to {role.end?.slice(0, 4)}</dt><Fact as="dd" path={`experience.${role.id}`} evidence="Career record">{role.title}, {role.employer}</Fact></div>)}
            {degree && <div><dt>Education</dt><Fact as="dd" path="education[0]" evidence="Career record">{degree.credential} in {degree.field}</Fact></div>}
            <div><dt>Credentials</dt><Fact as="dd" path="verifiedCredentials" evidence="Verified credential"><a href={href("experience/#learning")}>{profile.verifiedCredentials.length} verified</a>, from {issuers.join(", ")}</Fact></div>
          </dl>
          <div className="panel-foot">
            <p>Every fact on this site is rendered from one career record. See where each one comes from.</p>
            <InspectToggle />
          </div>
        </div>
      </div>
    </section>
  );
}

/** The work: an index of all six projects, then one document per project. */
function WorkSection({ profile }: { profile: Profile }) {
  return (
    <section className="sec" id="work" aria-labelledby="work-heading" data-sc-act="index">
      <div className="wb-container">
        <SectionHead title="Work" id="work-heading">
          <p>{profile.projects.length} projects. Each says what was wrong, what I did, what changed, and how you can check it: public source, a user report, or a documented responsibility.</p>
        </SectionHead>
        <WorkIndex projects={profile.projects} />
        <div className="docs">
          {profile.projects.map((project) => <ProjectDoc key={project.slug} project={project} />)}
        </div>
      </div>
    </section>
  );
}

function WorkIndex({ projects }: { projects: Project[] }) {
  return (
    <div className="panel index-panel">
      <table className="index-table">
        <caption className="sr-only">All projects, with the headline result and where its evidence comes from</caption>
        <thead>
          <tr><th scope="col"><span className="sr-only">Number</span></th><th scope="col">Project</th><th scope="col">Result</th><th scope="col">Evidence</th></tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={project.slug}>
              <td className="index-number">{projectNumber(project)}</td>
              <th scope="row"><a href={`#entry-${project.slug}`}>{projectDisplayName(project)}</a><span>{projectContext(project)}</span></th>
              <td className="index-result">{project.metric?.value}</td>
              <td><span className="evidence-chip" data-evidence={projectEvidence(project)}>{projectEvidence(project)}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProjectDoc({ project }: { project: Project }) {
  const name = projectDisplayName(project);
  const publicSource = project.repository && project.repositoryVisibility === "public";
  const evidence = projectEvidence(project);
  const path = (field: string) => `projects.${project.slug}.${field}`;
  const steps = project.approach.slice(0, 3);
  const more = project.approach.slice(3);
  return (
    <article className="doc" id={`entry-${project.slug}`} aria-labelledby={`entry-${project.slug}-title`} data-sc-act="document">
      <header className="doc-head">
        <p className="doc-path"><code>work/{projectNumber(project)}</code><span>{project.period}</span></p>
        <h3 id={`entry-${project.slug}-title`}><a href={caseStudyHref(project)}>{name}</a></h3>
        <Fact as="p" className="doc-dek" path={path("description")} evidence={evidence}>{project.description}</Fact>
      </header>
      <div className="doc-grid">
        <div className="doc-body">
          <div className="doc-part">
            <h4>Problem</h4>
            <Fact as="p" path={path("challenge")} evidence={evidence}>{project.challenge}</Fact>
          </div>
          <div className="doc-part">
            <h4>What I did</h4>
            <ol className="doc-steps">{steps.map((step) => <li key={step}>{step}</li>)}</ol>
            <details className="doc-more">
              <summary>{more.length ? `${more.length} more steps, decisions and evidence` : "Decisions and evidence"}</summary>
              {more.length > 0 && <ol className="doc-steps" start={4}>{more.map((step) => <li key={step}>{step}</li>)}</ol>}
              <h5>Decisions</h5>
              <ul className="doc-list">{project.decisions.map((decision) => <li key={decision}>{decision}</li>)}</ul>
              <h5>Evidence</h5>
              <ul className="doc-list">{project.evidence.map((item) => <li key={item.label}><strong>{item.href ? <a href={item.href}>{item.label}</a> : item.label}.</strong> {item.detail}</li>)}</ul>
            </details>
          </div>
          {project.slug === "claims-document-assistant" && <><PipelineFigure /><RulesDemo /></>}
          {project.slug === "ccrs-test-data-tooling" && <GeneratorDemo />}
        </div>
        <aside className="doc-props" aria-label={`${name}: facts`}><div className="doc-props-inner">
          {project.metric && (
            <div className="doc-result">
              <Fact as="strong" path={path("metric.value")} evidence={evidence}>{project.metric.value}</Fact>
              <p>{metricLabel(project)}</p>
            </div>
          )}
          <dl className="props">
            <div><dt>Role</dt><Fact as="dd" path={path("role")} evidence={evidence}>{project.role}</Fact></div>
            <div><dt>Where</dt><dd>{projectContext(project)}</dd></div>
            <div><dt>Evidence</dt><dd><span className="evidence-chip" data-evidence={evidence}>{evidence}</span></dd></div>
          </dl>
          <div className="doc-tools">
            <p className="props-label">Built with</p>
            <ul className="tags">{project.technologies.map((tool) => <li key={tool}>{tool}</li>)}</ul>
          </div>
          <p className="doc-links">
            <Button color="link-color" size="md" href={caseStudyHref(project)} iconTrailing={ArrowRight}>Case study<span className="sr-only">: {name}</span></Button>
            {publicSource && <Button color="link-gray" size="md" href={project.repository!} iconLeading={GitHub} iconTrailing={ArrowUpRight}>Source<span className="sr-only"> code for {name} on GitHub</span></Button>}
          </p>
        </div></aside>
      </div>
    </article>
  );
}

/**
 * How a claim moves through the Claims Document Assistant. Each stage restates the project description in
 * career.json. It is an ordered list, so it reads in order without CSS or motion.
 */
export function PipelineFigure() {
  const stages = [
    ["Claim PDF", "Forms, cover letters and shorthand notes, in any layout."],
    ["Claude extracts", "17 fields into a fixed schema, returning null rather than guessing."],
    ["Rules check", "Fixed validation rules flag what is missing or invalid."],
    ["Reply drafted", "The status reply to the billing office is written for review."],
    ["A person approves", "Nothing is sent until a reviewer signs off."],
  ];
  return (
    <figure className="flow">
      <ol>
        {stages.map(([title, text]) => <li key={title}><strong>{title}</strong><span>{text}</span></li>)}
      </ol>
      <figcaption>How a claim moves through the assistant. The model extracts and drafts; rules and a person decide.</figcaption>
    </figure>
  );
}

/** Quality strategy as five stages, each naming where I have done it. Lines restate career.json highlights. */
const practiceStages = [
  { title: "Define done", text: "Requirements and acceptance criteria written with stakeholders before building, traceable to tests.", slug: "banking-risk-validation" },
  { title: "Build in small steps", text: "React and TypeScript features and internal tools, shown to the people who use them each release.", slug: "federal-quality-delivery-system" },
  { title: "Automate the checks", text: "Browser, API, visual and SSO login checks running together in GitHub Actions on AWS test environments.", slug: "ecommerce-feedback-platform" },
  { title: "Prove the release", text: "A Playwright smoke and regression framework on the VA claims platform; before that, smoke, regression and deployment checks across dev, QA, UAT and staging.", slug: "federal-quality-delivery-system" },
  { title: "Stay for adoption", text: "Versioned releases, a user guide and release notes, and support after the tool ships.", slug: "ccrs-test-data-tooling" },
];

/** The practice drawn as a pipeline: five stages in order, each linked to the project where it shows. */
function Practice({ profile }: { profile: Profile }) {
  return (
    <section className="sec" id="practice" aria-labelledby="practice-heading" data-sc-act="pipeline">
      <div className="wb-container">
        <SectionHead title="How I work" id="practice-heading">
          <p>I started in quality engineering, so testing is part of how I build, not a phase at the end. The same five stages run through every project.</p>
        </SectionHead>
        <ol className="pipeline">
          {practiceStages.map(({ title, text, slug }) => {
            const project = profile.projects.find((item) => item.slug === slug)!;
            return (
              <li key={title}>
                <h3>{title}</h3>
                <Fact as="p" path={`projects.${slug}.approach`} evidence={projectEvidence(project)}>{text}</Fact>
                <a href={`#entry-${project.slug}`}><span className="sr-only">Seen in </span>{projectDisplayName(project)}</a>
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

const monthIndex = (value: string) => {
  const [year, month] = value.split("-").map(Number) as [number, number];
  return year * 12 + (month - 1);
};
const tenure = (months: number) => {
  const years = Math.floor(months / 12);
  const rest = months % 12;
  return [years && `${years} yr${years > 1 ? "s" : ""}`, rest && `${rest} mo`].filter(Boolean).join(" ");
};

/**
 * The career on one time axis: each role's bar starts at its start month and is as long as its tenure. The record's
 * own "as of" date ends the current role, so the prerendered chart does not drift with the build clock.
 */
function Timeline({ roles, asOf }: { roles: Role[]; asOf: string }) {
  const ordered = [...roles].reverse();
  const origin = monthIndex(`${ordered[0]!.start.slice(0, 4)}-01`);
  const end = monthIndex(asOf) + 1;
  const years = Array.from({ length: Math.floor((end - 1) / 12) - Math.floor(origin / 12) + 1 }, (_, index) => Math.floor(origin / 12) + index);
  return (
    <figure className="timeline">
      <ol className="timeline-lanes">
        {ordered.map((role) => {
          const start = monthIndex(role.start);
          const stop = role.end ? monthIndex(role.end) : end;
          const style = { "--from": ((start - origin) / (end - origin)).toFixed(4), "--span": ((stop - start) / (end - origin)).toFixed(4) } as CSSProperties;
          return (
            <li key={role.id} style={style} data-current={!role.end || undefined}>
              <span className="timeline-bar" aria-hidden="true" />
              <span className="timeline-label"><strong>{role.employer}</strong> {role.start.slice(0, 4)} to {role.end ? role.end.slice(0, 4) : "now"}, {tenure(stop - start)}</span>
            </li>
          );
        })}
      </ol>
      <div className="timeline-axis" aria-hidden="true">
        {years.map((year) => <span key={year} style={{ "--at": ((year * 12 - origin) / (end - origin)).toFixed(4) } as CSSProperties}>{year}</span>)}
      </div>
      <figcaption className="sr-only">Career timeline, oldest role first.</figcaption>
    </figure>
  );
}

function CareerRole({ role, profile, detailed }: { role: Role; profile: Profile; detailed: boolean }) {
  const projects = profile.projects.filter((project) => project.experienceId === role.id);
  const months = (role.end ? monthIndex(role.end) : monthIndex(profile.experienceAsOf) + 1) - monthIndex(role.start);
  return (
    <li className="role">
      <div className="role-when">
        <p><time dateTime={role.start}>{formatCareerDate(role.start)}</time> to {role.end ? <time dateTime={role.end}>{formatCareerDate(role.end)}</time> : "present"}</p>
        <p>{tenure(months)} · {role.location}</p>
      </div>
      <div className="role-body">
        <Fact as="div" path={`experience.${role.id}.title`} evidence="Career record" className="role-title"><h3>{role.professionalTitle ?? role.title}, {role.employer}</h3></Fact>
        <p className="role-meta">
          {roleDomains[role.id]}
          {role.customer && <> · End customer: {role.customer === veteransAffairsName ? <a href="https://en.wikipedia.org/wiki/United_States_Department_of_Veterans_Affairs">{role.customer}</a> : role.customer}</>}
        </p>
        <p className="role-summary">{role.summary}</p>
        <ul className="role-highlights">
          {(detailed ? role.highlights : role.highlights.slice(0, 3)).map((highlight) => <li key={highlight}>{highlight}</li>)}
        </ul>
        {!detailed && role.highlights.length > 3 && (
          <details className="doc-more">
            <summary>{role.highlights.length - 3} more from this role</summary>
            <ul className="role-highlights">{role.highlights.slice(3).map((highlight) => <li key={highlight}>{highlight}</li>)}</ul>
          </details>
        )}
        {projects.length > 0 && <p className="role-projects">Projects: {projects.map((project, index) => <span key={project.slug}>{index > 0 && ", "}<a href={detailed ? caseStudyHref(project) : `#entry-${project.slug}`}>{projectDisplayName(project)}</a></span>)}</p>}
      </div>
    </li>
  );
}

/** The career, newest first, under the timeline. Shared with Experience, where every highlight shows. */
export function CareerSection({ profile, detailed = false }: { profile: Profile; detailed?: boolean }) {
  return (
    <section className="sec" id={detailed ? "work-history" : "career"} aria-labelledby="career-heading" data-sc-act="timeline">
      <div className="wb-container">
        <SectionHead title={detailed ? "Work history" : "Career"} id="career-heading">
          <p>{profile.experienceYears} years with {new Set(profile.experience.map((role) => role.employer)).size} employers, in one direction: from checking software to building it with the people who use it.</p>
        </SectionHead>
        <Timeline roles={profile.experience} asOf={profile.experienceAsOf} />
        <ol className="roles">
          {profile.experience.map((role) => <CareerRole key={role.id} role={role} profile={profile} detailed={detailed} />)}
        </ol>
      </div>
    </section>
  );
}

/**
 * The stack as a matrix: every tool a project names, against the six projects, so you can see what was used where.
 * Computed from `technologies` in the career record. Skills in the record that no project names are listed after it.
 */
function StackSection({ profile }: { profile: Profile }) {
  type Entry = { name: string; projects: Set<string> };
  const entries = new Map<string, Entry>();
  profile.projects.forEach((project) => project.technologies.forEach((tool) => {
    const entry = entries.get(toolKey(tool)) ?? { name: tool, projects: new Set<string>() };
    entry.projects.add(project.slug);
    entries.set(toolKey(tool), entry);
  }));
  const rows = [...entries.values()].sort((a, b) => b.projects.size - a.projects.size || a.name.localeCompare(b.name));
  const others = profile.skillGroups.map((group) => ({ label: group.label, items: group.items.filter((item) => !entries.has(toolKey(item))) })).filter((group) => group.items.length);
  return (
    <section className="sec" id="stack" aria-labelledby="stack-heading" data-sc-act="matrix">
      <div className="wb-container">
        <SectionHead title="Stack" id="stack-heading">
          <p>{rows.length} tools named by the projects, against the projects that used them, most used first. The <a href={href("experience/#engineering-toolkit")}>full toolkit</a> groups every skill by area.</p>
        </SectionHead>
        <div className="stack-grid">
          <div className="panel matrix-panel" role="region" aria-label="Tools by project" tabIndex={0}>
            <table className="matrix">
              <caption className="sr-only">Tools used in each project. Columns are the six projects, numbered as in the work index.</caption>
              <thead>
                <tr>
                  <th scope="col">Tool</th>
                  {profile.projects.map((project) => <th scope="col" key={project.slug}><a href={`#entry-${project.slug}`} title={projectDisplayName(project)}><span aria-hidden="true">{projectNumber(project)}</span><span className="sr-only">{projectDisplayName(project)}</span></a></th>)}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.name}>
                    <th scope="row">{row.name}</th>
                    {profile.projects.map((project) => (
                      <td key={project.slug} data-used={row.projects.has(project.slug) || undefined}>
                        {row.projects.has(project.slug) ? <><span className="matrix-dot" aria-hidden="true" /><span className="sr-only">Used</span></> : <span className="sr-only">Not used</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="stack-more">
            <h3>Also in the toolkit</h3>
            {others.map((group) => (
              <div key={group.label}>
                <p className="props-label">{group.label}</p>
                <ul className="tags">{group.items.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
            ))}
            <ol className="matrix-key">
              {profile.projects.map((project) => <li key={project.slug}><span>{projectNumber(project)}</span><a href={`#entry-${project.slug}`}>{projectDisplayName(project)}</a></li>)}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
