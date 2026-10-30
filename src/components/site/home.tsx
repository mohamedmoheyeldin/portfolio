import { formatCareerDate } from "@/lib/career";
import { Page } from "./layout";
import { type Profile, type Project, caseStudyHref, gitHubUrl, href, linkedInUrl, metricLabel, projectDisplayName, projectNumber, roleEmail } from "./shared";
import { ArrowRight, ArrowUpRight, EvidenceTag, GitHub, LinkedIn, Mail, Pipeline, ResumeMenu, Tags } from "./ui";

/** The three projects laid as case sheets on the deck; the rest are rows below it. */
const featuredSlugs = ["federal-quality-delivery-system", "ccrs-test-data-tooling", "claims-document-assistant"];

export function Home({ profile }: { profile: Profile }) {
  const featured = featuredSlugs.map((slug) => profile.projects.find((p) => p.slug === slug)!);
  const others = profile.projects.filter((p) => !featuredSlugs.includes(p.slug));
  return (
    <Page place="home">
      <Cover profile={profile} featured={featured} />
      <Deck featured={featured} />
      <MoreWork projects={others} />
      <Stance profile={profile} />
      <Career profile={profile} />
      <Capabilities profile={profile} />
    </Page>
  );
}

/** Short tab labels for the deck: the folder tabs share one row, so long names are shortened here, not in the record. */
const tabName = (project: Project) => ({
  "federal-quality-delivery-system": "VA Claims Workflows",
  "ccrs-test-data-tooling": "Data Generator",
  "claims-document-assistant": "Claims Document Assistant",
}[project.slug] ?? projectDisplayName(project));

/**
 * The cover: the name and the claim, the one action, a short fact sheet, and the tops of the three case sheets, so
 * the first screen already shows where the work is and what each project changed.
 */
function Cover({ profile, featured }: { profile: Profile; featured: Project[] }) {
  const current = profile.experience[0]!;
  const first = profile.experience[profile.experience.length - 1]!;
  return (
    <section className="cover night" aria-labelledby="cover-heading" data-sc-act="cover">
      <div className="wrap cover-top">
        <p className="status"><span className="status-dot" aria-hidden="true" />Open to {profile.headline} roles</p>
        <h1 id="cover-heading">
          <span className="cover-name">{profile.name}</span>
          <span className="cover-claim">I work with the people who use the software, <em>build what they need</em>, and test it before they do.</span>
        </h1>
      </div>
      <div className="wrap cover-grid">
        <div className="cover-main">
          <p className="lede cover-lede">
            {profile.headline} at {current.employer} on a VA healthcare claims platform. {profile.experienceYears} years in software development
            and quality engineering: API integration, internal tools, test automation and release checks.
          </p>
          <div className="actions">
            <a className="btn btn--primary btn--lg" href={roleEmail}><Mail />Email me</a>
            <ResumeMenu id="resume-menu-hero" size="lg" />
            <a className="link-arrow" href="#work">See the work<ArrowRight /></a>
          </div>
        </div>
        <dl className="cover-facts">
          <div><dt className="label">Now</dt><dd>{current.title}, {current.employer}</dd></div>
          <div><dt className="label">Experience</dt><dd>{profile.experienceYears} years, since <time dateTime={first.start}>{first.start.slice(0, 4)}</time></dd></div>
          <div><dt className="label">Domains</dt><dd>Federal healthcare, banking, e-commerce</dd></div>
          <div><dt className="label">Elsewhere</dt><dd className="cover-social"><a href={linkedInUrl}><LinkedIn />LinkedIn</a><a href={gitHubUrl}><GitHub />GitHub</a></dd></div>
        </dl>
      </div>
      {/* The claim in the h1, proven in three parts. Each line restates documented Booz Allen highlights in career.json. */}
      <ol className="wrap cover-fit" aria-label="The claim, with evidence">
        {/* highlights[7], highlights[8] */}
        <li><span className="num">01</span><p className="cover-fit-title">Works with the people who use it</p><p>Leads the stakeholder demo at the end of every release cycle since 2022 and joins working sessions with claims processors.</p></li>
        {/* highlights[2] and the profile summary */}
        <li><span className="num">02</span><p className="cover-fit-title">Builds what they need</p><p>Turned hours of daily test-data prep into a 5-minute run with Data Generator &amp; File Processing, used by the whole team daily.</p></li>
        {/* experienceYears; highlights[10] */}
        <li><span className="num">03</span><p className="cover-fit-title">Tests it before they do</p><p>{profile.experienceYears} years in development and quality engineering. Helped select Playwright and built the reusable smoke and regression framework.</p></li>
      </ol>
      <nav className="wrap cover-index" aria-label="Case files">
        <ol>
          {featured.map((project) => (
            <li key={project.slug}>
              <a href={`#entry-${project.slug}`}>
                <span className="num">{projectNumber(project)}</span>
                <span className="cover-index-metric">{project.metric?.value}</span>
                <span className="cover-index-name">{tabName(project)}</span>
                <ArrowRight />
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </section>
  );
}

/**
 * The signature: the case deck. Each featured project is a sheet with a folder tab at its own place along the top.
 * Where the screen is large enough, the sheets stick and lay over each other as you scroll, and every sheet you pass
 * leaves its tab showing, so the row of tabs becomes an index of what you have read. Each tab jumps back to its
 * sheet through an anchor in normal flow (a sticky element cannot be scrolled to reliably). enhance.ts turns the
 * stacking off when a sheet's content would not fit the screen; without JavaScript the sheets simply follow each other.
 */
function Deck({ featured }: { featured: Project[] }) {
  return (
    <section className="deck" id="work" aria-labelledby="work-heading" data-sc-act="deck">
      <div className="wrap">
        <div className="section-head section-head--split">
          <h2 id="work-heading">Selected work</h2>
          <p className="lede">Three case files: the problem, my part, the documented design and what changed. Every result names where its evidence comes from.</p>
        </div>
        <div className="deck-stack" data-deck>
          {featured.map((project) => <Sheet key={project.slug} project={project} />)}
          <span className="deck-hold" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}

function Sheet({ project }: { project: Project }) {
  const name = projectDisplayName(project);
  return (
    <>
      <span className="sheet-anchor" id={`entry-${project.slug}`} />
      <article className="sheet" aria-labelledby={`${project.slug}-title`}>
        <a className="sheet-tab night" href={`#entry-${project.slug}`}>
          <span className="num">{projectNumber(project)}</span>
          <span className="sheet-tab-name">{tabName(project)}</span>
          <span className="sr-only">, start of this case</span>
        </a>
        <div className="sheet-body night">
          <div className="sheet-lead">
            <header className="sheet-head">
              <p className="meta"><span>{project.period}</span><span>{project.role}</span></p>
              <h3 id={`${project.slug}-title`}><a href={caseStudyHref(project)}>{name}</a></h3>
              <p className="sheet-desc">{project.description}</p>
            </header>
            {project.metric && (
              <div className="result">
                <p className="result-value">{project.metric.value}</p>
                <p className="result-label">{metricLabel(project)}</p>
                <EvidenceTag project={project} />
              </div>
            )}
            <dl className="facts">
              <div><dt className="label">The problem</dt><dd>{project.challenge}</dd></div>
            </dl>
            <p className="project-links">
              <a className="btn btn--sm" href={caseStudyHref(project)}>Read the case study<span className="sr-only">: {name}</span><ArrowRight /></a>
              {project.repository && <a className="link-arrow" href={project.repository}><GitHub />Source<span className="sr-only"> for {name}</span><ArrowUpRight /></a>}
            </p>
          </div>
          <div className="sheet-detail">
            <Pipeline slug={project.slug} title={name} compact />
            <Tags items={project.technologies} />
          </div>
        </div>
      </article>
    </>
  );
}

/** The other three projects as a results ledger: the result set at display size, then what it was, its evidence and the case study link. */
function MoreWork({ projects }: { projects: Project[] }) {
  return (
    <section className="section more" aria-labelledby="more-heading" data-sc-act="more">
      <div className="wrap">
        <div className="section-head section-head--split">
          <h2 id="more-heading">Earlier and supporting work</h2>
          <p><a className="link-arrow" href={href("experience/#projects")}>All six case studies<ArrowRight /></a></p>
        </div>
        <ol className="ledger">
          {projects.map((project) => (
            <li className="ledger-row" key={project.slug} id={`entry-${project.slug}`}>
              <article aria-labelledby={`${project.slug}-title`}>
                <p className="ledger-meta"><span className="num">{projectNumber(project)}</span><span>{project.period}</span></p>
                {project.metric && (
                  <div className="ledger-result">
                    <p className="ledger-value">{project.metric.value}</p>
                    <p className="result-label">{metricLabel(project)}</p>
                  </div>
                )}
                <div className="ledger-text">
                  <h3 id={`${project.slug}-title`}><a href={caseStudyHref(project)}>{projectDisplayName(project)}</a></h3>
                  <p className="ledger-desc">{project.description}</p>
                  <p className="ledger-foot">
                    <EvidenceTag project={project} />
                    <a className="link-arrow" href={caseStudyHref(project)}>Case study<span className="sr-only">: {projectDisplayName(project)}</span><ArrowRight /></a>
                  </p>
                </div>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/**
 * The stance: one full-width statement between the work and the career. It restates the first sentence of the second
 * detailed summary paragraph in the career record (with the record's expanded agency name), so nothing here is typed by hand.
 */
function Stance({ profile }: { profile: Profile }) {
  const line = profile.detailedSummary[1]?.split(/(?<=\.)\s/)[0] ?? "";
  return (
    <section className="stance night" aria-label="How I work" data-sc-act="stance">
      <div className="wrap">
        <p className="stance-label label">How I work</p>
        <p className="stance-line">{line}</p>
        <ul className="stance-list" aria-label="Competencies">{profile.competencies.map((item) => <li key={item}>{item}</li>)}</ul>
      </div>
    </section>
  );
}

function Career({ profile }: { profile: Profile }) {
  return (
    <section className="section section--tint career" id="career" aria-labelledby="career-heading" data-sc-act="career">
      <div className="wrap">
        <div className="section-head section-head--split">
          <h2 id="career-heading">{profile.experienceYears} years, three teams, one habit: find the real problem first.</h2>
          <p><a className="link-arrow" href={href("experience/")}>Every role, skill and credential<ArrowRight /></a></p>
        </div>
        <Tenure profile={profile} />
        <ol className="timeline">
          {profile.experience.map((role, i) => (
            <li className={`timeline-item${i === 0 ? " is-current" : ""}`} key={role.id}>
              <p className="timeline-when">
                <time dateTime={role.start}>{formatCareerDate(role.start)}</time>
                <span> to </span>
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

/** Months since January 2000 for a "YYYY-MM" date, so tenure can be drawn to scale. */
const monthIndex = (value: string) => { const [y, m] = value.split("-").map(Number); return (y! - 2000) * 12 + (m! - 1); };

/**
 * Eleven years drawn to scale: one bar per role from its start to its end (or to experienceAsOf for the current
 * role), all from the dates in career.json. Bars are SVG geometry, so no inline styles are needed for the widths.
 */
function Tenure({ profile }: { profile: Profile }) {
  const roles = [...profile.experience].reverse();
  const from = monthIndex(`${roles[0]!.start.slice(0, 4)}-01`);
  const to = monthIndex(profile.experienceAsOf) + 1;
  const span = to - from;
  const x = (value: string) => ((monthIndex(value) - from) / span) * 1000;
  const firstYear = Number(roles[0]!.start.slice(0, 4));
  const lastYear = Number(profile.experienceAsOf.slice(0, 4));
  const years = Array.from({ length: lastYear - firstYear + 1 }, (_, i) => firstYear + i);
  return (
    <figure className="tenure" aria-labelledby="tenure-caption">
      <ol className="tenure-rows">
        {roles.map((role) => {
          const start = x(role.start);
          const end = role.end ? x(role.end) : 1000;
          const years = Math.round(((role.end ? monthIndex(role.end) : to - 1) - monthIndex(role.start)) / 12 * 10) / 10;
          return (
            <li className={`tenure-row${role.end ? "" : " is-current"}`} key={role.id}>
              <p className="tenure-label"><span className="tenure-employer">{role.employer}</span><span className="tenure-title">{role.title}</span></p>
              <svg className="tenure-track" viewBox="0 0 1000 12" preserveAspectRatio="none" aria-hidden="true" focusable="false">
                <rect className="tenure-rail" x="0" y="5" width="1000" height="2" />
                <rect className="tenure-bar" x={start} y="0" width={Math.max(end - start, 4)} height="12" rx="0" />
              </svg>
              <p className="tenure-years">{years} yrs</p>
            </li>
          );
        })}
      </ol>
      <p className="tenure-axis" aria-hidden="true"><span>{years[0]}</span><span>{years.at(-1)}</span></p>
      <figcaption id="tenure-caption" className="label">Tenure by role, drawn to scale from the start and end dates in the career record.</figcaption>
    </figure>
  );
}

/**
 * What I bring, each line restating documented highlights in career.json (the source is noted per entry). Quality
 * engineering sits beside the forward deployed practices because the record has eleven years of it.
 */
const capabilities = [
  // Booz Allen highlights[6], highlights[8]
  ["Listen", "Customer discovery", "Requirements and acceptance criteria mapped with VA stakeholders; working sessions with claims processors and VA users on production issues."],
  // Booz Allen highlights[0]
  ["Connect", "System integration", "Health-provider claim-status APIs integrated with the VA system, so staff, providers and veterans each see live status for their role."],
  // Booz Allen highlights[5], highlights[9]
  ["Build", "Application development", "React, TypeScript and JavaScript features on the claims application, and data issues traced across frontend, backend and MySQL."],
  // Booz Allen highlights[2], highlights[3]
  ["Automate", "Workflow automation", "Data Generator & File Processing, run like a product: versioned installers from GitHub Actions, release notes and a user guide."],
  // Booz Allen highlights[10]; Chick-fil-A highlights[1], highlights[2]
  ["Prove", "Test automation", "Helped select Playwright and built the reusable smoke and regression framework; earlier, REST contract checks and Okta and SSO flows run through GitHub Actions."],
  // Booz Allen highlights[7], highlights[4]
  ["Show", "Demos and enablement", "The stakeholder demo at the end of every release cycle since 2022, and Tableau set up so any user can build a dashboard."],
] as const;

function Capabilities({ profile }: { profile: Profile }) {
  const issuers = [...new Set(profile.verifiedCredentials.map((c) => c.issuer))];
  const education = profile.education[0];
  return (
    <section className="section capabilities" id="approach" aria-labelledby="approach-heading" data-sc-act="capabilities">
      <div className="wrap">
        <div className="section-head section-head--split">
          <h2 id="approach-heading">What I bring: a loop, not a handoff.</h2>
          <p className="lede">Six things I do on a team, in the order they happen on a release. The last step, the demo, starts the next round of questions.</p>
        </div>
        <ol className="cap-loop">
          {capabilities.map(([verb, title, text], i) => (
            <li key={title}>
              <p className="cap-node"><span className="num">{String(i + 1).padStart(2, "0")}</span><span className="cap-verb">{verb}</span></p>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ol>
        <p className="cap-return"><span aria-hidden="true" className="cap-return-mark" />Back to step 01: each demo brings new questions from the people using the software.</p>
        <div className="toolkit">
          <h3 className="toolkit-title">Tools I use</h3>
          <dl className="toolkit-wall">
            {profile.skillGroups.map((group) => (
              <div className="toolkit-row" key={group.label}>
                <dt className="label">{group.label}</dt>
                <dd><ul className="toolkit-words" aria-label={group.label}>{group.items.map((item) => <li key={item}>{item}</li>)}</ul></dd>
              </div>
            ))}
          </dl>
          <div className="toolkit-proof">
            <p className="toolkit-count"><span className="toolkit-count-value">{profile.verifiedCredentials.length}</span><span className="toolkit-count-label">verified credentials from {issuers.slice(0, -1).join(", ")} and {issuers.at(-1)}</span></p>
            <p className="toolkit-foot">
              {education && <>{education.credential} in {education.field}. </>}
              <a className="link-arrow" href={href("experience/#learning")}>See the credentials<ArrowRight /></a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
