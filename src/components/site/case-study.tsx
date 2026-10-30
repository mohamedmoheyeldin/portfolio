import type { ReactNode } from "react";
import { flows } from "@/content/flows";
import { formatCareerDate, profile as careerProfile, veteransAffairsName } from "@/lib/career";
import { Page } from "./layout";
import { type Project, caseStudyHref, evidenceSource, href, metricLabel, projectDisplayName, projectNumber, roleFor } from "./shared";
import { ArrowLeft, ArrowRight, ArrowUpRight, Label, Tags } from "./ui";

/** One case-study section held on the split: the heading and the human side left, the system side right. */
function Part({ id, title, people, systems }: { id: string; title: string; people: ReactNode; systems: ReactNode }) {
  return (
    <section className="split case-part" id={id} aria-labelledby={`${id}-heading`}>
      <div className="split-row">
        <div className="side side--people"><h2 id={`${id}-heading`}>{title}</h2>{people}</div>
        <div className="side side--systems">{systems}</div>
      </div>
    </section>
  );
}

const walkthroughSteps = [
  ["Edit the data", "Content lives in src/content/career.json. Required fields and unique project slugs are checked before a build."],
  ["Render the pages", "React renders every page to HTML at build time with a custom design system. The published site ships no React; a small script adds the theme switch, the menus and the page self-test."],
  ["Generate the resumes", "pnpm resume:generate builds every resume format from the same record."],
  ["Check and build", "pnpm verify checks types, content, the production build, and GitHub Pages paths. pnpm build:cloudflare rebuilds for the root path."],
  ["Deploy", "wrangler.jsonc points Cloudflare Static Assets at dist. Merging to main starts the production build."],
] as const;

export function CaseStudy({ project }: { project: Project }) {
  const role = roleFor(project);
  const name = projectDisplayName(project);
  const flow = flows[project.slug];
  const evidence = evidenceSource(project);
  return (
    <Page place="case">
      <article aria-labelledby="title-heading">
        <header className="split page-head">
          <div className="split-row">
            <div className="side side--people">
              <a className="back" href={href("#work")}><ArrowLeft />All work</a>
              <p className="label meta mt-6"><span>{projectNumber(project)}</span><span>{project.kind === "career" ? "Work project" : "Independent project"}</span><span>{project.period}</span></p>
              <h1 id="title-heading">{project.name}</h1>
              <p className="lede">{project.description}</p>
              {project.repository && (
                <div className="actions"><a className="btn" href={project.repository}>View source on GitHub<ArrowUpRight /></a></div>
              )}
            </div>
            <div className="side side--systems">
              <dl className="factsheet" aria-label="Project facts">
                <div><Label as="dt">My role</Label><dd>{project.role}</dd></div>
                <div><Label as="dt">Context</Label><dd>{project.context}</dd></div>
                {role ? (
                  <>
                    <div><Label as="dt">Employer</Label><dd>{role.employer}, {role.professionalTitle ?? role.title}</dd></div>
                    {role.customer && <div><Label as="dt">End customer</Label><dd>{role.customer === veteransAffairsName ? <a href="https://en.wikipedia.org/wiki/United_States_Department_of_Veterans_Affairs">{veteransAffairsName}</a> : role.customer}</dd></div>}
                    <div><Label as="dt">Dates</Label><dd>{formatCareerDate(role.start)} to {formatCareerDate(role.end)}</dd></div>
                  </>
                ) : <div><Label as="dt">Built by</Label><dd>Designed and developed by {careerProfile.name}</dd></div>}
                <div><Label as="dt">Evidence</Label><dd>{evidence}</dd></div>
              </dl>
            </div>
          </div>
        </header>

        <Part id="challenge" title="The problem"
          people={<div className="prose"><p>{project.challenge}</p><p><strong>Who needed it:</strong> {project.audience}</p></div>}
          systems={flow ? (
            <figure>
              <Label>How it works</Label>
              <ol className="flow mt-4" aria-label={`${name}: how it works`}>
                {flow.steps.map((step) => <li className="flow-step" key={step.title}><div className="flow-card"><strong>{step.title}</strong><span>{step.text}</span></div></li>)}
              </ol>
              {flow.beside && <div className="flow-side">{flow.beside.map((note) => <p key={note.title}><strong>{note.title}.</strong> {note.text}</p>)}</div>}
              <figcaption className="figure-note muted">{flow.caption}</figcaption>
            </figure>
          ) : (
            <><Label>The systems involved</Label><ul className="bullets mt-4">{project.systems.map((text) => <li key={text}>{text}</li>)}</ul></>
          )} />

        <Part id="approach" title="What I did"
          people={<div className="prose"><p>{project.relevance}</p></div>}
          systems={<ol className="steps">{project.approach.map((step) => <li key={step}>{step}</li>)}</ol>} />

        <Part id="outcome" title="What changed"
          people={<div className="prose"><p>{project.outcome}</p><ul>{project.highlights.map((h) => <li key={h}>{h}</li>)}</ul></div>}
          systems={
            <>
              {project.metric && (
                <div className="result mt-0">
                  <Label>Result</Label>
                  <p className="result-value">{project.metric.value}</p>
                  <p className="result-label">{metricLabel(project)}</p>
                  <span className={`label evidence-tag${evidence === "User-reported" ? " evidence-tag--reported" : ""}`}>{evidence}</span>
                </div>
              )}
              <Label>What you can check</Label>
              <ul className="evidence-list mt-3">
                {project.evidence.map((item) => (
                  <li key={item.label}>
                    <h3>{item.href ? <a className="link-arrow" href={item.href}>{item.label}<ArrowUpRight /></a> : item.label}</h3>
                    <p>{item.detail}</p>
                  </li>
                ))}
              </ul>
            </>
          } />

        <Part id="systems" title="Systems and trade-offs"
          people={<><Label>Constraints and decisions</Label><ul className="bullets mt-4">{project.decisions.map((text) => <li key={text}>{text}</li>)}</ul></>}
          systems={<><Label>How the pieces fit</Label><ul className="bullets mt-4">{project.systems.map((text) => <li key={text}>{text}</li>)}</ul></>} />

        <Part id="toolkit" title="Tools and related work"
          people={project.relatedProjects.length > 0
            ? <ul className="bullets mt-5">{project.relatedProjects.map((related) => <li key={related.slug}><a href={href(`experience/${related.slug}/`)}>{related.label}</a></li>)}</ul>
            : <p className="muted mt-5">{project.kind === "career"
                ? "Based on my documented career responsibilities. Client-sensitive details are left out on purpose, and no numbers are added that I can't support."
                : "I designed and built this project. The source, content model, and automated checks are in the linked repository."}</p>}
          systems={<Tags items={project.technologies} />} />

        {project.slug === "portfolio-career-content-system" && (
          <Part id="walkthrough" title="How a content change reaches the site"
            people={<p className="muted mt-5">This site has no runtime API or database. My API and integration work is described in the work projects.</p>}
            systems={<ol className="steps">{walkthroughSteps.map(([title, text]) => <li key={title}><span><strong>{title}.</strong> {text}</span></li>)}</ol>} />
        )}
      </article>
      <ProjectPager project={project} />
    </Page>
  );
}

function ProjectPager({ project }: { project: Project }) {
  const projects = careerProfile.projects;
  const index = projects.findIndex((item) => item.slug === project.slug);
  const previous = projects[(index - 1 + projects.length) % projects.length]!;
  const next = projects[(index + 1) % projects.length]!;
  return (
    <nav className="wrap section pager" aria-label="More projects">
      <a href={caseStudyHref(previous)} rel="prev"><span className="label">Previous project</span><strong>{projectDisplayName(previous)}</strong></a>
      <a className="next" href={caseStudyHref(next)} rel="next"><span className="label">Next project</span><strong>{projectDisplayName(next)} <ArrowRight className="inline-icon" /></strong></a>
    </nav>
  );
}
