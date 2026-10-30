import type { ReactNode } from "react";
import { formatCareerDate, profile as careerProfile, veteransAffairsName } from "@/lib/career";
import { checks } from "@/lib/selftest";
import { Page } from "./layout";
import { type Project, caseStudyHref, evidenceSource, href, metricLabel, projectDisplayName, projectNumber, roleFor } from "./shared";
import { ArrowLeft, ArrowRight, ArrowUpRight, EvidenceTag, GitHub, Label, Pipeline, Play, Tags } from "./ui";

/** One case-study part: the heading on the left rail, the content beside it. */
function Part({ id, title, children, tint }: { id: string; title: string; children: ReactNode; tint?: boolean }) {
  return (
    <section className={`section case-part${tint ? " section--tint" : ""}`} id={id} aria-labelledby={`${id}-heading`}>
      <div className="wrap case-grid">
        <h2 id={`${id}-heading`} className="case-title">{title}</h2>
        <div className="case-body">{children}</div>
      </div>
    </section>
  );
}

const walkthroughSteps = [
  ["Edit the data", "Content lives in src/content/career.json. Required fields and unique project slugs are checked before a build."],
  ["Render the pages", "React renders every page to HTML at build time with a custom design system. The published site ships no React; a small script adds the theme switch, the menus, the case deck guard and the page self-test."],
  ["Generate the resumes", "pnpm resume:generate builds every resume format from the same record."],
  ["Check and build", "pnpm verify checks types, content, the production build, and GitHub Pages paths. pnpm build:cloudflare rebuilds for the root path."],
  ["Deploy", "wrangler.jsonc points Cloudflare Static Assets at dist. Merging to main starts the production build."],
] as const;

export function CaseStudy({ project }: { project: Project }) {
  const role = roleFor(project);
  const name = projectDisplayName(project);
  const evidence = evidenceSource(project);
  return (
    <Page place="case">
      <article aria-labelledby="title-heading">
        <header className="page-head case-head" data-sc-act="title">
          <div className="wrap page-head-grid">
            <div>
              <a className="back" href={href("#work")}><ArrowLeft />All work</a>
              <p className="meta"><span className="num">{projectNumber(project)}</span><span>{project.kind === "career" ? "Work project" : "Independent project"}</span><span>{project.period}</span></p>
              <h1 id="title-heading">{project.name}</h1>
              <p className="lede">{project.description}</p>
              {project.repository && (
                <div className="actions"><a className="btn" href={project.repository}><GitHub />View source on GitHub<ArrowUpRight /></a></div>
              )}
            </div>
            <dl className="factsheet" aria-label="Project facts">
              <div><dt className="label">My role</dt><dd>{project.role}</dd></div>
              <div><dt className="label">Context</dt><dd>{project.context}</dd></div>
              {role ? (
                <>
                  <div><dt className="label">Employer</dt><dd>{role.employer}, {role.professionalTitle ?? role.title}</dd></div>
                  {role.customer && <div><dt className="label">End customer</dt><dd>{role.customer === veteransAffairsName ? <a href="https://en.wikipedia.org/wiki/United_States_Department_of_Veterans_Affairs">{veteransAffairsName}</a> : role.customer}</dd></div>}
                  <div><dt className="label">Dates</dt><dd>{formatCareerDate(role.start)} to {formatCareerDate(role.end)}</dd></div>
                </>
              ) : <div><dt className="label">Built by</dt><dd>Designed and developed by {careerProfile.name}</dd></div>}
              <div><dt className="label">Evidence</dt><dd>{evidence}</dd></div>
            </dl>
          </div>
          {project.metric && (
            <div className="wrap">
              <section className="case-outcome" aria-labelledby="case-outcome-heading">
                <h2 className="label" id="case-outcome-heading">The outcome</h2>
                <p className="case-outcome-value">{project.metric.value}</p>
                <div className="case-outcome-text">
                  <p>{metricLabel(project)}</p>
                  <EvidenceTag project={project} />
                </div>
                <nav className="case-outcome-jump" aria-label="Jump to">
                  <a className="link-arrow" href="#approach">How I did it<ArrowRight /></a>
                  <a className="link-arrow" href="#outcome">What changed<ArrowRight /></a>
                </nav>
              </section>
            </div>
          )}
        </header>

        <Part id="challenge" title="The problem">
          <div className="prose">
            <p>{project.challenge}</p>
            <p><strong>Who needed it:</strong> {project.audience}</p>
          </div>
        </Part>

        <Part id="approach" title="What I did" tint>
          <p className="prose">{project.relevance}</p>
          <ol className="steps">{project.approach.map((step) => <li key={step}>{step}</li>)}</ol>
          <Pipeline slug={project.slug} title={name} />
        </Part>

        <Part id="outcome" title="What changed">
          <div className="outcome-grid">
            <div className="prose">
              <p>{project.outcome}</p>
              <ul>{project.highlights.map((h) => <li key={h}>{h}</li>)}</ul>
            </div>
            {project.metric && (
              <div className="result result--panel">
                <Label>Result</Label>
                <p className="result-value">{project.metric.value}</p>
                <p className="result-label">{metricLabel(project)}</p>
                <EvidenceTag project={project} />
              </div>
            )}
          </div>
          <h3 className="label">What you can check</h3>
          <ul className="evidence-list">
            {project.evidence.map((item) => (
              <li key={item.label}>
                <h4>{item.href ? <a className="link-arrow" href={item.href}>{item.label}<ArrowUpRight /></a> : item.label}</h4>
                <p>{item.detail}</p>
              </li>
            ))}
          </ul>
        </Part>

        <Part id="systems" title="Systems and trade-offs" tint>
          <div className="two-col">
            <div><h3 className="label">How the pieces fit</h3><ul className="bullets">{project.systems.map((text) => <li key={text}>{text}</li>)}</ul></div>
            <div><h3 className="label">Constraints and decisions</h3><ul className="bullets">{project.decisions.map((text) => <li key={text}>{text}</li>)}</ul></div>
          </div>
        </Part>

        <Part id="toolkit" title="Tools and related work">
          <Tags items={project.technologies} />
          {project.relatedProjects.length > 0
            ? <ul className="related">{project.relatedProjects.map((related) => <li key={related.slug}><a className="link-arrow" href={href(`experience/${related.slug}/`)}>{related.label}<ArrowRight /></a></li>)}</ul>
            : <p className="muted">{project.kind === "career"
                ? "Based on my documented career responsibilities. Client-sensitive details are left out on purpose, and no numbers are added that I can't support."
                : "I designed and built this project. The source, content model, and automated checks are in the linked repository."}</p>}
        </Part>

        {project.slug === "portfolio-career-content-system" && (
          <>
            <Part id="walkthrough" title="How a content change reaches the site" tint>
              <p className="muted">This site has no runtime API or database. My API and integration work is described in the work projects.</p>
              <ol className="steps">{walkthroughSteps.map(([title, text]) => <li key={title}><strong>{title}.</strong> {text}</li>)}</ol>
            </Part>
            <Part id="selftest-part" title="Test this page">
              <SelfTest />
            </Part>
          </>
        )}
      </article>
      <ProjectPager project={project} />
    </Page>
  );
}

/** Real checks against the rendered page. Rows are rendered here; src/client/enhance.ts runs src/lib/selftest.ts. */
function SelfTest() {
  return (
    <div className="selftest" id="selftest">
      <div className="selftest-head">
        <p>{checks.length} checks, run in your browser against the page you are looking at. Nothing is precomputed.</p>
        <button className="btn btn--primary js-only" type="button" data-run-checks><Play /><span>Run the checks</span></button>
      </div>
      <p className="selftest-summary" role="status">
        <span className="js-only">Not run yet.</span>
        <span className="no-js-only">These checks need JavaScript to run.</span>
      </p>
      <ol className="checks" aria-label="Checks">
        {checks.map((check) => (
          <li className="check" key={check.id} data-check={check.id} data-state="pending">
            <span className="check-mark" aria-hidden="true">·</span>
            <span className="check-name">{check.name}</span>
            <span className="check-value" />
          </li>
        ))}
      </ol>
      <p className="selftest-foot muted">The checks are in <a href="https://github.com/mohamedmoheyeldin/portfolio/blob/main/src/lib/selftest.ts">src/lib/selftest.ts</a>.</p>
    </div>
  );
}

function ProjectPager({ project }: { project: Project }) {
  const projects = careerProfile.projects;
  const index = projects.findIndex((item) => item.slug === project.slug);
  const previous = projects[(index - 1 + projects.length) % projects.length]!;
  const next = projects[(index + 1) % projects.length]!;
  return (
    <nav className="wrap pager" aria-label="More projects">
      <a href={caseStudyHref(previous)} rel="prev"><span className="label">Previous project</span><strong><ArrowLeft />{projectDisplayName(previous)}</strong></a>
      <a className="next" href={caseStudyHref(next)} rel="next"><span className="label">Next project</span><strong>{projectDisplayName(next)}<ArrowRight /></strong></a>
    </nav>
  );
}
