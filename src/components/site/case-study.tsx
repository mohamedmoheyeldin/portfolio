import { useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check } from "@untitledui/icons";
import { Tabs } from "@/components/application/tabs/tabs";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { formatCareerDate, profile as careerProfile, veteransAffairsName } from "@/lib/career";
import { DepthNote, Page } from "./chrome";
import { type Chapter, type Depth, type Project, caseStudyHref, evidenceSource, href, metricLabel, projectDisplayName, roleFor } from "./shared";

function EndCustomer({ customer }: { customer: string }) {
  return customer === veteransAffairsName
    ? <a href="https://en.wikipedia.org/wiki/United_States_Department_of_Veterans_Affairs">{veteransAffairsName}</a>
    : <>{customer}</>;
}

/** One case-study section. Standalone pages number it as a chapter and give it a reading depth; the embedded panel does neither. */
function Part({ id, number, title, embedded, detail, children }: { id: string; number: number; title: string; embedded: boolean; detail?: Exclude<Depth, "brief">; children: ReactNode }) {
  return (
    <section id={id} tabIndex={-1} className={embedded ? "case-part" : "chapter case-part"} aria-labelledby={`${id}-heading`} data-anchor={embedded ? undefined : true} data-detail={embedded ? undefined : detail}>
      {!embedded && <p className="chapter-number" aria-hidden="true">{number}</p>}
      <h2 id={`${id}-heading`}>{title}</h2>
      {children}
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
  const n = (id: string) => chapters.findIndex((chapter) => chapter.id === id);
  const challenge = <Part id={embedded ? "project-details-overview" : "challenge"} number={n("challenge")} title={embedded ? "The challenge" : "The problem"} embedded={embedded} detail="standard">
      <p>{project.challenge}</p>
      <p><strong>Who needed it:</strong> {project.audience}</p>
    </Part>;
  const approach = <Part id={embedded ? "project-details-implementation" : "approach"} number={n("approach")} title="What I did" embedded={embedded} detail="standard">
      <ol className="steps">{project.approach.map((step) => <li key={step}>{step}</li>)}</ol>
    </Part>;
  const outcome = <Part id="outcome" number={n("outcome")} title={embedded ? "My contribution and results" : "What changed"} embedded={embedded}>
      {project.metric && <p className="case-metric"><strong>{project.metric.value}</strong> <span>{metricLabel(project)}</span></p>}
      <p>{project.outcome}</p>
      <ul className="checks" data-detail={embedded ? undefined : "full"}>{project.highlights.map((highlight) => <li key={highlight}><Check aria-hidden="true" />{highlight}</li>)}</ul>
    </Part>;
  const systems = <Part id="systems" number={n("systems")} title="Systems and trade-offs" embedded={embedded} detail="full">
      {project.systems.map((text) => <p key={text}>{text}</p>)}
      <h3>Constraints and trade-offs</h3>
      <ul className="plain-list">{project.decisions.map((text) => <li key={text}>{text}</li>)}</ul>
    </Part>;
  const evidence = <Part id={embedded ? "project-details-evidence" : "evidence"} number={n("evidence")} title="What you can check" embedded={embedded}>
      <p className="evidence-tag"><span className="evidence-rule" aria-hidden="true" />Evidence: {evidenceSource(project)}</p>
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
  const toolkit = <Part id="toolkit" number={n("toolkit")} title="Tools used" embedded={embedded}>
      <ul className="tags">{project.technologies.map((item) => <li key={item}><Badge color="gray" size="md">{item}</Badge></li>)}</ul>
    </Part>;
  const walkthroughPart = walkthrough && <Part id="walkthrough" number={n("walkthrough")} title="How a content change reaches the site" embedded={embedded} detail="standard">
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
        <header className="title-page title-page-case" id="introduction" data-anchor>
          <a className="back-link" href={href("experience/")}><ArrowLeft aria-hidden="true" />All projects</a>
          <p className="title-kicker">{project.kind === "career" ? "Work project" : "Independent project"} · {project.period}</p>
          <h1 id="title-heading">{project.name}</h1>
          <p className="title-dek">{project.description}</p>
          <dl className="imprint">
            <div><dt>My role</dt><dd>{project.role}</dd></div>
            <div><dt>Context</dt><dd>{project.context}</dd></div>
            {role ? <>
              <div><dt>Employer</dt><dd>{role.employer}, {role.professionalTitle ?? role.title}</dd></div>
              {role.customer && <div><dt>End customer</dt><dd><EndCustomer customer={role.customer} /></dd></div>}
            </> : <div><dt>Built by</dt><dd>Designed and developed by {careerProfile.name}</dd></div>}
            <div><dt>Evidence</dt><dd>{evidenceSource(project)}</dd></div>
          </dl>
          {repositoryLink && <div className="title-actions">{repositoryLink}</div>}
          {project.repositoryVisibility === "private" && <p>Private source. GitHub access requires repository permission.</p>}
          <DepthNote />
        </header>
        {challenge}{approach}{outcome}{systems}{evidence}{toolkit}{walkthroughPart}
        <div className="shell-reading">{disclosure}</div>
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
    <nav className="pager" aria-label="More projects">
      <a href={caseStudyHref(previous)} rel="prev"><span>Previous project</span><strong><ArrowLeft aria-hidden="true" />{projectDisplayName(previous)}</strong></a>
      <a href={caseStudyHref(next)} rel="next"><span>Next project</span><strong>{projectDisplayName(next)}<ArrowRight aria-hidden="true" /></strong></a>
    </nav>
  );
}
