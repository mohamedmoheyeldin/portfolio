import type { ReactNode, SVGProps } from "react";
import { flows } from "@/content/flows";
import { type Project, evidenceSource, resumeFile } from "./shared";

/*
 * Small, dependency-free primitives. Everything here renders to static HTML at build time; behaviour that needs
 * JavaScript (theme, copy, menus, the schematic, the self-test) is attached by src/client/enhance.ts
 * through data attributes.
 */

type IconProps = SVGProps<SVGSVGElement>;
const stroke = (d: ReactNode) => (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...props}>{d}</svg>
);

export const ArrowRight = stroke(<path d="M5 12h14M13 6l6 6-6 6" />);
export const ArrowLeft = stroke(<path d="M19 12H5M11 18l-6-6 6-6" />);
export const ArrowUpRight = (props: IconProps) => stroke(<path d="M7 17 17 7M8 7h9v9" />)({ className: "up", ...props });
export const Mail = stroke(<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></>);
export const Download = stroke(<path d="M12 4v11M7 10l5 5 5-5M5 20h14" />);
export const ChevronDown = stroke(<path d="m6 9 6 6 6-6" />);
export const Menu = stroke(<path d="M4 7h16M4 12h16M4 17h16" />);
export const Sun = stroke(<><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>);
export const Moon = stroke(<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />);
export const Play = stroke(<path d="M8 5.5v13l11-6.5-11-6.5Z" />);
export const Check = stroke(<path d="m5 12.5 4.5 4.5L19 7.5" />);
export const Copy = stroke(<><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h9" /></>);

export const GitHub = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" {...props}>
    <path d="M12 0C5.3724 0 0 5.3808 0 12.0204C0 17.3304 3.438 21.8364 8.2068 23.4252C8.8068 23.5356 9.0252 23.1648 9.0252 22.8456C9.0252 22.5612 9.0156 21.804 9.0096 20.802C5.6712 21.528 4.9668 19.1904 4.9668 19.1904C4.422 17.8008 3.6348 17.4312 3.6348 17.4312C2.5452 16.6872 3.7176 16.7016 3.7176 16.7016C4.9212 16.7856 5.5548 17.94 5.5548 17.94C6.6252 19.776 8.364 19.2456 9.0468 18.9384C9.1572 18.162 9.4668 17.6328 9.81 17.3328C7.146 17.0292 4.344 15.9972 4.344 11.3916C4.344 10.08 4.812 9.006 5.5788 8.166C5.4552 7.8624 5.0436 6.6396 5.6964 4.986C5.6964 4.986 6.7044 4.662 8.9964 6.2172C9.97532 5.95022 10.9853 5.81423 12 5.8128C13.02 5.8176 14.046 5.9508 15.0048 6.2172C17.2956 4.662 18.3012 4.9848 18.3012 4.9848C18.9564 6.6396 18.5436 7.8624 18.4212 8.166C19.1892 9.006 19.6548 10.08 19.6548 11.3916C19.6548 16.0092 16.848 17.0256 14.1756 17.3232C14.6064 17.694 14.9892 18.4272 14.9892 19.5492C14.9892 21.1548 14.9748 22.452 14.9748 22.8456C14.9748 23.1672 15.1908 23.5416 15.8004 23.424C18.19 22.6225 20.2672 21.0904 21.7386 19.0441C23.2099 16.9977 24.001 14.5408 24 12.0204C24 5.3808 18.6264 0 12 0Z" />
  </svg>
);
export const LinkedIn = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" {...props}>
    <path d="M22.2234 0H1.77187C0.792187 0 0 0.773438 0 1.72969V22.2656C0 23.2219 0.792187 24 1.77187 24H22.2234C23.2031 24 24 23.2219 24 22.2703V1.72969C24 0.773438 23.2031 0 22.2234 0ZM7.12031 20.4516H3.55781V8.99531H7.12031V20.4516ZM5.33906 7.43438C4.19531 7.43438 3.27188 6.51094 3.27188 5.37187C3.27188 4.23281 4.19531 3.30937 5.33906 3.30937C6.47813 3.30937 7.40156 4.23281 7.40156 5.37187C7.40156 6.50625 6.47813 7.43438 5.33906 7.43438ZM20.4516 20.4516H16.8937V14.8828C16.8937 13.5563 16.8703 11.8453 15.0422 11.8453C13.1906 11.8453 12.9094 13.2938 12.9094 14.7891V20.4516H9.35625V8.99531H12.7687V10.5609H12.8156C13.2891 9.66094 14.4516 8.70938 16.1813 8.70938C19.7859 8.70938 20.4516 11.0813 20.4516 14.1656V20.4516V20.4516Z" />
  </svg>
);

/** The resume files, in the order the menus list them. */
export const resumeOptions = [
  { label: "One-page resume", format: "PDF", href: resumeFile("one-page", "pdf") },
  { label: "Full resume", format: "PDF", href: resumeFile("detailed", "pdf") },
  { label: "One-page resume", format: "Word", href: resumeFile("one-page", "docx") },
  { label: "Full resume", format: "Word", href: resumeFile("detailed", "docx") },
] as const;

/**
 * A resume button that opens a native popover listing every format. The popover API needs no JavaScript; browsers
 * without it get the plain link to the full PDF (the fallback is swapped in by enhance.ts).
 */
export function ResumeMenu({ id, size = "md" }: { id: string; size?: "md" | "lg" }) {
  return (
    <span className="menu-anchor">
      <button className={`btn${size === "lg" ? " btn--lg" : ""}`} type="button" popoverTarget={id}>
        <Download />Resume<ChevronDown />
      </button>
      <div className="menu" id={id} popover="auto">
        <p className="label" id={`${id}-label`}>Resume</p>
        <ul aria-labelledby={`${id}-label`}>
          {resumeOptions.map((option) => (
            <li key={option.href}><a href={option.href}>{option.label}<span className="menu-format">{option.format}</span></a></li>
          ))}
        </ul>
      </div>
    </span>
  );
}

export function Label({ children, accent, as: Tag = "p" }: { children: ReactNode; accent?: boolean; as?: "p" | "span" | "dt" | "h3" }) {
  return <Tag className={`label${accent ? " label--accent" : ""}`}>{children}</Tag>;
}

export function Tags({ items, label = "Built with" }: { items: readonly string[]; label?: string }) {
  return <ul className="tags" aria-label={label}>{items.map((item) => <li className="tag" key={item}>{item}</li>)}</ul>;
}

/** Where a result's evidence comes from, as a tag. The wording is derived from the record (see evidenceSource). */
export function EvidenceTag({ project }: { project: Project }) {
  const source = evidenceSource(project);
  const tone = source === "User-reported" ? " evidence--reported" : source === "Public source" ? " evidence--public" : "";
  return <span className={`evidence${tone}`}>{source}</span>;
}

/*
 * The signature: a working diagram of the VA Claims Workflows design. The six parts are the documented steps and
 * "alongside" entries in flows.ts (the source fields are noted there). Two SVG layouts share one geometry table: wide
 * (beside the copy) and tall (phones). The SVGs are decorative; the list under them carries every part as text,
 * and enhance.ts turns it into a picker that lights the matching part. site.css assembles the diagram as it scrolls
 * in, runs pulses along the paths with the scroll (.sn-flow) and a timed signal (.sn-signal).
 */
type Box = { n: number; x: number; y: number; w: number; h: number; lines: string[] };
type Layout = {
  view: [number, number]; boxes: Box[]; roles: { x: number; y: number; w: number; h: number }[]; pills: Box[];
  ui: [number, number, number][]; db: [number, number]; signal: string[]; trunk: string;
};
const roleNames = ["VA staff", "Providers", "Veterans"];
const layouts: Record<"wide" | "tall", Layout> = {
  wide: {
    view: [640, 372],
    boxes: [{ n: 1, x: 16, y: 140, w: 152, h: 88, lines: ["Health-provider", "APIs"] }, { n: 2, x: 232, y: 112, w: 176, h: 144, lines: ["Claims platform"] }],
    ui: [[250, 162, 66], [326, 162, 66]], db: [320, 226],
    roles: [56, 174, 292].map((y) => ({ x: 468, y, w: 156, h: 52 })),
    pills: [
      { n: 4, x: 16, y: 316, w: 140, h: 40, lines: ["Claims framework"] },
      { n: 5, x: 168, y: 316, w: 116, h: 40, lines: ["Tableau"] },
      { n: 6, x: 296, y: 316, w: 136, h: 40, lines: ["Playwright"] },
    ],
    signal: ["M168,184 H232", "M408,184 C438,184 438,82 468,82", "M408,184 C438,184 438,200 468,200", "M408,184 C438,184 438,318 468,318"],
    trunk: "M320,256 V286 M86,286 H364 M86,286 V316 M226,286 V316 M364,286 V316",
  },
  tall: {
    view: [380, 420],
    boxes: [{ n: 1, x: 90, y: 8, w: 200, h: 60, lines: ["Health-provider APIs"] }, { n: 2, x: 70, y: 104, w: 240, h: 128, lines: ["Claims platform"] }],
    ui: [[92, 160, 94], [194, 160, 94]], db: [190, 208],
    roles: [34, 138, 242].map((x) => ({ x, y: 276, w: 104, h: 48 })),
    pills: [
      { n: 4, x: 34, y: 368, w: 104, h: 44, lines: ["Claims", "framework"] },
      { n: 5, x: 138, y: 368, w: 104, h: 44, lines: ["Tableau"] },
      { n: 6, x: 242, y: 368, w: 104, h: 44, lines: ["Playwright"] },
    ],
    signal: ["M190,68 V104", "M190,232 C190,256 86,252 86,276", "M190,232 V276", "M190,232 C190,256 294,252 294,276"],
    trunk: "M70,168 H16 V352 H294 M86,352 V368 M190,352 V368 M294,352 V368",
  },
};

function SchematicSvg({ layout }: { layout: "wide" | "tall" }) {
  const l = layouts[layout];
  return (
    <svg className={`schematic-svg schematic-svg--${layout}`} viewBox={`0 0 ${l.view[0]} ${l.view[1]}`} aria-hidden="true" focusable="false">
      <path className="sn-trunk" d={l.trunk} />
      {l.signal.map((d) => <path key={d} className="sn-path" d={d} pathLength={1} />)}
      {l.signal.map((d, i) => <path key={`f${d}`} className={`sn-flow sn-flow--${i === 0 ? "in" : "out"}`} d={d} pathLength={100} />)}
      {l.signal.map((d, i) => <path key={`s${d}`} className={`sn-signal sn-signal--${i === 0 ? "in" : "out"}`} d={d} pathLength={100} />)}
      {l.boxes.map((box) => (
        <g key={box.n} className="sn" data-node={box.n}>
          <rect className="sn-box" x={box.x} y={box.y} width={box.w} height={box.h} rx="12" />
          <text className="sn-num" x={box.x + 14} y={box.y + 22}>{String(box.n).padStart(2, "0")}</text>
          {box.lines.map((line, i) => <text key={line} className="sn-title" x={box.x + 14} y={box.y + 44 + i * 17}>{line}</text>)}
        </g>
      ))}
      <g className="sn sn-inner" data-node={2}>
        {l.ui.map(([x, y, w]) => (
          <g key={x}><rect className="sn-chip" x={x} y={y} width={w} height="26" rx="6" /><text className="sn-mono" x={x + w / 2} y={y + 17} textAnchor="middle">Frontend</text></g>
        ))}
        <ellipse className="sn-chip" cx={l.db[0]} cy={l.db[1] + 14} rx="30" ry="7" />
        <path className="sn-chip" d={`M${l.db[0] - 30},${l.db[1]} V${l.db[1] + 14} M${l.db[0] + 30},${l.db[1]} V${l.db[1] + 14}`} />
        <ellipse className="sn-chip sn-chip--top" cx={l.db[0]} cy={l.db[1]} rx="30" ry="7" />
        <text className="sn-mono" x={l.db[0] + 40} y={l.db[1] + 12}>DB</text>
      </g>
      <g className="sn" data-node={3}>
        {l.roles.map((role, i) => (
          <g key={roleNames[i]}>
            <rect className="sn-box" x={role.x} y={role.y} width={role.w} height={role.h} rx="10" />
            <circle className="sn-live" cx={role.x + 15} cy={role.y + role.h / 2} r="4" />
            <text className="sn-title" x={role.x + 27} y={role.y + role.h / 2 + 5}>{roleNames[i]}</text>
          </g>
        ))}
      </g>
      {l.pills.map((pill) => (
        <g key={pill.n} className="sn sn--beside" data-node={pill.n}>
          <rect className="sn-box sn-box--pill" x={pill.x} y={pill.y} width={pill.w} height={pill.h} rx={pill.h / 2} />
          {pill.lines.map((line, i) => (
            <text key={line} className="sn-label" x={pill.x + pill.w / 2} y={pill.y + pill.h / 2 + 4.5 + (i - (pill.lines.length - 1) / 2) * 15} textAnchor="middle">{line}</text>
          ))}
        </g>
      ))}
    </svg>
  );
}

export function Schematic() {
  const flow = flows["federal-quality-delivery-system"]!;
  const parts = [...flow.steps, ...(flow.beside ?? [])];
  return (
    <figure className="schematic" data-schematic>
      <div className="schematic-stage">
        <SchematicSvg layout="wide" />
        <SchematicSvg layout="tall" />
      </div>
      <figcaption className="schematic-cap">
        <span className="label label--accent">VA Claims Workflows</span>
        <span>A diagram of the documented design, not a capture.<span className="js-only"> Pick a part to read it.</span></span>
      </figcaption>
      <ol className="schematic-key">
        {parts.map((part, i) => (
          <li key={part.title} data-node={i + 1}>
            <button className="node-btn" type="button" id={`node-btn-${i + 1}`} aria-controls={`node-text-${i + 1}`} data-node={i + 1}>
              <span className="num">{String(i + 1).padStart(2, "0")}</span>{part.title}
            </button>
            <p className="node-text" id={`node-text-${i + 1}`}>{part.text}</p>
          </li>
        ))}
      </ol>
    </figure>
  );
}

/**
 * One segment of the page thread: a path in a 100 by 100 box stretched over its section, drawn as the section scrolls
 * into view (site.css). The stroke keeps its width however the box stretches. Decorative.
 */
export function Thread({ d, className }: { d: string; className?: string }) {
  return (
    <svg className={`thread${className ? ` ${className}` : ""}`} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path d={d} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/**
 * A project's documented design as a pipeline: numbered stations on one rail, then the parts that run alongside it.
 * Every station restates a documented field (see src/content/flows.ts); it is a diagram of the design, not a capture.
 */
export function Pipeline({ slug, title, compact }: { slug: string; title: string; compact?: boolean }) {
  const flow = flows[slug];
  if (!flow) return null;
  return (
    <figure className={`pipe${compact ? " pipe--compact" : ""}`}>
      <figcaption className="pipe-cap"><span className="label">How it works</span><span>{flow.caption}</span></figcaption>
      <ol className="pipe-steps" aria-label={`${title}: how it works`}>
        {flow.steps.map((step, i) => (
          <li className="pipe-step" key={step.title}>
            <span className="pipe-node" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
            <span className="pipe-text"><strong>{step.title}</strong><span>{step.text}</span></span>
          </li>
        ))}
      </ol>
      {flow.beside && (
        <div className="pipe-beside">
          <p className="label" id={`${slug}-beside${compact ? "-c" : ""}`}>Alongside</p>
          <ul aria-labelledby={`${slug}-beside${compact ? "-c" : ""}`}>
            {flow.beside.map((note) => <li key={note.title}><strong>{note.title}</strong><span>{note.text}</span></li>)}
          </ul>
        </div>
      )}
    </figure>
  );
}
