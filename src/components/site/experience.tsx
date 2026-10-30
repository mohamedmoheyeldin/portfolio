import credentialImages from "@/content/credential-images.json";
import { formatCareerDate } from "@/lib/career";
import { Page } from "./layout";
import { type Profile, caseStudyHref, evidenceSource, projectDisplayName, projectNumber, roleEmail, root } from "./shared";
import { ArrowUpRight, Label, Mail, ResumeMenu, Tags } from "./ui";

/** The full record: every role and highlight, the project register, skills, credentials and education. */
export function Work({ profile }: { profile: Profile }) {
  const groups = profile.verifiedCredentials.reduce<Map<string, Profile["verifiedCredentials"]>>((map, credential) => {
    map.set(credential.issuer, [...(map.get(credential.issuer) ?? []), credential]);
    return map;
  }, new Map());
  const imageFor = (credential: Profile["verifiedCredentials"][number]) =>
    credentialImages.find((asset) => (credential.href ? asset.credentialHref === credential.href : (asset as { credentialName?: string }).credentialName === credential.name));

  return (
    <Page place="experience">
      <header className="split page-head" data-sc-act="title">
        <div className="split-row">
          <div className="side side--people">
            <Label>Experience</Label>
            <h1 id="title-heading">{profile.experienceYears} years of building software, and checking it holds up.</h1>
            <p className="lede">Every role and what I did in it, the projects behind them, the tools I use, and the credentials I can show you.</p>
            <div className="actions">
              <a className="btn btn--primary btn--lg" href={roleEmail}><Mail />Email me</a>
              <ResumeMenu id="resume-menu-hero" anchor="resume-hero" size="lg" />
            </div>
          </div>
          <div className="side side--systems">
            <nav aria-label="On this page">
              <ol className="index">
                {[["roles", "Roles"], ["projects", "Projects"], ["skills", "Skills"], ["learning", "Credentials and education"]].map(([id, label], i) => (
                  <li key={id}><a href={`#${id}`}><span className="num">{String(i + 1).padStart(2, "0")}</span><span className="index-name">{label}</span><span /></a></li>
                ))}
              </ol>
            </nav>
          </div>
        </div>
      </header>

      <section id="roles" aria-labelledby="roles-heading">
        <div className="split section-open">
          <div className="split-row">
            <div className="side side--people section-head"><h2 id="roles-heading">Roles</h2></div>
            <div className="side side--systems section-head"><p className="muted">Who each role served, then everything I did in it.</p></div>
          </div>
        </div>
        {profile.experience.map((role) => (
          <article className="split role" key={role.id} id={`role-${role.id}`} aria-labelledby={`role-${role.id}-heading`}>
            <span className="role-years"><time dateTime={role.start}>{formatCareerDate(role.start)}</time> to {role.end ? <time dateTime={role.end}>{formatCareerDate(role.end)}</time> : "now"}</span>
            <div className="split-row">
              <div className="side side--people">
                <h3 id={`role-${role.id}-heading`}>{role.employer}</h3>
                <p className="where">{role.professionalTitle ?? role.title}{role.customer ? `, for the ${role.customer}` : ""}</p>
                <p className="label">{role.location}</p>
                <p className="summary">{role.summary}</p>
              </div>
              <div className="side side--systems">
                <ul className="bullets">{role.highlights.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="split section" id="projects" aria-labelledby="projects-heading">
        <div className="split-row">
          <div className="side side--people section-head">
            <h2 id="projects-heading">Projects</h2>
            <p className="lede">Each one has a case study: the problem, what I did, what changed, the systems and trade-offs, and what you can check.</p>
          </div>
          <div className="side side--systems">
            <nav aria-label="Project case studies">
              <table className="project-table">
                <caption className="sr-only">Projects with role and evidence</caption>
                <thead><tr><th scope="col">Project</th><th scope="col" className="hide-sm">Role</th><th scope="col">Evidence</th></tr></thead>
                <tbody>
                  {profile.projects.map((project) => (
                    <tr key={project.slug}>
                      <td><span className="label">{projectNumber(project)} </span><a href={caseStudyHref(project)}>{projectDisplayName(project)}</a></td>
                      <td className="hide-sm">{project.role}</td>
                      <td>{evidenceSource(project)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </nav>
          </div>
        </div>
      </section>

      <section className="split section" id="skills" aria-labelledby="skills-heading">
        <div className="split-row">
          <div className="side side--people">
            <div className="section-head"><h2 id="skills-heading">Skills</h2></div>
            <ul className="cap-list">{profile.competencies.map((item) => <li key={item}><h3>{item}</h3></li>)}</ul>
          </div>
          <div className="side side--systems">
            <div className="section-head"><Label>Tools</Label></div>
            <ul className="cap-list">{profile.skillGroups.map((group) => <li key={group.label}><h3>{group.label}</h3><Tags items={group.items} /></li>)}</ul>
          </div>
        </div>
      </section>

      <section className="wrap section" id="learning" aria-labelledby="learning-heading">
        <div className="section-head">
          <h2 id="learning-heading">Credentials and education</h2>
          <p className="lede">{profile.verifiedCredentials.length} verified credentials. Each links to the issuer's verification page where one exists.</p>
        </div>
        <div className="cred-groups">
          {Array.from(groups, ([issuer, credentials]) => (
            <section key={issuer} aria-labelledby={`issuer-${issuer.replace(/\W+/g, "-").toLowerCase()}`}>
              <h3 className="label" id={`issuer-${issuer.replace(/\W+/g, "-").toLowerCase()}`}>{issuer}</h3>
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
                      <p>Issued <time dateTime={credential.issuedOn}>{credential.issuedOn.slice(0, 4)}</time></p>
                      {credential.href && <a className="link-arrow" href={credential.href}>View credential<span className="sr-only">: {credential.name}</span><ArrowUpRight /></a>}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
          <section aria-labelledby="education-heading">
            <h3 className="label" id="education-heading">Education</h3>
            <ul className="cap-list">
              {profile.education.map((education) => (
                <li key={education.institution}>
                  <h4>{education.credential} in {education.field}</h4>
                  <p>{education.institution} · <time dateTime={education.end}>{education.end.slice(0, 4)}</time></p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </section>
    </Page>
  );
}
