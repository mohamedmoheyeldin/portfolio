import { formatCareerDate } from "@/lib/career";
import { Page } from "./layout";
import { type Profile, type Project, caseStudyHref, gitHubUrl, href, linkedInUrl, metricLabel, projectDisplayName, projectNumber, roleEmail } from "./shared";
import { ArrowRight, ArrowUpRight, EvidenceTag, GitHub, LinkedIn, Mail, ResumeMenu, Schematic, Tags } from "./ui";

/** Work is laid out as a grid: three featured tiles first, then the supporting three. */
const order = ["federal-quality-delivery-system", "ccrs-test-data-tooling", "claims-document-assistant", "portfolio-career-content-system", "ecommerce-feedback-platform", "banking-risk-validation"];

export function Home({ profile }: { profile: Profile }) {
  const projects = order.map((slug) => profile.projects.find((p) => p.slug === slug)!);
  return (
    <Page place="home">
      <Hero profile={profile} featured={projects.slice(0, 3)} />
      <Work projects={projects} />
      <Career profile={profile} />
      <Capabilities profile={profile} />
    </Page>
  );
}

/** Short names for the proof row: the full names are on the tiles, so long names are shortened here, not in the record. */
const shortName = (project: Project) => ({
  "federal-quality-delivery-system": "VA Claims Workflows",
  "ccrs-test-data-tooling": "Data Generator",
  "claims-document-assistant": "Claims Document Assistant",
}[project.slug] ?? projectDisplayName(project));

/**
 * The hero: who he is and the claim on the left, and on the right the signature, a working diagram of the documented
 * VA claim-status design that runs a signal along its paths and explains each part when you pick it.
 */
function Hero({ profile, featured }: { profile: Profile; featured: Project[] }) {
  const current = profile.experience[0]!;
  return (
    <section className="hero" aria-labelledby="hero-heading" data-sc-act="hero">
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <p className="status"><span className="status-dot" aria-hidden="true" />Open to {profile.headline} roles</p>
          <h1 id="hero-heading">
            <span className="hero-name">{profile.name}</span>
            <span className="hero-claim">I work with the people who use the software, build what they need, and test it before they do.</span>
          </h1>
          <p className="lede hero-lede">
            {profile.headline} at {current.employer} on a VA healthcare claims platform. {profile.experienceYears} years in software development and
            quality engineering across federal healthcare, banking and e-commerce.
          </p>
          <div className="actions">
            <a className="btn btn--primary btn--lg" href={roleEmail}><Mail />Email me</a>
            <ResumeMenu id="resume-menu-hero" size="lg" />
            <span className="hero-social">
              <a className="btn btn--quiet btn--icon btn--lg" href={linkedInUrl} aria-label="LinkedIn"><LinkedIn /></a>
              <a className="btn btn--quiet btn--icon btn--lg" href={gitHubUrl} aria-label="GitHub"><GitHub /></a>
            </span>
          </div>
          <ul className="proof" aria-label="Results">
            {featured.map((project) => project.metric && (
              <li key={project.slug}>
                <a href={`#entry-${project.slug}`}>
                  <span className="proof-value">{project.metric.value}</span>
                  <span className="proof-name">{shortName(project)}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        <Schematic />
      </div>
    </section>
  );
}

/** One figure per project, each restating its documented result (the metric label) as a diagram. Decorative: the text says it all. */
function TileFigure({ slug }: { slug: string }) {
  switch (slug) {
    // metric: "VA staff, providers, and veterans now see live claim status"
    case "federal-quality-delivery-system":
      return (
        <div className="fig fig-roles" aria-hidden="true">
          <span className="fig-src">Claims platform</span>
          <ul>{["VA staff", "Providers", "Veterans"].map((role) => <li key={role}><span className="live" />{role}<span className="fig-tag">live status</span></li>)}</ul>
        </div>
      );
    // flows.ts ccrs-test-data-tooling steps, shortened
    case "ccrs-test-data-tooling":
      return (
        <div className="fig fig-run" aria-hidden="true">
          <ol>{["Template", "Generate", "Validate", "Package", "Upload"].map((step, i) => <li key={step}><span>{String(i + 1).padStart(2, "0")}</span>{step}</li>)}</ol>
          <p className="fig-bar"><span /><em>one run</em></p>
        </div>
      );
    // metric: 17 fields per claim PDF; flows.ts: rules, a person reviews, outbox
    case "claims-document-assistant":
      return (
        <div className="fig fig-fields" aria-hidden="true">
          <ol className="fig-cells">{Array.from({ length: 17 }, (_, i) => <li key={i} />)}</ol>
          <p className="fig-chain"><span>Rules</span><span>Person reviews</span><span>Outbox</span></p>
        </div>
      );
    // metric: one-page and full, in PDF, Word and text, from one validated record
    case "portfolio-career-content-system":
      return (
        <div className="fig fig-outputs" aria-hidden="true">
          <span className="fig-src">career.json</span>
          <ul>{["Website", "PDF", "Word", "Text"].map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      );
    // metric: browser, API, visual and SSO login checks, run through GitHub Actions
    case "ecommerce-feedback-platform":
      return (
        <div className="fig fig-checks" aria-hidden="true">
          <ul>{["Browser", "API", "Visual", "SSO login"].map((item) => <li key={item}>{item}</li>)}</ul>
          <p className="fig-rail">GitHub Actions</p>
        </div>
      );
    // metric: Chrome, Firefox, Safari and Edge; release checks across development, QA, UAT and staging
    case "banking-risk-validation":
      return (
        <div className="fig fig-envs" aria-hidden="true">
          <ul>{["Chrome", "Firefox", "Safari", "Edge"].map((item) => <li key={item}>{item}</li>)}</ul>
          <ol>{["Dev", "QA", "UAT", "Staging"].map((item) => <li key={item}>{item}</li>)}</ol>
        </div>
      );
    default:
      return null;
  }
}

function Work({ projects }: { projects: Project[] }) {
  return (
    <section className="section work" id="work" aria-labelledby="work-heading" data-sc-act="work">
      <div className="wrap">
        <div className="section-head section-head--split">
          <h2 id="work-heading">Work that people use every day.</h2>
          <p className="lede">Six projects, each with a case study: the problem, my part, the design and what changed. Every result says where its evidence comes from.</p>
        </div>
        <ul className="bento">
          {projects.map((project, i) => {
            const name = projectDisplayName(project);
            return (
              <li className={`tile${i < 3 ? " tile--featured" : ""}`} key={project.slug} id={`entry-${project.slug}`}>
                <article aria-labelledby={`${project.slug}-title`}>
                  <p className="meta"><span className="num">{projectNumber(project)}</span><span>{project.period}</span><span>{project.kind === "career" ? "Work" : "Independent"}</span></p>
                  <h3 id={`${project.slug}-title`}><a href={caseStudyHref(project)}>{name}</a></h3>
                  <p className="tile-desc">{project.description}</p>
                  <TileFigure slug={project.slug} />
                  {project.metric && (
                    <div className="result">
                      <p className="result-value">{project.metric.value}</p>
                      <p className="result-label">{metricLabel(project)}</p>
                    </div>
                  )}
                  <p className="tile-foot">
                    <EvidenceTag project={project} />
                    <span className="tile-links">
                      {project.repository && <a className="tile-src" href={project.repository} aria-label={`Source for ${name}`}><GitHub /></a>}
                      <a className="link-arrow" href={caseStudyHref(project)}>Case study<span className="sr-only">: {name}</span><ArrowRight /></a>
                    </span>
                  </p>
                </article>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/** Months between two ISO dates (YYYY-MM or YYYY-MM-DD); an open end counts to the record's as-of date. */
const months = (start: string, end: string) => {
  const [ys, ms] = start.split("-").map(Number) as [number, number];
  const [ye, me] = end.split("-").map(Number) as [number, number];
  return (ye - ys) * 12 + (me - ms);
};

/**
 * Career on a bar drawn to scale: each role's width is its share of the months since the first role started, computed
 * at build time from the record and set as SVG attributes (percentages), so no inline style is needed.
 */
function Career({ profile }: { profile: Profile }) {
  const roles = [...profile.experience].reverse();
  const asOf = profile.experienceAsOf ?? new Date().toISOString().slice(0, 7);
  const first = roles[0]!.start;
  const total = months(first, asOf);
  let x = 0;
  const spans = roles.map((role) => {
    const width = (months(role.start, role.end ?? asOf) / total) * 100;
    const span = { role, x, width };
    x += width;
    return span;
  });
  const startYear = Number(first.slice(0, 4));
  const ticks = Array.from({ length: Number(asOf.slice(0, 4)) - startYear + 1 }, (_, i) => startYear + i)
    .map((year) => ({ year, at: (months(first, `${year}-01`) / total) * 100 }))
    .filter((tick) => tick.at >= 0 && tick.at <= 100);
  return (
    <section className="section section--tint career" id="career" aria-labelledby="career-heading" data-sc-act="career">
      <div className="wrap">
        <div className="section-head section-head--split">
          <h2 id="career-heading">{profile.experienceYears} years, three teams, one habit: find the real problem first.</h2>
          <p><a className="link-arrow" href={href("experience/")}>Every role, skill and credential<ArrowRight /></a></p>
        </div>
        <figure className="span-bar">
          <svg className="span-svg" width="100%" height="64" aria-hidden="true" focusable="false">
            {ticks.map((tick) => (
              <g key={tick.year} className="span-tick">
                <line x1={`${tick.at}%`} x2={`${tick.at}%`} y1="34" y2="44" />
                {tick.year % 2 === 1 && <text x={`${tick.at}%`} y="60">{tick.year}</text>}
              </g>
            ))}
            {spans.map(({ role, x: at, width }, i) => (
              <rect key={role.id} className={`span-seg${i === spans.length - 1 ? " is-current" : ""}`} x={`${at}%`} y="8" width={`${width}%`} height="20" rx="4" />
            ))}
          </svg>
          <figcaption className="sr-only">Roles to scale since {formatCareerDate(first)}.</figcaption>
          <ol className="span-roles">
            {spans.map(({ role }, i) => (
              <li className={i === spans.length - 1 ? "is-current" : undefined} key={role.id}>
                <article aria-labelledby={`role-${role.id}`}>
                  <p className="span-when">
                    <time dateTime={role.start}>{formatCareerDate(role.start)}</time> to {role.end ? <time dateTime={role.end}>{formatCareerDate(role.end)}</time> : "now"}
                  </p>
                  <h3 id={`role-${role.id}`}>{role.employer}</h3>
                  <p className="where">{role.title}{role.customer ? `, for the ${role.customer}` : ""}</p>
                  <ul className="bullets">{role.compactHighlights.map((item) => <li key={item}>{item}</li>)}</ul>
                </article>
              </li>
            ))}
          </ol>
        </figure>
      </div>
    </section>
  );
}

/**
 * What I bring, each line restating documented highlights in career.json (the source is noted per entry). Quality
 * engineering sits beside the forward deployed practices because the record has eleven years of it.
 */
const capabilities = [
  // Booz Allen highlights[6], highlights[8]
  ["Customer discovery", "Requirements and acceptance criteria mapped with VA stakeholders; working sessions with claims processors and VA users on production issues."],
  // Booz Allen highlights[0]
  ["System integration", "Health-provider claim-status APIs integrated with the VA system, so staff, providers and veterans each see live status for their role."],
  // Booz Allen highlights[5], highlights[9]
  ["Application development", "React, TypeScript and JavaScript features on the claims application, and data issues traced across frontend, backend and MySQL."],
  // Booz Allen highlights[2], highlights[3]
  ["Workflow automation", "Data Generator & File Processing, run like a product: versioned installers from GitHub Actions, release notes and a user guide."],
  // Booz Allen highlights[10]; Chick-fil-A highlights[1], highlights[2]
  ["Test automation", "Helped select Playwright and built the reusable smoke and regression framework; earlier, REST contract checks and Okta and SSO flows run through GitHub Actions."],
  // Booz Allen highlights[7], highlights[4]
  ["Demos and enablement", "The stakeholder demo at the end of every release cycle since 2022, and Tableau set up so any user can build a dashboard."],
] as const;

function Capabilities({ profile }: { profile: Profile }) {
  const issuers = [...new Set(profile.verifiedCredentials.map((c) => c.issuer))];
  const education = profile.education[0];
  return (
    <section className="section capabilities" id="approach" aria-labelledby="approach-heading" data-sc-act="capabilities">
      <div className="wrap">
        <div className="section-head section-head--split">
          <h2 id="approach-heading">What I bring to a team.</h2>
          <p className="lede">Forward deployed work on top of eleven years of quality engineering: I find the problem with the people who have it, then build and prove the fix.</p>
        </div>
        <ol className="cap-grid">
          {capabilities.map(([title, text], i) => (
            <li key={title}><span className="num">{String(i + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{text}</p></li>
          ))}
        </ol>
        <div className="toolkit">
          <h3 className="label">Tools I use</h3>
          <dl className="toolkit-grid">
            {profile.skillGroups.map((group) => <div key={group.label}><dt>{group.label}</dt><dd><Tags items={group.items} label={group.label} /></dd></div>)}
          </dl>
          <p className="toolkit-foot">
            {profile.verifiedCredentials.length} verified credentials from {issuers.slice(0, -1).join(", ")} and {issuers.at(-1)}.{" "}
            {education && <>{education.credential} in {education.field}. </>}
            <a className="link-arrow" href={href("experience/#learning")}>See the credentials<ArrowUpRight /></a>
          </p>
        </div>
      </div>
    </section>
  );
}
