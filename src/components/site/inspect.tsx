import { createContext, createElement, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Eye, EyeOff } from "@untitledui/icons";
import { cx } from "@/utils/cx";

/**
 * The signature move: inspect where every claim comes from. Facts on the page are wrapped in <Fact>, which records the
 * career-record field the text is rendered from and how that field is evidenced. Turning the inspector on prints both
 * beside each fact, so the whole page annotates itself, and the status bar totals the facts on screen by evidence.
 * Nothing is typed by hand: the paths name real fields in src/content/career.json, and the evidence comes from the
 * same derivation the project pages use. Without JavaScript the inspector is absent and the facts read as plain text.
 */
export type Evidence = "Public source" | "User-reported" | "Documented responsibility" | "Career record" | "Verified credential";

type InspectState = { ready: boolean; on: boolean; setOn: (on: boolean) => void };
const InspectContext = createContext<InspectState>({ ready: false, on: false, setOn: () => {} });

export function InspectProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [on, setOn] = useState(false);
  useEffect(() => setReady(true), []);
  useEffect(() => {
    document.documentElement.toggleAttribute("data-inspect", on);
    if (!on) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOn(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [on]);
  const value = useMemo(() => ({ ready, on, setOn }), [ready, on]);
  return <InspectContext.Provider value={value}>{children}</InspectContext.Provider>;
}

export const useInspect = () => useContext(InspectContext);

type FactTag = "span" | "p" | "dd" | "li" | "div" | "strong";

/** A claim rendered from the career record. `path` names the field; `evidence` says how it is supported. */
export function Fact({ path, evidence, as = "span", className, children }: { path: string; evidence: Evidence; as?: FactTag; className?: string; children: ReactNode }) {
  const { on } = useInspect();
  return createElement(as, { className: cx("fact", className), "data-evidence": evidence },
    children,
    on && (
      <span className="fact-tag" key="tag">
        <span className="sr-only"> (source: </span>
        <code>{path}</code>
        <span className="fact-evidence" data-evidence={evidence}>{evidence}</span>
        <span className="sr-only">)</span>
      </span>
    ),
  );
}

/** The inspector switch. The same state drives every switch on the page, so the sidebar and status bar stay in step. */
export function InspectToggle({ className, compact = false }: { className?: string; compact?: boolean }) {
  const { ready, on, setOn } = useInspect();
  if (!ready) return null;
  const Icon = on ? EyeOff : Eye;
  return (
    <button type="button" className={cx("inspect-toggle", className)} aria-pressed={on} onClick={() => setOn(!on)}
      title={on ? "Hide sources (Esc)" : "Show where each fact comes from"}>
      <Icon aria-hidden="true" />
      <span className={compact ? "sr-only" : undefined}>{on ? "Hide sources" : "Inspect sources"}</span>
    </button>
  );
}

const order: Evidence[] = ["Public source", "User-reported", "Documented responsibility", "Career record", "Verified credential"];

/** Totals the facts on the page by evidence once the inspector is on. Read from the DOM, so it counts what is shown. */
export function InspectSummary() {
  const { on } = useInspect();
  const [counts, setCounts] = useState<[Evidence, number][]>([]);
  useEffect(() => {
    if (!on) return setCounts([]);
    const tally = new Map<Evidence, number>();
    document.querySelectorAll<HTMLElement>(".fact:not([hidden] .fact)").forEach((element) => {
      const evidence = element.dataset.evidence as Evidence;
      tally.set(evidence, (tally.get(evidence) ?? 0) + 1);
    });
    setCounts(order.flatMap((evidence) => (tally.get(evidence) ? [[evidence, tally.get(evidence)!] as [Evidence, number]] : [])));
  }, [on]);
  const total = counts.reduce((sum, [, count]) => sum + count, 0);
  return (
    <>
      <p className="sr-only" aria-live="polite">{on ? `Showing sources for ${total} facts on this page.` : ""}</p>
      {on && total > 0 && (
        <p className="inspect-summary">
          <strong>{total} facts</strong>
          {counts.map(([evidence, count]) => <span key={evidence} data-evidence={evidence}>{count} {evidence.toLowerCase()}</span>)}
        </p>
      )}
    </>
  );
}
