import { ArrowLeft } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Page } from "./site/chrome";
import { href, root } from "./site/shared";

// Page composition. Every route renders inside the workbench frame (sidebar or top bar, the page, the contact
// composer and the status bar). See docs/ARCHITECTURE.md.
export { PathContext } from "./site/chrome";
export { Home } from "./site/home";
export { Work } from "./site/experience";
export { CaseStudy } from "./site/case-study";

export function NotFound() {
  return (
    <Page chapters={[{ id: "introduction", label: "Not found" }]}>
      <section className="sec page-head" id="introduction" aria-labelledby="title-heading">
        <div className="wb-container">
          <p className="doc-path"><code>404</code><span>Page not found</span></p>
          <h1 id="title-heading">This page doesn’t exist.</h1>
          <p className="page-dek">The link may be old or mistyped. The overview is a good place to start.</p>
          <div className="page-actions">
            <Button size="lg" href={root} iconLeading={ArrowLeft}>Back to the overview</Button>
            <Button color="secondary" size="lg" href={href("experience/")}>View my experience</Button>
          </div>
        </div>
      </section>
    </Page>
  );
}
