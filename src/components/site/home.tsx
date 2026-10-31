import { signature } from "@/content/signature";
import { formatCareerDate } from "@/lib/career";
import { Page } from "./layout";
import { type Profile, type Project, caseStudyHref, gitHubUrl, href, linkedInUrl, metricLabel, projectDisplayName, projectNumber, roleEmail } from "./shared";
import { ArrowUpRight, EvidenceTag, GitHub, LinkedIn, Mail, ResumeMenu, Schematic, Tags, Thread } from "./ui";

/** The six projects in the order the page tells them. */
const order = ["federal-quality-delivery-system", "ccrs-test-data-tooling", "claims-document-assistant", "portfolio-career-content-system", "ecommerce-feedback-platform", "banking-risk-validation"];

/*
 * The thread: one teal line drawn down the whole page, a segment per section. Every segment enters at the top and
 * leaves at the bottom at x = 82 (of 100), so the pieces meet at each section edge. Paths are in a 100 by 100 box
 * stretched to the section; the stroke keeps its width. Decorative only.
 */
const threads = {
  hero: "M4,0 C4,30 30,22 52,30 C78,40 70,64 46,62 C26,60 30,40 52,44 C74,48 82,70 82,100",
  statement: "M82,0 C82,26 60,30 60,50 C60,74 94,64 94,40 C94,22 70,30 70,58 C70,80 82,84 82,100",
  system: "M82,0 C82,10 96,10 96,24 V76 C96,90 82,90 82,100",
  workHead: "M82,0 C82,40 40,40 40,70 C40,92 82,84 82,100",
  scene: ["M82,0 C82,30 70,40 30,46 C8,50 12,80 50,84 C70,86 82,90 82,100", "M82,0 C82,20 96,30 96,52 C96,74 60,60 60,80 C60,92 82,92 82,100"],
  career: "M82,0 V22 C82,30 60,30 10,30 C2,30 2,38 10,38 C60,38 82,40 82,52 V100",
  approach: "M82,0 C82,30 50,20 50,50 C50,80 82,70 82,100",
};

export function Home({ profile }: { profile: Profile }) {
  const projects = order.map((slug) => profile.projects.find((p) => p.slug === slug)!);
  return (
    <Page place="home">
      <Intro />
      <Hero profile={profile} />
      <Statement profile={profile} />
      <System />
      <Work projects={projects} />
      <Career profile={profile} />
      <Capabilities profile={profile} />
    </Page>
  );
}

/**
 * The intro: the signature writes itself over a dark screen, stroke by stroke in writing order, in about 2.8 seconds
 * with a ring on the pen tip, then lifts away. SMIL times each stroke; site.css shows the overlay only when the
 * inline script in index.html has marked a first visit this session with motion welcome, so it never runs with
 * reduced motion or without JavaScript. It never takes pointer events, and any key, click or scroll skips it.
 */
function Intro() {
  // A fixed budget: the lead-in, the letters in writing order (each stroke's share follows its curve count), then the
  // slash and the exit flourish; strokes overlap slightly so the pen never seems to stop. A ring rides the pen tip.
  const paths = signature.paths;
  const fixed: Record<number, number> = { 0: 0.4, [paths.length - 2]: 0.22, [paths.length - 1]: 0.75 };
  const weight = paths.map((d, i) => (i in fixed ? 0 : (d.match(/C/g)?.length ?? 1)));
  const total = weight.reduce((sum, w) => sum + w, 0);
  let t = 0.2;
  const strokes = paths.map((d, i) => {
    const dur = fixed[i] ?? Math.max(0.03, (weight[i]! / total) * 1.5);
    const stroke = { d, id: `sig-${i}`, begin: t.toFixed(2), dur: dur.toFixed(2) };
    t += dur * 0.92;
    return stroke;
  });
  return (
    <div className="intro" aria-hidden="true" data-intro>
      <svg className="intro-sig" viewBox={signature.viewBox} focusable="false">
        {strokes.map(({ d, id, begin, dur }) => (
          <path key={id} id={id} d={d} pathLength={1} strokeDasharray="1 2" strokeDashoffset="1.05">
            <animate attributeName="stroke-dashoffset" from="1.05" to="0" begin={`${begin}s`} dur={`${dur}s`} fill="freeze" />
          </path>
        ))}
        <circle className="intro-tip" r="3.4" cx="0" cy="0" opacity="0">
          <set attributeName="opacity" to="1" begin={`${strokes[0]!.begin}s`} />
          {strokes.map(({ id, begin, dur }) => (
            <animateMotion key={id} begin={`${begin}s`} dur={`${dur}s`} fill="freeze"><mpath href={`#${id}`} /></animateMotion>
          ))}
        </circle>
      </svg>
    </div>
  );
}

/** The opening: the claim set as large as the screen allows, on a dark ground, with the thread starting under it. */
function Hero({ profile }: { profile: Profile }) {
  const current = profile.experience[0]!;
  return (
    <section className="act act--dark hero" aria-labelledby="hero-heading" data-sc-act="hero">
      <Thread d={threads.hero} />
      <div className="wrap hero-inner">
        <p className="status"><span className="status-dot" aria-hidden="true" />Open to {profile.headline} roles</p>
        <h1 id="hero-heading">
          <span className="sr-only">{profile.name}. </span>
          <span className="poster hero-claim">
            <span className="line">I build what</span> <span className="line">users need</span> <span className="line">and test it</span> <span className="line">before they do.</span>
          </span>
        </h1>
        <div className="hero-foot">
          <p className="mono-lede">
            {profile.name}. {profile.headline} at {current.employer} on a VA healthcare claims platform, with {profile.experienceYears} years
            in software development and quality engineering.
          </p>
          <div className="actions">
            <a className="btn btn--primary btn--lg" href={roleEmail}><Mail />Email me</a>
            <ResumeMenu id="resume-menu-hero" size="lg" />
            <a className="btn btn--quiet btn--icon btn--lg" href={linkedInUrl} aria-label="LinkedIn"><LinkedIn /></a>
            <a className="btn btn--quiet btn--icon btn--lg" href={gitHubUrl} aria-label="GitHub"><GitHub /></a>
          </div>
        </div>
      </div>
    </section>
  );
}

/** The bridge: what the work is about, in one large sentence, on the light ground. */
function Statement({ profile }: { profile: Profile }) {
  return (
    <section className="act act--light statement" aria-labelledby="statement-heading" data-sc-act="statement">
      <Thread d={threads.statement} />
      <div className="wrap statement-inner" data-string-wrap>
        <h2 id="statement-heading" className="poster poster--md">
          <span className="line">From the people</span> <span className="line">who use it</span> <span className="line">to the system</span> <span className="line">behind it.</span>
        </h2>
        <p className="mono-lede">
          {profile.experienceYears} years across federal healthcare, banking and e-commerce. I sit with the people who have the problem,
          find the real one, build the fix and prove it with tests.
        </p>
      </div>
    </section>
  );
}

/** The system he works on every day: the schematic, now its own act on the dark ground. */
function System() {
  return (
    <section className="act act--dark system" aria-labelledby="system-heading" data-sc-act="system">
      <Thread d={threads.system} />
      <div className="wrap system-grid">
        <div className="system-copy">
          <p className="label label--accent">The system I work on</p>
          <h2 id="system-heading" className="poster poster--sm">Live claim status for every role.</h2>
          <p className="mono-lede">Health-provider APIs feed a VA claims platform that VA staff, providers and veterans use every day. Pick a part to read what it does.</p>
        </div>
        <Schematic />
      </div>
    </section>
  );
}

/**
 * The word set behind each project: a descriptive label for the scene, not a product name (the real name is the
 * heading). Lengths drive the fitted size in site.css ([data-len]).
 */
const sceneWord: Record<string, string> = {
  "federal-quality-delivery-system": "Claims",
  "ccrs-test-data-tooling": "Generator",
  "claims-document-assistant": "Documents",
  "portfolio-career-content-system": "Resumes",
  "ecommerce-feedback-platform": "Checks",
  "banking-risk-validation": "Releases",
};

/** Paper cards drawn over each scene word, each restating the project's documented result. Decorative: the text below says it all. */
function ScenePapers({ slug }: { slug: string }) {
  switch (slug) {
    // metric: "VA staff, providers, and veterans now see live claim status"
    case "federal-quality-delivery-system":
      return (
        <div className="papers" aria-hidden="true">
          {["VA staff", "Providers", "Veterans"].map((role, i) => (
            <div className={`paper paper--${i + 1}`} key={role}>
              <p className="paper-head"><span>Claim status</span><span>{String(i + 1).padStart(2, "0")}</span></p>
              <p className="paper-title">{role}</p>
              <p className="paper-row"><span className="live" />Live</p>
            </div>
          ))}
        </div>
      );
    // flows.ts ccrs-test-data-tooling steps and packaging (one master JSON, gzipped, SHA-256 manifest); metric: under 5 min
    case "ccrs-test-data-tooling":
      return (
        <div className="papers" aria-hidden="true">
          <div className="paper paper--1 paper--wide">
            <p className="paper-head"><span>One run</span><span>Under 5 min</span></p>
            <ol className="paper-steps">{["Template", "Generate", "Validate", "Package", "Upload"].map((step) => <li key={step}>{step}</li>)}</ol>
          </div>
          <div className="paper paper--2"><p className="paper-head"><span>Output</span></p><p className="paper-title paper-mono">master.json.gz</p></div>
          <div className="paper paper--3"><p className="paper-head"><span>Manifest</span></p><p className="paper-title paper-mono">SHA-256</p></div>
        </div>
      );
    // metric: 17 fields per claim PDF; flows.ts: rules, a person reviews (approve, escalate or reject)
    case "claims-document-assistant":
      return (
        <div className="papers" aria-hidden="true">
          <div className="paper paper--1 paper--wide">
            <p className="paper-head"><span>Claim PDF</span><span>17 fields</span></p>
            <ol className="paper-cells">{Array.from({ length: 17 }, (_, i) => <li key={i} />)}</ol>
          </div>
          <div className="paper paper--2"><p className="paper-head"><span>Rules</span></p><p className="paper-title">Checked</p></div>
          <div className="paper paper--3"><p className="paper-head"><span>Person reviews</span></p><p className="paper-chips"><span>Approve</span><span>Escalate</span><span>Reject</span></p></div>
        </div>
      );
    // metric: one-page and full, in PDF, Word and text, from one validated record
    case "portfolio-career-content-system":
      return (
        <div className="papers" aria-hidden="true">
          <div className="paper paper--1"><p className="paper-head"><span>Source</span></p><p className="paper-title paper-mono">career.json</p></div>
          {["Website", "PDF", "Word", "Text"].map((item, i) => (
            <div className={`paper paper--sheet paper--${i + 2}`} key={item}><p className="paper-head"><span>Output</span></p><p className="paper-title">{item}</p></div>
          ))}
        </div>
      );
    // metric: browser, API, visual and SSO login checks, run through GitHub Actions
    case "ecommerce-feedback-platform":
      return (
        <div className="papers" aria-hidden="true">
          <div className="paper paper--1 paper--wide">
            <p className="paper-head"><span>GitHub Actions</span><span>4 check types</span></p>
            <ul className="paper-chips">{["Browser", "API", "Visual", "SSO login"].map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
        </div>
      );
    // metric: Chrome, Firefox, Safari and Edge; release checks across development, QA, UAT and staging
    case "banking-risk-validation":
      return (
        <div className="papers" aria-hidden="true">
          <div className="paper paper--1"><p className="paper-head"><span>Browsers</span></p><ul className="paper-chips">{["Chrome", "Firefox", "Safari", "Edge"].map((item) => <li key={item}>{item}</li>)}</ul></div>
          <div className="paper paper--2 paper--wide"><p className="paper-head"><span>Release path</span></p><ol className="paper-steps">{["Dev", "QA", "UAT", "Staging"].map((item) => <li key={item}>{item}</li>)}</ol></div>
        </div>
      );
    default:
      return null;
  }
}

function Work({ projects }: { projects: Project[] }) {
  return (
    <div id="work" className="work">
      <section className="act act--light work-head" aria-labelledby="work-heading" data-sc-act="work">
        <Thread d={threads.workHead} />
        <div className="wrap work-head-inner" data-string-wrap>
          <h2 id="work-heading" className="poster poster--md"><span className="line">Six projects.</span> <span className="line">Every result</span> <span className="line">sourced.</span></h2>
          <p className="mono-lede">Each one has a case study: the problem, my part, the design and what changed. Every result says where its evidence comes from.</p>
        </div>
      </section>
      {projects.map((project, i) => {
        const name = projectDisplayName(project);
        const word = sceneWord[project.slug] ?? name;
        return (
          <section className={`act ${i % 2 ? "act--light" : "act--dark"} scene`} key={project.slug} id={`entry-${project.slug}`} aria-labelledby={`${project.slug}-title`} data-sc-act={`scene-${i + 1}`}>
            <Thread d={threads.scene[i % 2]!} />
            <div className="wrap scene-inner">
              <div className="scene-top">
                <p className="meta"><span className="num">{projectNumber(project)}</span><span>{project.period}</span><span>{project.kind === "career" ? "Work" : "Independent"}</span></p>
                <div className="scene-intro">
                  <h3 id={`${project.slug}-title`}><a href={caseStudyHref(project)}>{name}</a></h3>
                  <p>{project.description}</p>
                </div>
              </div>
              <div className="scene-stage">
                <p className="scene-word" data-len={word.length} aria-hidden="true">{word}</p>
                <ScenePapers slug={project.slug} />
              </div>
              <div className="scene-foot">
                {project.metric && (
                  <div className="result">
                    <p className="result-value">{project.metric.value}</p>
                    <p className="result-label">{metricLabel(project)}</p>
                  </div>
                )}
                <p className="scene-links">
                  <EvidenceTag project={project} />
                  {project.repository && <a className="tile-src" href={project.repository} aria-label={`Source for ${name}`}><GitHub /></a>}
                  <a className="explore" href={caseStudyHref(project)}>Case study<span className="sr-only">: {name}</span><ArrowUpRight /></a>
                </p>
              </div>
            </div>
          </section>
        );
      })}
    </div>
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
    <section className="act act--dark career" id="career" aria-labelledby="career-heading" data-sc-act="career">
      <Thread d={threads.career} />
      <div className="wrap">
        <div className="act-head" data-string-wrap>
          <h2 id="career-heading" className="poster poster--md"><span className="line">{profile.experienceYears} years.</span> <span className="line">Three teams.</span></h2>
          <p><a className="explore" href={href("experience/")}>Every role, skill and credential<ArrowUpRight /></a></p>
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
              <rect key={role.id} className={`span-seg${i === spans.length - 1 ? " is-current" : ""}`} x={`${at}%`} y="8" width={`${width}%`} height="20" rx="2" />
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

/** The two groups on the arc: forward deployed practice on the left, engineering and quality on the right. */
const arcSides = [
  { key: "left", label: "Forward deployed", items: [0, 1, 5] },
  { key: "right", label: "Engineering and quality", items: [2, 3, 4] },
] as const;

/**
 * The arc between them: two cubic curves from a top node down to each side, with a node on each curve level with each
 * capability (found by bisection on the curve at build time, so the markup carries plain numbers).
 */
const arc = (() => {
  const left = [[200, 40], [110, 40], [40, 250], [40, 590]] as const;
  const at = (c: readonly (readonly [number, number])[], t: number) => {
    const u = 1 - t;
    return [0, 1].map((k) => u * u * u * c[0]![k]! + 3 * u * u * t * c[1]![k]! + 3 * u * t * t * c[2]![k]! + t * t * t * c[3]![k]!) as [number, number];
  };
  const xAt = (y: number) => { let lo = 0, hi = 1; for (let n = 0; n < 30; n++) { const mid = (lo + hi) / 2; if (at(left, mid)[1] < y) lo = mid; else hi = mid; } return at(left, lo)[0]; };
  const ys = [150, 330, 510];
  const nodes = [...ys.map((y) => [Math.round(xAt(y)), y]), ...ys.map((y) => [400 - Math.round(xAt(y)), y])] as [number, number][];
  return { left: "C110,40 40,250 40,590", right: "C290,40 360,250 360,590", nodes };
})();

function Capabilities({ profile }: { profile: Profile }) {
  const issuers = [...new Set(profile.verifiedCredentials.map((c) => c.issuer))];
  const education = profile.education[0];
  return (
    <section className="act act--light capabilities" id="approach" aria-labelledby="approach-heading" data-sc-act="capabilities">
      <Thread d={threads.approach} />
      <div className="wrap">
        <div className="act-head" data-string-wrap>
          <h2 id="approach-heading" className="poster poster--md"><span className="line">What I bring</span> <span className="line">to a team.</span></h2>
          <p className="mono-lede">Forward deployed work on top of eleven years of quality engineering: I find the problem with the people who have it, then build and prove the fix.</p>
        </div>
        <div className="cap-arc">
          {arcSides.map((side) => (
            <div className={`cap-side cap-side--${side.key}`} key={side.key}>
              <h3 className="label label--accent">{side.label}</h3>
              <ol className="cap-list">
                {side.items.map((i) => {
                  const [title, text] = capabilities[i]!;
                  return <li key={title}><span className="num">{String(i + 1).padStart(2, "0")}</span><h4>{title}</h4><p>{text}</p></li>;
                })}
              </ol>
            </div>
          ))}
          <svg className="cap-arc-svg" viewBox="0 0 400 600" aria-hidden="true" focusable="false">
            <path className="cap-arc-path" d={`M200,0 V40 ${arc.left} M200,40 ${arc.right}`} pathLength={1} />
            <circle className="cap-node cap-node--top" cx="200" cy="40" r="6" />
            {arc.nodes.map(([x, y], i) => <g className="cap-node" key={i}><circle cx={x} cy={y} r="9" /><circle className="cap-node-dot" cx={x} cy={y} r="3.5" /></g>)}
          </svg>
        </div>
        <div className="toolkit">
          <h3 className="label">Tools I use</h3>
          <dl className="toolkit-grid">
            {profile.skillGroups.map((group) => <div key={group.label}><dt>{group.label}</dt><dd><Tags items={group.items} label={group.label} /></dd></div>)}
          </dl>
          <p className="toolkit-foot">
            {profile.verifiedCredentials.length} verified credentials from {issuers.slice(0, -1).join(", ")} and {issuers.at(-1)}.{" "}
            {education && <>{education.credential} in {education.field}. </>}
            <a className="explore" href={href("experience/#learning")}>See the credentials<ArrowUpRight /></a>
          </p>
        </div>
      </div>
    </section>
  );
}
