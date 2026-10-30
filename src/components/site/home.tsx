import { flows } from "@/content/flows";
import { formatCareerDate } from "@/lib/career";
import { checks } from "@/lib/selftest";
import { Page } from "./layout";
import { type Profile, type Project, type Role, caseStudyHref, evidenceSource, gitHubUrl, href, linkedInUrl, metricLabel, projectContext, projectDisplayName, projectNumber, roleEmail } from "./shared";
import { ArrowRight, ArrowUpRight, GitHub, Label, LinkedIn, Mail, Play, ResumeMenu, Tags } from "./ui";

/** The three projects told as full splits on the home page; the rest are compact rows. */
const featuredSlugs = ["federal-quality-delivery-system", "ccrs-test-data-tooling", "claims-document-assistant"];

export function Home({ profile }: { profile: Profile }) {
  const featured = featuredSlugs.map((slug) => profile.projects.find((p) => p.slug === slug)!);
  const others = profile.projects.filter((p) => !featuredSlugs.includes(p.slug));
  return (
    <Page place="home">
      <Hero profile={profile} />
      <section id="work" aria-labelledby="work-heading" data-sc-act="work">
        <div className="split section-open">
          <div className="split-row">
            <div className="side side--people section-head">
              <Label>Selected work</Label>
              <h2 id="work-heading">Six projects, each told from both sides.</h2>
              <p className="lede">On the left, who it was for and what was wrong. On the right, what I built, how it works, and where the evidence comes from.</p>
            </div>
            <div className="side side--systems section-head">
              <nav aria-label="Projects">
                <ol className="index">
                  {profile.projects.map((project) => (
                    <li key={project.slug}>
                      <a href={`#entry-${project.slug}`}>
                        <span className="num">{projectNumber(project)}</span>
                        <span className="index-name">{projectDisplayName(project)}</span>
                        <span className="label kind">{evidenceSource(project)}</span>
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </div>
          </div>
        </div>
        {featured.map((project) => <ProjectSplit key={project.slug} project={project} />)}
        <div className="more">
          {others.map((project) => <ProjectRow key={project.slug} project={project} />)}
        </div>
      </section>
      <Career profile={profile} />
      <Capabilities profile={profile} />
    </Page>
  );
}

function Hero({ profile }: { profile: Profile }) {
  const current = profile.experience[0]!;
  return (
    <section className="split hero" aria-labelledby="name-heading" data-sc-act="title">
      <div className="hero-name-row">
        <p className="label hero-status"><span className="dot" aria-hidden="true" />Open to {profile.headline} roles · {profile.location.replace(/\s\d{5}$/, "")}</p>
        <h1 id="name-heading">{profile.name}</h1>
        <p className="hero-role">
          <strong>{profile.headline}</strong> at {current.employer}, on a VA healthcare claims platform. {profile.experienceYears} years in software development and quality engineering across federal healthcare, banking, and e-commerce.
        </p>
      </div>
      <div className="split-row hero-halves">
        <div className="side side--people hero-half">
          <Label>People</Label>
          <h2>Built with the people who use it.</h2>
          <p className="body">
            I work directly with VA stakeholders and health-provider claims processors: requirements and acceptance criteria,
            working sessions on production issues, and the demo at the end of every release cycle since 2022.
          </p>
          <div className="actions">
            <a className="btn btn--primary btn--lg" href={roleEmail}><Mail />Email me</a>
            <ResumeMenu id="resume-menu-hero" anchor="resume-hero" size="lg" />
            <a className="link-arrow" href="#work">See the work<ArrowRight /></a>
          </div>
          <p className="hero-social">
            <a href={linkedInUrl}><LinkedIn />LinkedIn</a>
            <a href={gitHubUrl}><GitHub />GitHub</a>
          </p>
        </div>
        <div className="side side--systems hero-half">
          <Label>Systems</Label>
          <h2>Tested before they do.</h2>
          <p className="body">
            I integrate APIs, build internal tools, and automate the checks that decide a release. This page is no exception.
          </p>
          <SelfTest />
        </div>
      </div>
    </section>
  );
}

/** The signature move. Rows are rendered here; src/client/enhance.ts runs src/lib/selftest.ts against the live page. */
function SelfTest() {
  return (
    <section className="selftest" id="selftest" aria-labelledby="selftest-heading">
      <div className="selftest-head">
        <div>
          <h3 id="selftest-heading">Test this page</h3>
          <p>{checks.length} checks, run in your browser on what you are looking at.</p>
        </div>
        <button className="btn btn--primary js-only" type="button" data-run-checks><Play /><span>Run the checks</span></button>
      </div>
      <p className="selftest-summary" role="status">
        <span className="js-only">Not run yet.</span>
        <span className="no-js-only">These checks need JavaScript to run.</span>
      </p>
      <ol className="checks" tabIndex={0} aria-label="Checks">
        {checks.map((check) => (
          <li className="check" key={check.id} data-check={check.id} data-state="pending">
            <span className="check-mark" aria-hidden="true">·</span>
            <span className="check-name">{check.name}</span>
            <span className="check-value" />
          </li>
        ))}
      </ol>
      <p className="selftest-foot">The checks are in <a href="https://github.com/mohamedmoheyeldin/portfolio/blob/main/src/lib/selftest.ts">src/lib/selftest.ts</a>.</p>
    </section>
  );
}

function EvidenceTag({ project }: { project: Project }) {
  const source = evidenceSource(project);
  return <span className={`label evidence-tag${source === "User-reported" ? " evidence-tag--reported" : ""}`}>{source}</span>;
}

function ProjectLinks({ project }: { project: Project }) {
  return (
    <p className="project-links">
      <a className="link-arrow" href={caseStudyHref(project)}>Read the case study<span className="sr-only">: {projectDisplayName(project)}</span><ArrowRight /></a>
      {project.repository && <a className="link-arrow" href={project.repository}>Source<span className="sr-only"> for {projectDisplayName(project)}</span><ArrowUpRight /></a>}
    </p>
  );
}

function ProjectSplit({ project }: { project: Project }) {
  const flow = flows[project.slug];
  const name = projectDisplayName(project);
  return (
    <article className="split project" id={`entry-${project.slug}`} aria-labelledby={`${project.slug}-title`}>
      <div className="split-row">
        <div className="side side--people">
          <p className="label meta"><span>{projectNumber(project)}</span><span>{project.context}</span><span>{project.period}</span></p>
          <h3 id={`${project.slug}-title`}><a href={caseStudyHref(project)}>{name}</a></h3>
          <p className="desc">{project.description}</p>
          <dl className="facts">
            <div><Label as="dt">Who it was for</Label><dd>{project.audience}</dd></div>
            <div><Label as="dt">The problem</Label><dd>{project.challenge}</dd></div>
            <div><Label as="dt">My part</Label><dd>{project.role}, {projectContext(project)}.</dd></div>
          </dl>
        </div>
        <div className="side side--systems">
          <Label>How it works</Label>
          {flow && (
            <figure>
              <ol className="flow" aria-label={`${name}: how it works`}>
                {flow.steps.map((step) => <li className="flow-step" key={step.title}><div className="flow-card"><strong>{step.title}</strong><span>{step.text}</span></div></li>)}
              </ol>
              {flow.beside && (
                <div className="flow-side">
                  {flow.beside.map((note) => <p key={note.title}><strong>{note.title}.</strong> {note.text}</p>)}
                </div>
              )}
              <figcaption className="figure-note muted">{flow.caption}</figcaption>
            </figure>
          )}
          {project.metric && (
            <div className="result">
              <Label>Result</Label>
              <p className="result-value">{project.metric.value}</p>
              <p className="result-label">{metricLabel(project)}</p>
              <EvidenceTag project={project} />
            </div>
          )}
          <Tags items={project.technologies} />
          <ProjectLinks project={project} />
        </div>
      </div>
    </article>
  );
}

function ProjectRow({ project }: { project: Project }) {
  return (
    <article className="split more-row" id={`entry-${project.slug}`} aria-labelledby={`${project.slug}-title`}>
      <div className="split-row">
        <div className="side side--people">
          <p className="label meta"><span>{projectNumber(project)}</span><span>{project.context}</span><span>{project.period}</span></p>
          <h3 id={`${project.slug}-title`} className="more-title"><a href={caseStudyHref(project)}>{projectDisplayName(project)}</a></h3>
          <p className="desc">{project.description}</p>
        </div>
        <div className="side side--systems">
          {project.metric && (
            <>
              <p className="result-value">{project.metric.value}</p>
              <p className="result-label">{metricLabel(project)}</p>
              <EvidenceTag project={project} />
            </>
          )}
          <Tags items={project.technologies} />
          <ProjectLinks project={project} />
        </div>
      </div>
    </article>
  );
}

const years = (role: Role) => `${role.start.slice(0, 4)} to ${role.end ? role.end.slice(0, 4) : "now"}`;

function Career({ profile }: { profile: Profile }) {
  return (
    <section id="career" aria-labelledby="career-heading" data-sc-act="career">
      <div className="split section-open">
        <div className="split-row">
          <div className="side side--people section-head">
            <Label>Experience</Label>
            <h2 id="career-heading">{profile.experienceYears} years, three teams.</h2>
            <p className="lede">Who each role served, on the left. What I built and checked for them, on the right.</p>
          </div>
          <div className="side side--systems section-head">
            <p><a className="link-arrow" href={href("experience/")}>Every role, skill and credential<ArrowRight /></a></p>
          </div>
        </div>
      </div>
      {profile.experience.map((role) => (
        <article className="split role" key={role.id} aria-labelledby={`role-${role.id}`}>
          <span className="role-years"><time dateTime={role.start}>{formatCareerDate(role.start)}</time> to {role.end ? <time dateTime={role.end}>{formatCareerDate(role.end)}</time> : "now"}<span className="sr-only">, {years(role)}</span></span>
          <div className="split-row">
            <div className="side side--people">
              <h3 id={`role-${role.id}`}>{role.employer}</h3>
              <p className="where">{role.title}{role.customer ? `, for the ${role.customer}` : ""}</p>
              <p className="label">{role.location}</p>
              <p className="summary">{role.summary}</p>
            </div>
            <div className="side side--systems">
              <ul className="bullets">{role.compactHighlights.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
          </div>
        </article>
      ))}
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

function Capabilities({ profile }: { profile: Profile }) {
  const issuers = [...new Set(profile.verifiedCredentials.map((c) => c.issuer))];
  const education = profile.education[0];
  return (
    <section className="split section caps" id="capabilities" aria-labelledby="caps-heading" data-sc-act="capabilities">
      <div className="split-row">
        <div className="side side--people">
          <div className="section-head">
            <Label>Capabilities</Label>
            <h2 id="caps-heading">What I bring to a team.</h2>
          </div>
          <ul className="cap-list">
            {practices.map(([title, text]) => <li key={title}><h3>{title}</h3><p>{text}</p></li>)}
          </ul>
          <p className="cap-foot">
            {profile.verifiedCredentials.length} verified credentials from {issuers.slice(0, -1).join(", ")} and {issuers.at(-1)}.{" "}
            {education && <>{education.credential} in {education.field}. </>}
            <a href={href("experience/#learning")}>See them</a>
          </p>
        </div>
        <div className="side side--systems">
          <div className="section-head"><Label>Tools</Label></div>
          <ul className="cap-list">
            {profile.skillGroups.map((group) => <li key={group.label}><h3>{group.label}</h3><Tags items={group.items} /></li>)}
          </ul>
        </div>
      </div>
    </section>
  );
}
