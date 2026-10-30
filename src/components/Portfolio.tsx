import { ArrowLeft } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { href, root } from "./site/shared";

// Page composition. Each route is set as a printed feature: a static masthead, a folio with the contents and the
// reading-depth control, numbered chapters, and the colophon. See docs/ARCHITECTURE.md.
export { Masthead, Colophon } from "./site/chrome";
export { Home } from "./site/home";
export { Work } from "./site/experience";
export { CaseStudy } from "./site/case-study";

export function NotFound() {
  return (
    <section className="title-page title-page-compact not-found" id="introduction" aria-labelledby="title-heading">
      <p className="title-kicker">Page not found</p>
      <h1 id="title-heading">This page doesn’t exist.</h1>
      <p className="title-dek">The link may be old or mistyped. The home page is a good place to start.</p>
      <div className="title-actions">
        <Button size="lg" href={root} iconLeading={ArrowLeft}>Back to home</Button>
        <Button color="secondary" size="lg" href={href("experience/")}>View my experience</Button>
      </div>
    </section>
  );
}
