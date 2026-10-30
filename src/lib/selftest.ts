/*
 * "Test this page": real checks that run against the rendered page in the visitor's browser. Nothing is precomputed
 * or simulated; every result comes from the live DOM, computed styles, the stylesheets, the network or the
 * Performance API at the moment the button is pressed. The list (ids and names) is shared with the server render so
 * the page shows what it will check before JavaScript runs.
 */

export type CheckResult = { state: "pass" | "fail" | "skip"; value: string; detail?: string };
export type Check = { id: string; name: string; run: () => CheckResult | Promise<CheckResult> };

const pass = (value: string): CheckResult => ({ state: "pass", value });
const fail = (value: string, detail?: string): CheckResult => (detail ? { state: "fail", value, detail } : { state: "fail", value });
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/** Elements a visitor can perceive: rendered, not inside [hidden] or a closed popover. */
const visible = (el: Element) => {
  const html = el as HTMLElement;
  if (html.closest("[hidden], [popover]:not(:popover-open), template")) return false;
  return html.getClientRects().length > 0 || html.classList.contains("sr-only") || !!html.closest(".sr-only");
};

/** A practical accessible-name computation: aria-labelledby, aria-label, text, image alt, title. */
function accessibleName(el: Element): string {
  const labelledBy = el.getAttribute("aria-labelledby");
  if (labelledBy) return labelledBy.split(/\s+/).map((id) => document.getElementById(id)?.textContent ?? "").join(" ").trim();
  const label = el.getAttribute("aria-label");
  if (label?.trim()) return label.trim();
  const text = (el.textContent ?? "").replace(/\s+/g, " ").trim();
  if (text) return text;
  const alt = el.querySelector("img[alt]")?.getAttribute("alt");
  if (alt?.trim()) return alt.trim();
  return el.getAttribute("title")?.trim() ?? "";
}

/** WCAG relative luminance contrast between two hex colours. */
function contrast(a: string, b: string) {
  const lum = (hex: string) => {
    const n = hex.replace("#", "");
    const full = n.length === 3 ? n.split("").map((c) => c + c).join("") : n;
    const [r, g, bl] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r! + 0.7152 * g! + 0.0722 * bl!;
  };
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

/** Layout shift and LCP need observers started at load; enhance.ts calls this as early as it can. */
export const vitals = { cls: 0, lcp: NaN, lcpSupported: false, clsSupported: false };
export function observeVitals() {
  const types = (PerformanceObserver as unknown as { supportedEntryTypes?: string[] }).supportedEntryTypes ?? [];
  if (types.includes("layout-shift")) {
    vitals.clsSupported = true;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) if (!entry.hadRecentInput) vitals.cls += entry.value;
    }).observe({ type: "layout-shift", buffered: true });
  }
  if (types.includes("largest-contentful-paint")) {
    vitals.lcpSupported = true;
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      vitals.lcp = entries[entries.length - 1]!.startTime;
    }).observe({ type: "largest-contentful-paint", buffered: true });
  }
}

/** Every CSS rule that animates must sit inside a prefers-reduced-motion: no-preference block. */
function unguardedAnimations(): string[] {
  const offenders: string[] = [];
  const walk = (rules: CSSRuleList, guarded: boolean) => {
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSMediaRule) walk(rule.cssRules, guarded || /prefers-reduced-motion:\s*no-preference/.test(rule.conditionText));
      else if ("cssRules" in rule && !(rule instanceof CSSKeyframesRule) && (rule as CSSGroupingRule).cssRules) walk((rule as CSSGroupingRule).cssRules, guarded);
      else if (rule instanceof CSSStyleRule) {
        const name = rule.style.getPropertyValue("animation-name") || rule.style.getPropertyValue("animation");
        if (name && !/^(none|initial|inherit|unset)$/.test(name.trim()) && !guarded) offenders.push(rule.selectorText);
      }
    }
  };
  for (const sheet of Array.from(document.styleSheets)) {
    try { walk(sheet.cssRules, false); } catch { /* cross-origin sheets are not ours */ }
  }
  return offenders;
}

export const checks: Check[] = [
  {
    id: "headings", name: "One h1, and no skipped heading levels",
    run: () => {
      const levels = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6")).filter(visible).map((h) => Number(h.tagName[1]));
      const ones = levels.filter((l) => l === 1).length;
      const jump = levels.findIndex((l, i) => i > 0 && l > levels[i - 1]! + 1);
      if (ones !== 1) return fail(`${ones} h1`, "A page should have exactly one top-level heading.");
      if (jump > 0) return fail(`h${levels[jump - 1]} to h${levels[jump]}`, "A heading level was skipped.");
      return pass(plural(levels.length, "heading"));
    },
  },
  {
    id: "alt", name: "Every image has alternative text",
    run: () => {
      const images = Array.from(document.images);
      const missing = images.filter((img) => !img.hasAttribute("alt"));
      return missing.length ? fail(`${missing.length} missing`, missing.map((i) => i.currentSrc).join(", ")) : pass(plural(images.length, "image"));
    },
  },
  {
    id: "names", name: "Every link and button has an accessible name",
    run: () => {
      const controls = Array.from(document.querySelectorAll("a[href], button")).filter(visible);
      const unnamed = controls.filter((el) => !accessibleName(el));
      return unnamed.length ? fail(`${unnamed.length} unnamed`, unnamed.map((el) => el.outerHTML.slice(0, 80)).join(" ")) : pass(plural(controls.length, "control"));
    },
  },
  {
    id: "ids", name: "No duplicate ids",
    run: () => {
      const ids = Array.from(document.querySelectorAll("[id]")).map((el) => el.id);
      const dupes = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
      return dupes.length ? fail(`${dupes.length} repeated`, dupes.join(", ")) : pass(plural(ids.length, "id"));
    },
  },
  {
    id: "anchors", name: "Every in-page link lands on something",
    run: () => {
      const here = location.pathname;
      const links = Array.from(document.querySelectorAll<HTMLAnchorElement>("a[href*='#']")).filter((a) => a.pathname === here && a.hash.length > 1);
      const broken = links.filter((a) => !document.getElementById(decodeURIComponent(a.hash.slice(1))));
      return broken.length ? fail(`${broken.length} broken`, broken.map((a) => a.hash).join(", ")) : pass(plural(links.length, "link"));
    },
  },
  {
    id: "https", name: "External links use HTTPS",
    run: () => {
      const external = Array.from(document.querySelectorAll<HTMLAnchorElement>("a[href^='http:'], a[href^='https:']")).filter((a) => a.host !== location.host);
      const insecure = external.filter((a) => a.protocol !== "https:");
      return insecure.length ? fail(`${insecure.length} insecure`, insecure.map((a) => a.href).join(", ")) : pass(plural(external.length, "link"));
    },
  },
  {
    id: "resumes", name: "All four resume files respond",
    run: async () => {
      const files = [...new Set(Array.from(document.querySelectorAll<HTMLAnchorElement>("a[href*='/resume/mohamed-moheyeldin-resume-']")).map((a) => a.href))];
      if (!files.length) return fail("0 found", "No resume links on this page.");
      const statuses = await Promise.all(files.map((file) => fetch(file, { method: "HEAD", cache: "no-store" }).then((r) => r.status, () => 0)));
      const bad = files.filter((_, i) => statuses[i]! < 200 || statuses[i]! >= 400);
      return bad.length ? fail(`${bad.length} failed`, bad.join(", ")) : pass(`${files.length} of ${files.length} OK`);
    },
  },
  {
    id: "contrast", name: "Text colours clear 4.5:1 on every ground",
    run: () => {
      const css = getComputedStyle(document.documentElement);
      const token = (name: string) => css.getPropertyValue(name).trim();
      const inks = ["--ink", "--ink-2", "--ink-3", "--accent"];
      const grounds = ["--paper", "--grid", "--surface", "--surface-2"];
      let worst = { ratio: Infinity, pair: "" };
      for (const ink of inks) for (const ground of grounds) {
        const ratio = contrast(token(ink), token(ground));
        if (ratio < worst.ratio) worst = { ratio, pair: `${ink} on ${ground}` };
      }
      const value = `min ${worst.ratio.toFixed(1)}:1`;
      return worst.ratio >= 4.5 ? pass(value) : fail(value, worst.pair);
    },
  },
  {
    id: "overflow", name: "Nothing overflows sideways at this width",
    run: () => {
      const extra = document.documentElement.scrollWidth - document.documentElement.clientWidth;
      return extra > 0 ? fail(`${extra}px over`, `At ${innerWidth}px wide.`) : pass(`${document.documentElement.clientWidth}px wide`);
    },
  },
  {
    id: "targets", name: "Buttons and menu links are at least 24 by 24 px",
    run: () => {
      const targets = Array.from(document.querySelectorAll(".btn, button, .nav-links a, .menu a, .work-index a, .toc a")).filter(visible).filter((el) => el.getClientRects().length);
      const small = targets.filter((el) => { const r = el.getBoundingClientRect(); return r.width < 24 || r.height < 24; });
      return small.length ? fail(`${small.length} too small`, small.map((el) => accessibleName(el)).join(", ")) : pass(plural(targets.length, "target"));
    },
  },
  {
    id: "motion", name: "Every animation sits behind the reduced-motion setting",
    run: () => {
      const offenders = unguardedAnimations();
      if (offenders.length) return fail(`${offenders.length} unguarded`, offenders.join(", "));
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) {
        const running = document.getAnimations().filter((a) => a.playState === "running").length;
        return running ? fail(`${running} running`, "Animations are running with reduced motion on.") : pass("reduced: none running");
      }
      return pass("all guarded");
    },
  },
  {
    id: "theme", name: "The theme matches your choice or system setting",
    run: () => {
      let saved: string | null = null;
      try { saved = localStorage.getItem("theme"); } catch { /* storage blocked */ }
      const wantDark = saved === "dark" || (!saved && matchMedia("(prefers-color-scheme: dark)").matches);
      const isDark = document.documentElement.classList.contains("dark-mode");
      const source = saved ? "your choice" : "system";
      return wantDark === isDark ? pass(`${isDark ? "dark" : "light"}, ${source}`) : fail(`${isDark ? "dark" : "light"} shown`, `Expected ${wantDark ? "dark" : "light"} from ${source}.`);
    },
  },
  {
    id: "meta", name: "Language, title, description and canonical are set",
    run: () => {
      const missing = [
        !document.documentElement.lang && "lang",
        !document.title.trim() && "title",
        !document.querySelector("meta[name='description']")?.getAttribute("content") && "description",
        !document.querySelector("link[rel='canonical']") && !document.querySelector("meta[name='robots'][content*='noindex']") && "canonical",
      ].filter(Boolean);
      return missing.length ? fail(`${missing.length} missing`, missing.join(", ")) : pass(document.documentElement.lang);
    },
  },
  {
    id: "weight", name: "Everything this page loaded weighs under 500 KB",
    run: () => {
      const entries = [...performance.getEntriesByType("navigation"), ...performance.getEntriesByType("resource")] as PerformanceResourceTiming[];
      const bytes = entries.reduce((sum, e) => sum + (e.encodedBodySize || 0), 0);
      if (!bytes) return { state: "skip", value: "not reported" };
      const kb = Math.round(bytes / 1024);
      return kb < 500 ? pass(`${kb} KB`) : fail(`${kb} KB`, "Over the 500 KB budget.");
    },
  },
  {
    id: "cls", name: "Layout shift so far is under 0.1",
    run: () => {
      if (!vitals.clsSupported) return { state: "skip", value: "not in this browser" };
      return vitals.cls < 0.1 ? pass(vitals.cls.toFixed(3)) : fail(vitals.cls.toFixed(3), "Above the 0.1 threshold.");
    },
  },
  {
    id: "lcp", name: "Largest content painted within 2.5 s",
    run: () => {
      if (!vitals.lcpSupported || Number.isNaN(vitals.lcp)) return { state: "skip", value: "not in this browser" };
      const seconds = (vitals.lcp / 1000).toFixed(2);
      return vitals.lcp <= 2500 ? pass(`${seconds} s`) : fail(`${seconds} s`, "Slower than the 2.5 s threshold on this load.");
    },
  },
];
