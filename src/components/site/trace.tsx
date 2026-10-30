import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { XClose } from "@untitledui/icons";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { profile as careerProfile } from "@/lib/career";
import { projectDisplayName, toolKey } from "./shared";

/**
 * The signature move: trace a tool through the work. Pressing any tool name (in a project's "Built with" line or in
 * the stack wall) lights up every project and role that used it across the page and dims the rest, and the trace bar
 * lists them as jump links. It is computed from the career record, so it can only show what the record says.
 * Without JavaScript the tool names are plain text and the stack wall links each tool to its projects instead.
 */
type Trace = { key: string; name: string } | null;
const TraceContext = createContext<{ ready: boolean; trace: Trace; setTrace: (trace: Trace) => void }>({ ready: false, trace: null, setTrace: () => {} });

export function TraceProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [trace, setTrace] = useState<Trace>(null);
  useEffect(() => setReady(true), []);
  useEffect(() => {
    document.documentElement.toggleAttribute("data-tracing", Boolean(trace));
    if (!trace) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setTrace(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [trace]);
  const value = useMemo(() => ({ ready, trace, setTrace }), [ready, trace]);
  return <TraceContext.Provider value={value}>{children}<TraceBar /></TraceContext.Provider>;
}

export const useTraceReady = () => useContext(TraceContext).ready;

/** "traced" when the current trace is one of these tools, "untraced" when another tool is traced, undefined otherwise. */
export function useTraceState(tools: string[]) {
  const { trace } = useContext(TraceContext);
  if (!trace) return undefined;
  return tools.some((tool) => toolKey(tool) === trace.key) ? "traced" : "untraced";
}

export function TraceChip({ name, weight }: { name: string; weight?: number }) {
  const { ready, trace, setTrace } = useContext(TraceContext);
  const key = toolKey(name);
  if (!ready) return <span className="trace-chip" data-weight={weight}>{name}</span>;
  const pressed = trace?.key === key;
  return (
    <button type="button" className="trace-chip" data-weight={weight} aria-pressed={pressed}
      onClick={() => setTrace(pressed ? null : { key, name })}>
      {name}
    </button>
  );
}

const projectsUsing = (key: string) => careerProfile.projects.filter((project) => project.technologies.some((tool) => toolKey(tool) === key));

function TraceBar() {
  const { trace, setTrace } = useContext(TraceContext);
  const projects = trace ? projectsUsing(trace.key) : [];
  const roles = [...new Set(projects.flatMap((project) => careerProfile.experience.filter((role) => role.id === project.experienceId).map((role) => role.employer)))];
  return (
    <>
      <p className="sr-only" aria-live="polite">{trace ? `Tracing ${trace.name}: ${projects.length ? `used in ${projects.length} project${projects.length > 1 ? "s" : ""}` : "listed as a skill, not tied to a project here"}.` : ""}</p>
      {trace && (
        <aside className="trace-bar" aria-label={`Where ${trace.name} was used`}>
          <p className="trace-bar-title"><span>Tracing</span> <strong>{trace.name}</strong></p>
          {projects.length ? (
            <ul className="trace-bar-list">
              {projects.map((project) => <li key={project.slug}><a href={`#entry-${project.slug}`}>{projectDisplayName(project)}</a></li>)}
            </ul>
          ) : <p className="trace-bar-note">A skill from my toolkit. No project on this page names it.</p>}
          {roles.length > 0 && <p className="trace-bar-note">At {roles.join(", ")}</p>}
          <ButtonUtility className="trace-bar-clear" color="tertiary" size="xs" icon={XClose} tooltip="Clear the trace (Esc)" onPress={() => setTrace(null)} />
        </aside>
      )}
    </>
  );
}
