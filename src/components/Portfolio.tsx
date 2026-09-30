import { useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  Check,
  Code02,
  LayersTwo01,
  GitBranch01,
  Download01,
  Mail01,
  SearchLg,
  File06,
  ShieldTick,
} from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Badge } from "@/components/base/badges/badges";
import { Input } from "@/components/base/input/input";
import { ButtonGroup, ButtonGroupItem } from "@/components/base/button-group/button-group";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { NavItemBase } from "@/components/application/app-navigation/base-components/nav-item";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import type { getCareerProfile } from "@/lib/career";

type Profile = Awaited<ReturnType<typeof getCareerProfile>>;
type Project = Profile["projects"][number];
const email = "mailto:mohamedmoheyeldin.jobs@gmail.com";
const root = `${import.meta.env.BASE_URL.replace(/\/?$/, "")}/`;
const href = (path = "") => `${root}${path}`;
const date = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }).format(new Date(`${value}-01T00:00:00Z`))
    : "Present";

function CompanyLogo({ company }: { company: string }) {
  const logos: Record<string, string> = {
    "Booz Allen Hamilton": "booz-allen-hamilton",
    "Chick-fil-A": "chick-fil-a",
    "Chick-fil-A Corporate": "chick-fil-a",
    "Ally Bank": "ally-bank",
  };
  const logo = logos[company];
  if (!logo) return null;
  return <span className={`company-logo company-logo--${logo}`}><img src={href(`images/companies/${logo}.png`)} alt={`${company} logo`} loading="lazy" /></span>;
}

export function Header({ name, location, path }: { name: string; location: string; path: string }) {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <div className="header-brand">
          <Button color="link-gray" size="lg" href={root} aria-label={`${name}, home`}>
            {name}
          </Button>
          <span className="wordmark-caption">Forward Deployed Engineer</span>
          <span className="header-location">Location: {location}</span>
        </div>
        <nav aria-label="Primary navigation">
          <NavItemBase type="link"
            href={href("work/")}
            current={path.includes("/work")}
          >
            Work
          </NavItemBase>
          <NavItemBase type="link"
            href={href("about/")}
            current={path.includes("/about")}
          >
            About
          </NavItemBase>
          <NavItemBase type="link"
            href={href("resume/")}
            current={path.includes("/resume")}
          >
            Resume
          </NavItemBase>
        </nav>
        <div className="header-contact">
          <Button
            href={email}
            color="secondary"
            size="sm"
            iconTrailing={ArrowUpRight}
          >
            Let’s talk
          </Button>
        </div>
      </div>
    </header>
  );
}

export function Footer({ name }: { name: string }) {
  return (
    <footer className="site-footer">
      <div className="shell footer-top">
        <div>
          <Button color="link-gray" size="lg" href={root}>
            {name}
          </Button>
          <p>Thoughtful systems. Dependable software.</p>
        </div>
        <div className="footer-links">
          <Button color="link-gray" href={href("work/")}>Work</Button>
          <Button color="link-gray" href={href("about/")}>About</Button>
          <Button color="link-gray" href={href("resume/")}>Resume</Button>
          <Button color="link-gray" href="https://www.linkedin.com/in/moheyeldin/" iconTrailing={ArrowUpRight}>LinkedIn</Button>
          <Button color="link-gray" href="https://github.com/mohamedmoheyeldin" iconTrailing={ArrowUpRight}>GitHub</Button>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>
          © {new Date().getFullYear()} {name}
        </span>
        <Button color="link-gray" href={href("work/portfolio-career-content-system/")} iconTrailing={ArrowUpRight}>
          Designed & developed by me
        </Button>
      </div>
      <p className="shell trademark-notice">Company names and logos are the property of their respective owners and are used only to identify my professional experience. This personal portfolio is not sponsored or endorsed by these organizations. Views expressed are my own and do not represent those of any employer or client.</p>
    </footer>
  );
}

function Tags({ items }: { items: string[] }) {
  return (
    <div className="tags">
      {items.map((item) => (
        <Badge key={item} color="gray" size="sm">
          {item}
        </Badge>
      ))}
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="project-card">
      <FeaturedIcon icon={project.kind === "independent" ? Code02 : LayersTwo01} color="brand" theme="light" size="lg" />
      <div className="project-card-body">
        <div className="card-kicker">
          <span>
            {project.kind === "independent"
              ? "INDEPENDENT PROJECT"
              : project.context.toUpperCase()}
          </span>
          <span>{project.period}</span>
        </div>
        <h3>
          <Button color="link-gray" className="w-full justify-between text-left text-xl whitespace-normal" href={href(`work/${project.slug}/`)} iconTrailing={ArrowUpRight}>
            {project.name}
          </Button>
        </h3>
        <p>{project.description}</p>
        <Tags items={project.technologies.slice(0, 4)} />
      </div>
    </article>
  );
}

function orderedProjects(projects: Project[]) {
  return [...projects].sort(
    (a, b) =>
      Number(b.kind === "independent") - Number(a.kind === "independent"),
  );
}

export function Home({ profile }: { profile: Profile }) {
  return (
    <>
      <section className="shell home-hero">
        <div className="hero-copy">
          <h1>
            From complex problems to <span>working software.</span>
          </h1>
          <p>
            I’m Mohamed. I build practical software, connect APIs and systems,
            and turn complex requirements into solutions teams can use.
          </p>
          <div className="hero-buttons">
            <Button href={href("work/")} size="xl" iconTrailing={ArrowRight}>
              Explore my work
            </Button>
            <Button
              href={href("resume/")}
              color="secondary"
              size="xl"
              iconLeading={File06}
            >
              View resume
            </Button>
          </div>
        </div>
      </section>
      <section className="experience-strip">
        <div className="shell">
          <span>
            Experience across
            <br />
            <strong>complex delivery environments</strong>
          </span>
          <CompanyLogo company="Booz Allen Hamilton" />
          <CompanyLogo company="Chick-fil-A" />
          <CompanyLogo company="Ally Bank" />
        </div>
      </section>
      <section className="section shell">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">Selected work</p>
            <h2>Real problems. Thoughtful solutions.</h2>
            <p>
              A look at the systems I’ve built and the decisions behind them.
            </p>
          </div>
          <Button
            href={href("work/")}
            color="secondary"
            iconTrailing={ArrowRight}
          >
            View all work
          </Button>
        </div>
        <div className="project-grid">
          {orderedProjects(profile.projects)
            .slice(0, 2)
            .map((p) => (
              <ProjectCard key={p.slug} project={p} />
            ))}
        </div>
      </section>
      <section className="expertise-section">
        <div className="section shell">
          <p className="eyebrow">What I bring</p>
          <h2>Build it. Connect it. Make it work.</h2>
          <p className="section-intro">
            I bring implementation, integration, and troubleshooting together
            to solve problems across software and delivery environments.
          </p>
          <div className="expertise-grid">
            {[
              {
                icon: Code02,
                title: "APIs, tools, and integrations",
                text: "API integrations, data-provisioning utilities, and automation that connect systems and make complex workflows repeatable.",
              },
              {
                icon: GitBranch01,
                title: "Cloud and delivery systems",
                text: "GitHub Actions pipelines, AWS environments, and diagnostics that help teams deploy, investigate, and improve their software.",
              },
              {
                icon: LayersTwo01,
                title: "Hands-on technical leadership",
                text: "Practical standards, thoughtful code review, and mentoring grounded in experience leading five automation engineers.",
              },
            ].map(({ icon: Icon, title, text }) => (
              <article key={title}>
                <FeaturedIcon icon={Icon} color="brand" theme="light" size="lg" />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="section shell about-teaser">
        <div>
          <p className="eyebrow">How I work</p>
          <h2>
            An engineer who cares
            <br />
            about the whole experience.
          </h2>
        </div>
        <div>
          <p>
            Over 10 years in federal, e-commerce, and banking environments have
            shaped how I approach software: understand the problem, build a
            clear system, and make the result easy to trust.
          </p>
          <p>
            This portfolio follows the same idea. I designed and developed it as
            a working example of my approach to engineering.
          </p>
          <Button
            href={href("about/")}
            color="link-color"
            iconTrailing={ArrowRight}
          >
            More about me
          </Button>
        </div>
      </section>
      <Contact />
    </>
  );
}

export function Work({ profile }: { profile: Profile }) {
  const [filter, setFilter] = useState("All work");
  const [query, setQuery] = useState("");
  const projects = orderedProjects(profile.projects).filter(
    (p) =>
      (filter === "All work" ||
        (filter === "Independent projects"
          ? p.kind === "independent"
          : p.kind === "career")) &&
      `${p.name} ${p.description} ${p.technologies.join(" ")}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <>
      <section className="page-hero shell">
        <p className="eyebrow">Work & case studies</p>
        <h1>
          Built with purpose.
          <br />
          <span>Backed by practice.</span>
        </h1>
        <p>
          Explore the architecture, decisions, and engineering behind my
          work—from quality systems to the website you’re browsing.
        </p>
      </section>
      <section className="shell work-section" aria-labelledby="work-title">
        <h2 id="work-title" className="work-heading">
          Real delivery problems. Traceable engineering decisions.
        </h2>
        <div className="work-toolbar">
          <div className="filters">
          <ButtonGroup size="sm" aria-label="Filter projects" disallowEmptySelection selectedKeys={new Set([filter])}
            onSelectionChange={(keys) => setFilter(String([...keys][0] ?? "All work"))}>
            {["All work", "Independent projects", "Career case studies"].map(
              (f) => (
                <ButtonGroupItem
                  key={f}
                  id={f}
                  aria-label={f}
                >
                  <span className="sm:hidden">{f === "Independent projects" ? "Independent" : f === "Career case studies" ? "Career" : f}</span>
                  <span className="hidden sm:inline">{f}</span>
                </ButtonGroupItem>
              ),
            )}
          </ButtonGroup>
          </div>
          <div className="project-search">
            <Input
              aria-label="Search projects"
              placeholder="Search projects"
              icon={SearchLg}
              value={query}
              onChange={setQuery}
            />
          </div>
        </div>
        <p className="result-count" aria-live="polite">
          {projects.length} {projects.length === 1 ? "project" : "projects"}
        </p>
        {projects.length ? (
          <div className="project-grid">
            {projects.map((p) => (
              <ProjectCard key={p.slug} project={p} />
            ))}
          </div>
        ) : (
          <EmptyState className="py-16" size="lg">
            <EmptyState.Header><EmptyState.FeaturedIcon color="gray" icon={SearchLg} /></EmptyState.Header>
            <EmptyState.Content>
            <EmptyState.Title>No matching projects</EmptyState.Title>
            <EmptyState.Description>Try a different keyword or clear your filters.</EmptyState.Description>
            </EmptyState.Content>
            <EmptyState.Footer>
            <Button
              color="secondary"
              onClick={() => {
                setFilter("All work");
                setQuery("");
              }}
            >
              Clear filters
            </Button>
            </EmptyState.Footer>
          </EmptyState>
        )}
        <div className="disclosure">
          <ShieldTick />
          <p>
            Career case studies describe documented responsibilities.
            Client-sensitive details are generalized. The independent portfolio
            project has public source code.
          </p>
        </div>
      </section>
      <Contact />
    </>
  );
}

export function SkillGroups({ profile }: { profile: Profile }) {
  return (
    <div className="skill-grid">
      {profile.skillGroups.map((g) => (
        <article key={g.label}>
          <h3>{g.label}</h3>
          <Tags items={g.items} />
        </article>
      ))}
    </div>
  );
}
export function Experience({ profile }: { profile: Profile }) {
  return (
    <div className="timeline">
      {profile.experience.map((role) => (
        <article className="timeline-item" key={role.employer}>
          <div className="timeline-meta">
            <span>
              {date(role.start)} — {date(role.end)}
            </span>
            <span>{role.location}</span>
          </div>
          <div>
            <CompanyLogo company={role.employer} />
            <p className="eyebrow">{role.employer}</p>
            <h3>{role.professionalTitle ?? role.title}</h3>
            <p>{role.summary}</p>
            <details>
              <NavItemBase type="collapsible" truncate={false}>Explore responsibilities</NavItemBase>
              <ul>
                {role.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </details>
          </div>
        </article>
      ))}
    </div>
  );
}

export function About({ profile }: { profile: Profile }) {
  return (
    <>
      <section className="page-hero shell about-hero">
        <div>
          <p className="eyebrow">About Mohamed</p>
          <h1>
            Curious by nature.
            <br />
            <span>Engineer by practice.</span>
          </h1>
          <p>
            I’m an engineer based in Reston, Virginia, focused on forward deployed
            work: understanding the problem, building the solution, and helping
            teams put it to use.
          </p>
          <Button href={email} color="secondary" iconLeading={Mail01}>
            Get in touch
          </Button>
        </div>
      </section>
      <section className="section shell story-grid">
        <div>
          <p className="eyebrow">My approach</p>
          <h2>
            Make the complex
            <br />
            feel clear.
          </h2>
        </div>
        <div>
          {profile.detailedSummary.map((p) => (
            <p key={p}>{p}</p>
          ))}
          <p>
            I also designed and developed this portfolio. It brings together the
            same things I value in my daily work: clear architecture, useful
            automation, accessible interfaces, and maintainable content.
          </p>
        </div>
      </section>
      <section className="section shell">
        <p className="eyebrow">Experience</p>
        <h2>A decade of building confidence.</h2>
        <Experience profile={profile} />
      </section>
      <section className="section shell">
        <p className="eyebrow">Core expertise</p>
        <h2>The tools behind the work.</h2>
        <SkillGroups profile={profile} />
      </section>
      <section className="section shell story-grid">
        <div>
          <p className="eyebrow">Always learning</p>
          <h2>A foundation to build on.</h2>
        </div>
        <div>
          {profile.education.map((e) => (
            <p key={e.institution}>
              <strong>
                {e.credential} in {e.field}
              </strong>
              <br />
              {e.institution} · {e.end.slice(0, 4)}
            </p>
          ))}
          <ul className="plain-list">
            {profile.credentials.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      </section>
      <Contact />
    </>
  );
}

export function Resume({ profile }: { profile: Profile }) {
  return (
    <>
      <section className="page-hero shell">
        <p className="eyebrow">Resume library</p>
        <h1>
          Two resumes. One
          <br />
          <span>consistent career story.</span>
        </h1>
        <p>
          A concise introduction or the full technical picture. Choose the
          format that works for your conversation.
        </p>
      </section>
      <section className="shell resume-choices" aria-label="Resume downloads">
        {[
          {
            id: "one-page",
            label: "The introduction",
            title: "One-page resume",
            text: "A focused overview for recruiters, applications, and first conversations.",
            items: [
              "Professional summary and core capabilities",
              "Experience across all three roles",
              "Automation, API, and delivery toolkit",
            ],
          },
          {
            id: "detailed",
            label: "The full picture",
            title: "Detailed resume",
            text: "The complete technical record for a deeper look at my experience.",
            items: [
              "Expanded responsibilities and delivery context",
              "Complete engineering and quality toolkit",
              "Leadership, cloud, and CI/CD practices",
            ],
          },
        ].map((r) => (
          <article className="resume-choice" key={r.id}>
            <FeaturedIcon icon={File06} color="brand" theme="light" size="lg" />
            <p className="eyebrow">{r.label}</p>
            <h2>{r.title}</h2>
            <p>{r.text}</p>
            <ul>
              {r.items.map((item) => (
                <li key={item}>
                  <Check />
                  {item}
                </li>
              ))}
            </ul>
            <div className="resume-downloads">
              <Button
                href={href(`resume/mohamed-moheyeldin-resume-${r.id}.pdf`)}
                download
                iconLeading={Download01}
              >
                Download PDF
              </Button>
              <Button
                color="secondary"
                href={href(`resume/mohamed-moheyeldin-resume-${r.id}.docx`)}
                download
              >
                Download Word
              </Button>
            </div>
          </article>
        ))}
      </section>
      <section className="section shell">
        <p className="eyebrow">Professional profile</p>
        <h2>{profile.name}</h2>
        <p className="resume-summary">{profile.summary}</p>
        <Experience profile={profile} />
      </section>
      <section className="section shell">
        <p className="eyebrow">Core expertise</p>
        <h2>Engineering toolkit.</h2>
        <SkillGroups profile={profile} />
      </section>
      <Contact />
    </>
  );
}

export function CaseStudy({ project }: { project: Project }) {
  return (
    <>
      <article>
        <header className="case-hero shell">
          <Button
            href={href("work/")}
            color="link-gray"
            iconLeading={ArrowLeft}
          >
            All case studies
          </Button>
          <div className="case-badge">
            <Badge color="brand">
              {project.kind === "independent"
                ? "Independent project · Public source"
                : "Career case study"}
            </Badge>
          </div>
          <h1>{project.name}</h1>
          <p>{project.description}</p>
          <dl className="case-facts">
            <div>
              <dt>My role</dt>
              <dd>{project.role}</dd>
            </div>
            <div>
              <dt>Context</dt>
              <dd>{project.context}</dd>
            </div>
            <div>
              <dt>Period</dt>
              <dd>{project.period}</dd>
            </div>
          </dl>
          {project.repository && (
            <Button
              href={project.repository}
              color="secondary"
              iconTrailing={ArrowUpRight}
            >
              View source on GitHub
            </Button>
          )}
        </header>
        <div className="shell case-body">
          <aside>
            <p className="eyebrow">Inside this project</p>
            <NavItemBase type="link" href="#challenge">01　The challenge</NavItemBase>
            <NavItemBase type="link" href="#approach">02　The approach</NavItemBase>
            <NavItemBase type="link" href="#outcome">03　The outcome</NavItemBase>
            <NavItemBase type="link" href="#toolkit">04　The toolkit</NavItemBase>
          </aside>
          <div>
            <section id="challenge">
              <p className="eyebrow">01 / Challenge</p>
              <h2>The delivery problem.</h2>
              <p>{project.challenge}</p>
            </section>
            <section id="approach">
              <p className="eyebrow">02 / Approach</p>
              <h2>How I shaped the system.</h2>
              <ol className="approach-list">
                {project.approach.map((s, i) => (
                  <li key={s}>
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    <p>{s}</p>
                  </li>
                ))}
              </ol>
            </section>
            <section id="outcome">
              <p className="eyebrow">03 / Outcome</p>
              <h2>What changed.</h2>
              <p>{project.outcome}</p>
              <ul className="outcomes">
                {project.highlights.map((h) => (
                  <li key={h}>
                    <Check />
                    {h}
                  </li>
                ))}
              </ul>
            </section>
            <section id="toolkit">
              <p className="eyebrow">04 / Toolkit</p>
              <h2>Tools in context.</h2>
              <Tags items={project.technologies} />
            </section>
            <div className="disclosure">
              <ShieldTick />
              <p>
                {project.kind === "career"
                  ? "This account is derived from documented career responsibilities. Client-sensitive details are intentionally generalized, and no undisclosed metrics are presented."
                  : "I designed and developed this public project. Its source, content model, and automated checks can be reviewed in the linked repository. The Untitled UI redesign is developed on the untitledui branch."}
              </p>
            </div>
          </div>
        </div>
      </article>
      <Contact />
    </>
  );
}

export function Contact() {
  return (
    <section className="contact-section">
      <div className="shell contact-inner">
        <div>
          <p className="eyebrow">Let’s build something dependable</p>
          <h2>
            Good work starts with
            <br />a conversation.
          </h2>
          <p>
            Have an integration challenge or a Forward Deployed Engineer opportunity?
            <br />
            I’d love to hear about it.
          </p>
        </div>
        <Button href={email} size="xl" iconTrailing={ArrowUpRight}>
          Let’s connect
        </Button>
      </div>
    </section>
  );
}

export function NotFound() {
  return (
    <section className="page-hero shell not-found">
      <p className="eyebrow">404 / Page not found</p>
      <h1>
        This page didn’t pass
        <br />
        <span>the existence check.</span>
      </h1>
      <p>The link may have changed. Let’s get you back to something useful.</p>
      <Button href={root} iconLeading={ArrowLeft}>
        Back to home
      </Button>
    </section>
  );
}
