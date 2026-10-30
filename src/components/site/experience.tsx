import credentialImages from "@/content/credential-images.json";
import { formatCareerDate } from "@/lib/career";
import { Page } from "./layout";
import { type Profile, caseStudyHref, evidenceSource, projectDisplayName, projectNumber, roleEmail, root } from "./shared";
import { ArrowRight, ArrowUpRight, Label, Mail, ResumeMenu, Tags } from "./ui";

const sections = [["roles", "Roles"], ["projects", "Projects"], ["skills", "Skills"], ["learning", "Credentials and education"]] as const;

/** The full record: every role and highlight, the project register, skills, credentials and education. */
export function Work({ profile }: { profile: Profile }) {
  const groups = profile.verifiedCredentials.reduce<Map<string, Profile["verifiedCredentials"]>>((map, credential) => {
    map.set(credential.issuer, [...(map.get(credential.issuer) ?? []), credential]);
    return map;
  }, new Map());
  const imageFor = (credential: Profile["verifiedCredentials"][number]) =>
    credentialImages.find((asset) => (credential.href ? asset.credentialHref === credential.href : (asset as { credentialName?: string }).credentialName === credential.name));
  const slug = (issuer: string) => `issuer-${issuer.replace(/\W+/g, "-").toLowerCase()}`;

  return (
    <Page place="experience">
      <header className="page-head" data-sc-act="title">
        <div className="wrap page-head-grid">
          <div>
            <Label accent>Experience</Label>
            <h1 id="title-heading">{profile.experienceYears} years of building software, and checking it holds up.</h1>
            <p className="lede">Every role and what I did in it, the projects behind them, the tools I use, and the credentials I can show you.</p>
            <div className="actions">
              <a className="btn btn--primary btn--lg" href={roleEmail}><Mail />Email me</a>
              <ResumeMenu id="resume-menu-hero" size="lg" />
            </div>
          </div>
          <nav aria-label="On this page" className="toc">
            <p className="label">On this page</p>
            <ol>{sections.map(([id, label]) => <li key={id}><a href={`#${id}`}>{label}<ArrowRight /></a></li>)}</ol>
          </nav>
        </div>
      </header>

      <section className="section" id="roles" aria-labelledby="roles-heading">
        <div className="wrap">
          <div className="section-head"><h2 id="roles-heading">Roles</h2></div>
          <ol className="timeline timeline--full">
            {profile.experience.map((role, i) => (
              <li className={`timeline-item${i === 0 ? " is-current" : ""}`} key={role.id} id={`role-${role.id}`}>
                <p className="timeline-when"><time dateTime={role.start}>{formatCareerDate(role.start)}</time> to {role.end ? <time dateTime={role.end}>{formatCareerDate(role.end)}</time> : "now"}</p>
                <article className="timeline-body" aria-labelledby={`role-${role.id}-heading`}>
                  <h3 id={`role-${role.id}-heading`}>{role.employer}</h3>
                  <p className="where">{role.professionalTitle ?? role.title}{role.customer ? `, for the ${role.customer}` : ""} · {role.location}</p>
                  <p className="summary">{role.summary}</p>
                  <ul className="bullets">{role.highlights.map((item) => <li key={item}>{item}</li>)}</ul>
                </article>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section section--tint" id="projects" aria-labelledby="projects-heading">
        <div className="wrap">
          <div className="section-head section-head--split">
            <h2 id="projects-heading">Projects</h2>
            <p className="lede">Each one has a case study: the problem, the workflow before and after, what I did, the systems and trade-offs, and what you can check.</p>
          </div>
          <nav aria-label="Project case studies">
            <table className="project-table">
              <caption className="sr-only">Projects with role and evidence</caption>
              <thead><tr><th scope="col">Project</th><th scope="col" className="hide-sm">Role</th><th scope="col">Evidence</th></tr></thead>
              <tbody>
                {profile.projects.map((project) => (
                  <tr key={project.slug}>
                    <td><span className="num">{projectNumber(project)}</span> <a href={caseStudyHref(project)}>{projectDisplayName(project)}</a></td>
                    <td className="hide-sm">{project.role}</td>
                    <td>{evidenceSource(project)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </nav>
        </div>
      </section>

      <section className="section" id="skills" aria-labelledby="skills-heading">
        <div className="wrap">
          <div className="section-head"><h2 id="skills-heading">Skills</h2></div>
          <ul className="competencies" aria-label="Competencies">{profile.competencies.map((item) => <li key={item}>{item}</li>)}</ul>
          <dl className="toolkit-grid">
            {profile.skillGroups.map((group) => <div key={group.label}><dt>{group.label}</dt><dd><Tags items={group.items} label={group.label} /></dd></div>)}
          </dl>
        </div>
      </section>

      <section className="section section--tint" id="learning" aria-labelledby="learning-heading">
        <div className="wrap">
          <div className="section-head section-head--split">
            <h2 id="learning-heading">Credentials and education</h2>
            <p className="lede">{profile.verifiedCredentials.length} verified credentials. Each links to the issuer's verification page where one exists.</p>
          </div>
          <div className="cred-groups">
            {Array.from(groups, ([issuer, credentials]) => (
              <section key={issuer} aria-labelledby={slug(issuer)}>
                <h3 className="label" id={slug(issuer)}>{issuer}</h3>
                <ul className="cred-grid">
                  {credentials.map((credential) => {
                    const image = imageFor(credential);
                    return (
                      <li className="cred" key={`${credential.name}-${credential.issuedOn}`}>
                        {image && (
                          <div className="cred-img">
                            <img src={/^https:/.test(image.src) ? image.src : `${root}${image.src}`} alt={`${credential.name}, ${credential.issuer} credential`} width={image.width} height={image.height} loading="lazy" decoding="async" />
                          </div>
                        )}
                        <h4>{credential.name}</h4>
                        <p className="muted">Issued <time dateTime={credential.issuedOn}>{credential.issuedOn.slice(0, 4)}</time></p>
                        {credential.href && <a className="link-arrow" href={credential.href}>View credential<span className="sr-only">: {credential.name}</span><ArrowUpRight /></a>}
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
            <section aria-labelledby="education-heading">
              <h3 className="label" id="education-heading">Education</h3>
              <ul className="edu">
                {profile.education.map((education) => (
                  <li key={education.institution}>
                    <h4>{education.credential} in {education.field}</h4>
                    <p className="muted">{education.institution} · <time dateTime={education.end}>{education.end.slice(0, 4)}</time></p>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </section>
    </Page>
  );
}
