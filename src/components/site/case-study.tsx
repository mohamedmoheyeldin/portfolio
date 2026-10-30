import { useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check } from "@untitledui/icons";
import { Tabs } from "@/components/application/tabs/tabs";
import { Button } from "@/components/base/buttons/button";
import { formatCareerDate, profile as careerProfile, veteransAffairsName } from "@/lib/career";
import { Page } from "./chrome";
import { GeneratorDemo, RulesDemo } from "./demos";
import { PipelineFigure } from "./home";
import { type Evidence, Fact } from "./inspect";
import { type Chapter, type Project, caseStudyHref, evidenceSource, href, metricLabel, projectDisplayName, projectNumber, roleFor } from "./shared";

function EndCustomer({ customer }: { customer: string }) {
  return customer === veteransAffairsName
    ? <a href="https://en.wikipedia.org/wiki/United_States_Department_of_Veterans_Affairs">{veteransAffairsName}</a>
    : <>{customer}</>;
}

/** One case-study section. Standalone pages set the heading in the left column beside the text; the embedded panel stacks them. */
function Part({ id, title, embedded, children }: { id: string; title: string; embedded: boolean; children: ReactNode }) {
  if (embedded) return (
    <section id={id} tabIndex={-1} className="case-part" aria-labelledby={`${id}-heading`}>
      <h2 id={`${id}-heading`}>{title}</h2>
      {children}
    </section>
  );
  return (
    <section id={id} tabIndex={-1} className="sec case-part" aria-labelledby={`${id}-heading`}>
      <div className="wb-container case-grid">
        <h2 id={`${id}-heading`}>{title}</h2>
        <div className="case-body">{children}</div>
      </div>
    </section>
  );
}

export function CaseStudy({ project, embedded = false, interactive = false, onSelectProject }: {
  project: Project; embedded?: boolean; interactive?: boolean; onSelectProject?: (slug: string) => void;
}) {
  const [section, setSection] = useState("overview");
  const role = roleFor(project);
  const name = projectDisplayName(project);
  const walkthrough = project.slug === "portfolio-career-content-system";
  const evidenceKind = evidenceSource(project) as Evidence;
  const path = (field: string) => `projects.${project.slug}.${field}`;
  const chapters: Chapter[] = [
    { id: "introduction", label: "Introduction" },
    { id: "challenge", label: "The problem" },
    { id: "approach", label: "What I did" },
    { id: "outcome", label: "What changed" },
    { id: "systems", label: "Systems and trade-offs" },
    { id: "evidence", label: "Evidence" },
    { id: "toolkit", label: "Tools used" },
    ...(walkthrough ? [{ id: "walkthrough", label: "Walkthrough" }] : []),
  ];
  const challenge = <Part id={embedded ? "project-details-overview" : "challenge"} title={embedded ? "The challenge" : "The problem"} embedded={embedded}>
      <Fact as="p" path={path("challenge")} evidence={evidenceKind}>{project.challenge}</Fact>
      <p><strong>Who needed it:</strong> {project.audience}</p>
    </Part>;
  const approach = <Part id={embedded ? "project-details-implementation" : "approach"} title="What I did" embedded={embedded}>
      <ol className="steps">{project.approach.map((step) => <li key={step}>{step}</li>)}</ol>
      {!embedded && project.slug === "claims-document-assistant" && <><PipelineFigure /><RulesDemo level={3} /></>}
      {!embedded && project.slug === "ccrs-test-data-tooling" && <GeneratorDemo level={3} />}
    </Part>;
  const outcome = <Part id="outcome" title={embedded ? "My contribution and results" : "What changed"} embedded={embedded}>
      {project.metric && <p className="case-metric"><Fact as="strong" path={path("metric.value")} evidence={evidenceKind}>{project.metric.value}</Fact> <span>{metricLabel(project)}</span></p>}
      <Fact as="p" path={path("outcome")} evidence={evidenceKind}>{project.outcome}</Fact>
      <ul className="checks">{project.highlights.map((highlight) => <li key={highlight}><Check aria-hidden="true" />{highlight}</li>)}</ul>
    </Part>;
  const systems = <Part id="systems" title="Systems and trade-offs" embedded={embedded}>
      {project.systems.map((text) => <p key={text}>{text}</p>)}
      <h3>Constraints and trade-offs</h3>
      <ul className="plain-list">{project.decisions.map((text) => <li key={text}>{text}</li>)}</ul>
    </Part>;
  const evidence = <Part id={embedded ? "project-details-evidence" : "evidence"} title="What you can check" embedded={embedded}>
      <p className="case-evidence">Evidence: <span className="evidence-chip" data-evidence={evidenceKind}>{evidenceKind}</span></p>
      <dl className="evidence-list">
        {project.evidence.map((item) => <div key={item.label}>
          <dt>{item.href ? <a href={item.href}>{item.label}<ArrowUpRight aria-hidden="true" className="inline size-4 align-[-3px]" /></a> : item.label}</dt>
          <dd>{item.detail}</dd>
        </div>)}
      </dl>
      <h3>Why it matters for FDE work</h3>
      <p>{project.relevance}</p>
      {project.relatedProjects.length > 0 && <>
        <h3>Related work</h3>
        <ul className="plain-list">
          {project.relatedProjects.map((related) => <li key={related.slug}><a href={href(`experience/${related.slug}/`)} onClick={(event) => {
            if (!interactive || !onSelectProject || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
            event.preventDefault(); onSelectProject(related.slug);
          }}>{related.label}</a></li>)}
        </ul>
      </>}
    </Part>;
  const toolkit = <Part id="toolkit" title="Tools used" embedded={embedded}>
      <ul className="tags">{project.technologies.map((item) => <li key={item}>{item}</li>)}</ul>
    </Part>;
  const walkthroughPart = walkthrough && <Part id="walkthrough" title="How a content change reaches the site" embedded={embedded}>
      <ol className="steps steps-titled">
        {[
          ["Edit the data", "Content lives in src/content/career.json. Required fields and unique project slugs are checked before a build."],
          ["Render the pages", "React builds the pages from that record using free Untitled UI components. The HTML is generated ahead of time, so the project pages are readable without JavaScript."],
          ["Generate the resumes", "pnpm resume:generate builds every resume format from the same record, using the site’s font and blue theme."],
          ["Check and build", "pnpm verify checks types, content, the production build, and GitHub Pages paths. pnpm build:cloudflare rebuilds for the root path."],
          ["Deploy", "wrangler.jsonc points Cloudflare Static Assets at dist. Merging to main starts the production build."],
        ].map(([title, text]) => <li key={title}><strong>{title}.</strong> {text}</li>)}
      </ol>
      <p>This site has no runtime API or database. My API and integration work is described in the work projects.</p>
    </Part>;
  const repositoryLink = project.repository && (
    <Button href={project.repository} color="secondary" iconTrailing={ArrowUpRight}>
      {project.repositoryVisibility === "private" ? "GitHub repository (private)" : "View source on GitHub"}
    </Button>
  );
  const disclosure = <p className="case-disclosure" role="note">
      {project.kind === "career"
        ? "This is based on my documented career responsibilities. I left out client-sensitive details on purpose, and I have not added numbers I can't support."
        : "I designed and built this project. The source, content model, and automated checks are in the linked repository."}
    </p>;

  if (embedded) return (
    <article className="explorer-panel case-embedded" aria-labelledby="embedded-case-heading">
      <header className="case-embedded-header">
        <h2 id="embedded-case-heading">{name}</h2>
        <p className="case-embedded-meta">
          {role ? <>{role.employer} · {role.professionalTitle ?? role.title} · {formatCareerDate(role.start)} to {formatCareerDate(role.end)}{role.customer && <> · End customer: <EndCustomer customer={role.customer} /></>}</> : <>Independent project · Designed and developed by me · {project.period}</>}
        </p>
        <div className="case-actions">
          <Button href={caseStudyHref(project)} color="secondary" iconTrailing={ArrowRight}>More about this project</Button>
          {repositoryLink}
        </div>
      </header>
      {interactive ? <Tabs selectedKey={section} onSelectionChange={(key) => setSection(String(key))}>
        <Tabs.List type="underline" aria-label="Project detail sections" items={[["overview", "Overview"], ["implementation", "Implementation"], ["evidence", "Evidence"]].map(([id, label]) => ({ id: id!, label: label! }))} />
        <Tabs.Panel id="overview" className="case-tab">{challenge}{outcome}</Tabs.Panel>
        <Tabs.Panel id="implementation" className="case-tab">{approach}{systems}{toolkit}{walkthroughPart}</Tabs.Panel>
        <Tabs.Panel id="evidence" className="case-tab">{evidence}</Tabs.Panel>
      </Tabs> : <div className="case-tab">{challenge}{approach}{outcome}{systems}{evidence}{toolkit}{walkthroughPart}</div>}
      {disclosure}
    </article>
  );

  return (
    <Page chapters={chapters}>
      <article className="case" aria-labelledby="title-heading">
        <header className="sec page-head case-head" id="introduction" data-sc-act="surface">
          <div className="wb-container">
            <a className="back-link" href={href("experience/")}><ArrowLeft aria-hidden="true" />All projects</a>
            <p className="doc-path"><code>work/{projectNumber(project)}</code><span>{project.kind === "career" ? "Work project" : "Independent project"} · {project.period}</span></p>
            <h1 id="title-heading">{project.name}</h1>
            <Fact as="p" className="page-dek" path={path("description")} evidence={evidenceKind}>{project.description}</Fact>
            {repositoryLink && <div className="page-actions">{repositoryLink}</div>}
            {project.repositoryVisibility === "private" && <p className="page-note">Private source. GitHub access requires repository permission.</p>}
            <dl className="props props-row" aria-label="Project facts">
              <div><dt>My role</dt><Fact as="dd" path={path("role")} evidence={evidenceKind}>{project.role}</Fact></div>
              <div><dt>Context</dt><dd>{project.context}</dd></div>
              {role ? <>
                <div><dt>Employer</dt><dd>{role.employer}, {role.professionalTitle ?? role.title}</dd></div>
                {role.customer && <div><dt>End customer</dt><dd><EndCustomer customer={role.customer} /></dd></div>}
              </> : <div><dt>Built by</dt><dd>Designed and developed by {careerProfile.name}</dd></div>}
              <div><dt>Evidence</dt><dd><span className="evidence-chip" data-evidence={evidenceKind}>{evidenceKind}</span></dd></div>
            </dl>
          </div>
        </header>
        {challenge}{approach}{outcome}{systems}{evidence}{toolkit}{walkthroughPart}
        <div className="wb-container">{disclosure}</div>
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
    <nav className="pager wb-container" aria-label="More projects">
      <a href={caseStudyHref(previous)} rel="prev"><span>Previous project</span><strong><ArrowLeft aria-hidden="true" />{projectDisplayName(previous)}</strong></a>
      <a href={caseStudyHref(next)} rel="next"><span>Next project</span><strong>{projectDisplayName(next)}<ArrowRight aria-hidden="true" /></strong></a>
    </nav>
  );
}
