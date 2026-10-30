import { Page } from "./site/layout";
import { href, root } from "./site/shared";
import { ArrowLeft, Label } from "./site/ui";

// Page composition. Every route renders inside Page: the header, the page, the close, the footer and the command
// palette. See docs/ARCHITECTURE.md.
export { Home } from "./site/home";
export { Work } from "./site/experience";
export { CaseStudy } from "./site/case-study";

export function NotFound() {
  return (
    <Page place="other">
      <section className="page-head" aria-labelledby="title-heading">
        <div className="wrap">
          <Label accent>404</Label>
          <h1 id="title-heading">This page doesn’t exist.</h1>
          <p className="lede">The link may be old or mistyped. The overview is a good place to start.</p>
          <div className="actions">
            <a className="btn btn--primary btn--lg" href={root}><ArrowLeft />Back to the overview</a>
            <a className="btn btn--lg" href={href("experience/")}>View my experience</a>
          </div>
        </div>
      </section>
    </Page>
  );
}
