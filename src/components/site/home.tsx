import { loop } from "@/content/diffs";
import { formatCareerDate } from "@/lib/career";
import { Page } from "./layout";
import { type Profile, type Project, caseStudyHref, evidenceSource, gitHubUrl, href, linkedInUrl, metricLabel, projectContext, projectDisplayName, projectNumber, roleEmail } from "./shared";
import { ArrowRight, ArrowUpRight, Flow, GitHub, Label, LinkedIn, Mail, ResumeMenu, Tags, WorkflowDiff } from "./ui";

/** The three projects told in full on the home page; the rest are compact rows. */
const featuredSlugs = ["federal-quality-delivery-system", "ccrs-test-data-tooling", "claims-document-assistant"];

export function Home({ profile }: { profile: Profile }) {
  const featured = featuredSlugs.map((slug) => profile.projects.find((p) => p.slug === slug)!);
  const others = profile.projects.filter((p) => !featuredSlugs.includes(p.slug));
  return (
    <Page place="home">
      <Hero profile={profile} />
      <section className="section work" id="work" aria-labelledby="work-heading" data-sc-act="work">
        <div className="wrap">
          <div className="section-head section-head--split">
            <div>
              <Label accent>Selected work</Label>
              <h2 id="work-heading">What changed for the people using it.</h2>
            </div>
            <p className="lede">Each project is shown as a diff of how the work went before and after, taken from the record, with the evidence behind it.</p>
          </div>
          <nav aria-label="Projects">
            <ol className="work-index">
              {profile.projects.map((project) => (
                <li key={project.slug}>
                  <a href={`#entry-${project.slug}`}>
                    <span className="num">{projectNumber(project)}</span>
                    <span className="work-index-name">{projectDisplayName(project)}<span className="work-index-context">{project.context}</span></span>
                    <span className="work-index-metric">{project.metric?.value}</span>
                    <span className="label work-index-evidence">{evidenceSource(project)}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          {featured.map((project) => <ProjectFeature key={project.slug} project={project} />)}
          <div className="more">
            <h3 className="label more-head">Earlier and supporting work</h3>
            {others.map((project) => <ProjectRow key={project.slug} project={project} />)}
          </div>
        </div>
      </section>
      <Career profile={profile} />
      <Approach profile={profile} />
    </Page>
  );
}

function Hero({ profile }: { profile: Profile }) {
  const current = profile.experience[0]!;
  return (
    <section className="hero" aria-labelledby="name-heading" data-sc-act="hero">
      <div className="hero-grid" aria-hidden="true" />
      <div className="wrap hero-inner">
        <p className="status"><span className="dot" aria-hidden="true" />Open to {profile.headline} roles</p>
        <h1 id="name-heading" className="hero-name">{profile.name}</h1>
        <p className="hero-claim">
          <strong>{profile.headline}.</strong> I sit with the people who use the software, build what they need, and test it before they do.
        </p>
        <div className="actions hero-actions">
          <a className="btn btn--primary btn--lg" href={roleEmail}><Mail />Email me</a>
          <ResumeMenu id="resume-menu-hero" size="lg" />
          <a className="link-arrow" href="#work">See the work<ArrowRight /></a>
        </div>
        <dl className="hero-facts">
          <div><dt className="label">Now</dt><dd>{current.employer}, on a VA healthcare claims platform</dd></div>
          <div><dt className="label">Experience</dt><dd>{profile.experienceYears} years in software development and quality engineering</dd></div>
          <div><dt className="label">Domains</dt><dd>Federal healthcare, banking, e-commerce</dd></div>
          <div><dt className="label">Elsewhere</dt><dd className="hero-social"><a href={linkedInUrl}><LinkedIn />LinkedIn</a><a href={gitHubUrl}><GitHub />GitHub</a></dd></div>
        </dl>
        <figure className="loop" aria-labelledby="loop-caption">
          <ol className="loop-track">
            {loop.map((station) => (
              <li className="station" key={station.label}>
                <span className="station-node" aria-hidden="true" />
                <strong className="station-label">{station.label}</strong>
                <span className="station-text">{station.text}</span>
              </li>
            ))}
          </ol>
          <figcaption className="figure-note" id="loop-caption">How I work on the VA claims platform. Each step restates a documented responsibility.</figcaption>
        </figure>
      </div>
    </section>
  );
}

function EvidenceTag({ project }: { project: Project }) {
  const source = evidenceSource(project);
  return <span className={`evidence-tag${source === "User-reported" ? " evidence-tag--reported" : source === "Public source" ? " evidence-tag--public" : ""}`}>{source}</span>;
}

function ProjectLinks({ project }: { project: Project }) {
  return (
    <p className="project-links">
      <a className="btn btn--sm" href={caseStudyHref(project)}>Case study<span className="sr-only">: {projectDisplayName(project)}</span><ArrowRight /></a>
      {project.repository && <a className="link-arrow" href={project.repository}><GitHub />Source<span className="sr-only"> for {projectDisplayName(project)}</span><ArrowUpRight /></a>}
    </p>
  );
}

function ProjectFeature({ project }: { project: Project }) {
  const name = projectDisplayName(project);
  return (
    <article className="feature" id={`entry-${project.slug}`} aria-labelledby={`${project.slug}-title`}>
      <header className="feature-head">
        <p className="meta"><span className="num">{projectNumber(project)}</span><span>{project.context}</span><span>{project.period}</span></p>
        <h3 id={`${project.slug}-title`}><a href={caseStudyHref(project)}>{name}</a></h3>
        <p className="feature-desc">{project.description}</p>
      </header>
      <div className="feature-body">
        {project.metric && (
          <div className="result">
            <p className="result-value">{project.metric.value}</p>
            <p className="result-label">{metricLabel(project)}</p>
            <EvidenceTag project={project} />
          </div>
        )}
        <dl className="facts">
          <div><dt className="label">The problem</dt><dd>{project.challenge}</dd></div>
          <div><dt className="label">My part</dt><dd>{project.role}, {projectContext(project)}.</dd></div>
        </dl>
        <div className="feature-evidence">
          <WorkflowDiff slug={project.slug} title={name} />
          <details className="flow-details">
            <summary><span>How it works</span><span className="muted">The documented design, step by step</span></summary>
            <Flow slug={project.slug} title={name} />
          </details>
        </div>
      </div>
      <footer className="feature-foot">
        <Tags items={project.technologies} />
        <ProjectLinks project={project} />
      </footer>
    </article>
  );
}

function ProjectRow({ project }: { project: Project }) {
  return (
    <article className="row" id={`entry-${project.slug}`} aria-labelledby={`${project.slug}-title`}>
      <p className="meta"><span className="num">{projectNumber(project)}</span><span>{project.period}</span></p>
      <div className="row-main">
        <h4 id={`${project.slug}-title`}><a href={caseStudyHref(project)}>{projectDisplayName(project)}</a></h4>
        <p>{project.description}</p>
        <Tags items={project.technologies} />
      </div>
      <div className="row-side">
        {project.metric && <><p className="result-value result-value--sm">{project.metric.value}</p><p className="result-label">{metricLabel(project)}</p></>}
        <EvidenceTag project={project} />
        <ProjectLinks project={project} />
      </div>
    </article>
  );
}

function Career({ profile }: { profile: Profile }) {
  return (
    <section className="section career" id="career" aria-labelledby="career-heading" data-sc-act="career">
      <div className="wrap">
        <div className="section-head section-head--split">
          <div>
            <Label accent>Career</Label>
            <h2 id="career-heading">{profile.experienceYears} years, three teams, one habit: find the real problem first.</h2>
          </div>
          <p><a className="link-arrow" href={href("experience/")}>Every role, skill and credential<ArrowRight /></a></p>
        </div>
        <ol className="timeline">
          {profile.experience.map((role, i) => (
            <li className={`timeline-item${i === 0 ? " is-current" : ""}`} key={role.id}>
              <p className="timeline-when">
                <time dateTime={role.start}>{formatCareerDate(role.start)}</time>
                <span aria-hidden="true"> to </span><span className="sr-only"> to </span>
                {role.end ? <time dateTime={role.end}>{formatCareerDate(role.end)}</time> : "now"}
              </p>
              <article className="timeline-body" aria-labelledby={`role-${role.id}`}>
                <h3 id={`role-${role.id}`}>{role.employer}</h3>
                <p className="where">{role.title}{role.customer ? `, for the ${role.customer}` : ""} · {role.location}</p>
                <p className="summary">{role.summary}</p>
                <ul className="bullets">{role.compactHighlights.map((item) => <li key={item}>{item}</li>)}</ul>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** Ways of working, each restating a documented highlight; tools straight from the record's skill groups. */
const practices = [
  ["Customer discovery", "Requirements and acceptance criteria with VA stakeholders; working sessions with claims processors and VA users on production issues."],
  ["Demos and feedback", "The stakeholder demonstration at the end of each release cycle and program increment since 2022, and the changes that follow."],
  ["User enablement", "A user guide, in-app release notes and a stakeholder overview for Data Generator; Tableau set up so any user can build a dashboard."],
  ["Technical troubleshooting", "Defects and data discrepancies traced across frontend, backend and MySQL, coordinated with developers in Jira."],
] as const;

function Approach({ profile }: { profile: Profile }) {
  const issuers = [...new Set(profile.verifiedCredentials.map((c) => c.issuer))];
  const education = profile.education[0];
  return (
    <section className="section approach" id="approach" aria-labelledby="approach-heading" data-sc-act="approach">
      <div className="wrap">
        <div className="section-head">
          <Label accent>How I work</Label>
          <h2 id="approach-heading">What I bring to a team.</h2>
        </div>
        <ul className="practices">
          {practices.map(([title, text]) => <li key={title}><h3>{title}</h3><p>{text}</p></li>)}
        </ul>
        <div className="toolkit">
          <h3 className="label">Tools I use</h3>
          <dl className="toolkit-grid">
            {profile.skillGroups.map((group) => <div key={group.label}><dt>{group.label}</dt><dd><Tags items={group.items} label={group.label} /></dd></div>)}
          </dl>
          <p className="toolkit-foot">
            {profile.verifiedCredentials.length} verified credentials from {issuers.slice(0, -1).join(", ")} and {issuers.at(-1)}.{" "}
            {education && <>{education.credential} in {education.field}. </>}
            <a className="link-arrow" href={href("experience/#learning")}>See the credentials<ArrowRight /></a>
          </p>
        </div>
      </div>
    </section>
  );
}
