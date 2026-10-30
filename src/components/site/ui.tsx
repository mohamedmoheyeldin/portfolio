import type { ReactNode, SVGProps } from "react";
import { resumeFile } from "./shared";

/*
 * Small, dependency-free primitives. Everything here renders to static HTML at build time; behaviour that needs
 * JavaScript (theme, copy, self-test) is attached by src/client/enhance.ts through data attributes.
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
 * without it get the plain link to the full PDF (the `no-popover` fallback is swapped in by enhance.ts).
 */
export function ResumeMenu({ id, anchor, size = "md" }: { id: string; anchor: string; size?: "md" | "lg" }) {
  return (
    <>
      <button className={`btn${size === "lg" ? " btn--lg" : ""}`} type="button" popoverTarget={id} data-anchor={anchor}>
        <Download />Resume<ChevronDown />
      </button>
      <div className={`menu menu--${anchor}`} id={id} popover="auto">
        <p className="label" id={`${id}-label`}>Resume</p>
        <ul aria-labelledby={`${id}-label`}>
          {resumeOptions.map((option) => (
            <li key={option.href}><a href={option.href}>{option.label}<span className="menu-format">{option.format}</span></a></li>
          ))}
        </ul>
      </div>
    </>
  );
}

export function Label({ children, accent, as: Tag = "p" }: { children: ReactNode; accent?: boolean; as?: "p" | "span" | "dt" }) {
  return <Tag className={`label${accent ? " label--accent" : ""}`}>{children}</Tag>;
}

export function Tags({ items }: { items: readonly string[] }) {
  return <ul className="tags" aria-label="Built with">{items.map((item) => <li className="tag" key={item}>{item}</li>)}</ul>;
}
