/*
 * The only JavaScript the published site ships. Pages are complete HTML without it; this adds:
 * the theme toggle, copy-address buttons, the current section in the header, menu positioning and closing, the intro
 * skip, the schematic's part picker, and the self-test runner.
 */
import { checks, observeVitals, type CheckResult } from "@/lib/selftest";

const root = document.documentElement;
const themeColors = { light: "#f0eee6", dark: "#141413" } as const;
const reducedMotion = () => !matchMedia("(prefers-reduced-motion: no-preference)").matches;

function setTheme(dark: boolean) {
  root.classList.toggle("dark-mode", dark);
  try { localStorage.setItem("theme", dark ? "dark" : "light"); } catch { /* storage blocked: the choice lasts for this page */ }
  document.querySelectorAll<HTMLMetaElement>("meta[name='theme-color']").forEach((meta) => { meta.content = dark ? themeColors.dark : themeColors.light; });
  document.querySelectorAll<HTMLButtonElement>("[data-theme-toggle]").forEach(syncThemeButton);
}

function syncThemeButton(button: HTMLButtonElement) {
  const dark = root.classList.contains("dark-mode");
  button.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
  button.setAttribute("aria-pressed", String(dark));
}

function toggleTheme() {
  const flip = () => setTheme(!root.classList.contains("dark-mode"));
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  if (doc.startViewTransition && !reducedMotion()) doc.startViewTransition(flip);
  else flip();
}

function initTheme() {
  document.querySelectorAll<HTMLButtonElement>("[data-theme-toggle]").forEach((button) => {
    syncThemeButton(button);
    button.addEventListener("click", toggleTheme);
  });
  // Follow the system while the visitor has not chosen.
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (event) => {
    let saved: string | null = null;
    try { saved = localStorage.getItem("theme"); } catch { /* ignore */ }
    if (!saved) { root.classList.toggle("dark-mode", event.matches); document.querySelectorAll<HTMLButtonElement>("[data-theme-toggle]").forEach(syncThemeButton); }
  });
}

async function copyText(text: string) {
  await navigator.clipboard.writeText(text);
}

function initCopy() {
  document.querySelectorAll<HTMLButtonElement>("[data-copy]").forEach((button) => {
    const label = button.querySelector("span") ?? button;
    const original = label.textContent;
    button.addEventListener("click", async () => {
      try {
        await copyText(button.dataset.copy!);
        label.textContent = "Copied";
      } catch {
        label.textContent = "Press Ctrl+C";
        const target = document.getElementById(button.getAttribute("aria-describedby") ?? "");
        if (target) { const range = document.createRange(); range.selectNodeContents(target); getSelection()?.removeAllRanges(); getSelection()?.addRange(range); }
      }
      setTimeout(() => { label.textContent = original; }, 1800);
    });
  });
}

/** Mark the header link for the section in view (home only: Work, Contact). */
function initCurrentSection() {
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>(".nav-links a[href*='#']"));
  const targets = links.map((a) => document.getElementById(a.hash.slice(1))).filter((el): el is HTMLElement => !!el);
  if (!targets.length || !("IntersectionObserver" in window)) return;
  const inView = new Set<string>();
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) entry.isIntersecting ? inView.add(entry.target.id) : inView.delete(entry.target.id);
    const current = targets.find((t) => inView.has(t.id))?.id;
    for (const link of links) {
      if (link.hash.slice(1) === current) link.setAttribute("aria-current", "location");
      else if (link.getAttribute("aria-current") === "location") link.removeAttribute("aria-current");
    }
  }, { rootMargin: "-45% 0px -50% 0px" });
  targets.forEach((t) => observer.observe(t));
}

type PopoverEl = HTMLElement & { hidePopover?: () => void; showPopover?: () => void };

/** Close a menu after choosing a link; place menus under their buttons where CSS anchoring is missing. */
function initMenus() {
  const anchored = CSS.supports("top: anchor(bottom)");
  document.querySelectorAll<PopoverEl>(".menu[popover]").forEach((menu) => {
    menu.addEventListener("click", (event) => {
      if ((event.target as Element).closest("a")) menu.hidePopover?.();
    });
    if (anchored || menu.classList.contains("menu--site")) return;
    menu.addEventListener("toggle", (event) => {
      if ((event as ToggleEvent).newState !== "open") return;
      const button = document.querySelector<HTMLElement>(`[popovertarget="${menu.id}"]`);
      if (!button) return;
      const r = button.getBoundingClientRect();
      const width = menu.offsetWidth;
      const below = innerHeight - r.bottom > menu.offsetHeight + 16;
      Object.assign(menu.style, {
        position: "fixed", margin: "0",
        left: `${Math.max(8, Math.min(r.left, innerWidth - width - 8))}px`,
        top: below ? `${r.bottom + 8}px` : `${Math.max(8, r.top - menu.offsetHeight - 8)}px`,
      });
    });
  });
  // No popover API (older browsers): the resume buttons become plain links to the full PDF.
  if (!HTMLElement.prototype.hasOwnProperty("popover")) {
    document.querySelectorAll<HTMLButtonElement>("button[popovertarget]").forEach((button) => {
      const menu = document.getElementById(button.getAttribute("popovertarget")!);
      const first = menu?.querySelector<HTMLAnchorElement>("a[href$='detailed.pdf'], a");
      if (!first) return;
      const link = document.createElement("a");
      link.className = button.className;
      link.href = first.href;
      link.innerHTML = button.innerHTML;
      button.replaceWith(link);
    });
  }
}

/**
 * The schematic: the list under the diagram becomes a tabbed picker. Picking a part (click, focus, or pointing at it in
 * the diagram) shows its text and lights it in both layouts. Where motion is welcome it steps through the parts twice
 * on its own once the diagram is in view (`.is-auto` shows a progress line on the current tab), and stops for good as
 * soon as the visitor touches it.
 */
function initSchematic() {
  const figure = document.querySelector<HTMLElement>("[data-schematic]");
  if (!figure) return;
  const buttons = Array.from(figure.querySelectorAll<HTMLButtonElement>(".node-btn"));
  const count = buttons.length;
  const select = (n: number) => {
    figure.dataset.active = String(n);
    for (const button of buttons) {
      const on = button.dataset.node === String(n);
      button.setAttribute("aria-expanded", String(on));
      document.getElementById(button.getAttribute("aria-controls")!)!.hidden = !on;
    }
    figure.querySelectorAll<SVGGElement>(".sn[data-node]").forEach((g) => g.classList.toggle("is-on", g.dataset.node === String(n)));
  };
  let timer = 0;
  let touched = false;
  const stop = () => { clearInterval(timer); timer = 0; touched = true; figure.classList.remove("is-auto"); };
  for (const button of buttons) {
    const pick = () => { stop(); select(Number(button.dataset.node)); };
    button.addEventListener("click", pick);
    button.addEventListener("focus", pick);
  }
  figure.querySelectorAll<SVGGElement>(".sn[data-node]").forEach((g) => g.addEventListener("pointerenter", () => { stop(); select(Number(g.dataset.node)); }));
  figure.classList.add("is-picker");
  select(1);
  if (reducedMotion() || !("IntersectionObserver" in window)) return;
  const start = () => {
    if (touched || timer) return;
    let step = 1;
    select(1);
    figure.classList.add("is-auto");
    timer = window.setInterval(() => {
      step += 1;
      if (step > count * 2) { stop(); select(1); return; }
      select(((step - 1) % count) + 1);
    }, 2600);
  };
  const seen = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) { seen.disconnect(); start(); }
  }, { threshold: 0.35 });
  seen.observe(figure);
}

/**
 * The string: one coral line drawn down the whole home page in page coordinates, from the hero to the close. It loops
 * through the claim, runs down the right margin, wraps every heading block marked `data-string-wrap` in a rounded
 * rectangle from margin to margin, and swings in through each project scene's word. It draws as the page scrolls, its tip (a ring) held near 60% of the screen; with
 * reduced motion it is drawn in full with no tip. Rebuilt whenever the page changes size. Without it (no JavaScript),
 * the per-act threads in the markup stand in. At the close it arrives as a knot beside the question and pulls straight
 * into a check mark as it crosses the screen.
 */
function initString() {
  const hero = document.querySelector<HTMLElement>(".hero");
  const end = document.getElementById("contact");
  if (!hero || !end || !("ResizeObserver" in window)) return;
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.classList.add("string");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  const path = document.createElementNS(ns, "path");
  const knot = document.createElementNS(ns, "path");
  const tip = document.createElementNS(ns, "circle");
  tip.classList.add("string-tip");
  tip.setAttribute("r", "7");
  svg.append(path, knot, tip);
  document.body.append(svg);
  root.classList.add("has-string");
  const still = reducedMotion();
  let total = 0;
  let samples: { len: number; y: number }[] = [];
  let box = { top: 0, left: 0, right: 0, bottom: 0 };
  // The close: one point set drawn as a knot and as a check mark, in a unit box, blended by how far the page has gone.
  const tangle: [number, number][] = [[1, 0], [0.96, 0.16], [0.56, 0.22], [0.22, 0.44], [0.38, 0.78], [0.82, 0.72], [0.94, 0.4], [0.56, 0.28], [0.28, 0.6], [0.56, 0.94], [0.88, 0.86], [0.74, 0.52], [0.42, 0.62], [0.62, 0.8]];
  const check: [number, number][] = [[1, 0], [0.9, 0.05], [0.7, 0.08], [0.5, 0.09], [0.32, 0.12], [0.22, 0.22], [0.22, 0.34], [0.28, 0.46], [0.38, 0.58], [0.5, 0.72], [0.62, 0.58], [0.74, 0.44], [0.85, 0.31], [0.95, 0.18]];
  const curve = (pts: [number, number][]) => {
    let out = `M${pts[0]![0]},${pts[0]![1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] ?? pts[i]!, p1 = pts[i]!, p2 = pts[i + 1]!, p3 = pts[i + 2] ?? p2;
      out += ` C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`;
    }
    return out;
  };
  const drawKnot = (t: number, shown: number) => {
    const w = box.right - box.left, h = box.bottom - box.top;
    const pts = tangle.map(([x, y], i) => {
      const [cx, cy] = check[i]!;
      return [box.left + (x + (cx - x) * t) * w, box.top + (y + (cy - y) * t) * h] as [number, number];
    });
    knot.setAttribute("d", curve(pts));
    const length = knot.getTotalLength();
    knot.style.strokeDasharray = String(length);
    knot.style.strokeDashoffset = String(length * (1 - shown));
  };

  const build = () => {
    const page = (el: Element) => { const r = el.getBoundingClientRect(); return { top: r.top + scrollY, bottom: r.bottom + scrollY, left: r.left, right: r.right }; };
    const width = document.documentElement.clientWidth;
    const gutter = parseFloat(getComputedStyle(document.querySelector(".wrap")!).paddingLeft) || 16;
    const xr = width - Math.max(10, gutter * 0.5);
    const xl = Math.max(10, gutter * 0.5);
    const rr = Math.min(36, gutter);
    const h = page(hero);
    const claim = page(hero.querySelector(".hero-claim")!);
    // The opening: from under the bar at the left, a loop through the claim, out to the right margin.
    let d = `M${xl + gutter},${h.top + 72}`;
    d += ` C${width * 0.2},${claim.top - 20} ${width * 0.7},${claim.top + (claim.bottom - claim.top) * 0.1} ${width * 0.62},${claim.top + (claim.bottom - claim.top) * 0.55}`;
    d += ` C${width * 0.56},${claim.bottom} ${width * 0.36},${claim.top + (claim.bottom - claim.top) * 0.5} ${width * 0.55},${claim.top + (claim.bottom - claim.top) * 0.42}`;
    d += ` C${width * 0.8},${claim.top + (claim.bottom - claim.top) * 0.3} ${xr},${claim.bottom} ${xr},${h.bottom - 40}`;
    // Down the right margin: wrap each marked heading block, and swing in through each project scene's word.
    let swing = 0;
    for (const el of document.querySelectorAll<HTMLElement>("[data-string-wrap], .scene-stage")) {
      const r = page(el);
      if (el.matches(".scene-stage")) {
        const hgt = r.bottom - r.top, deep = swing++ % 2 ? 0.34 : 0.58;
        d += ` V${r.top} C${xr},${r.top + hgt * 0.25} ${width * deep},${r.top + hgt * 0.05} ${width * deep},${r.top + hgt * 0.5}`;
        d += ` C${width * deep},${r.top + hgt * 0.92} ${xr - 30},${r.top + hgt * 0.8} ${xr},${r.bottom + 20}`;
        continue;
      }
      const top = r.top - 36, bottom = r.bottom + 36;
      d += ` V${top - rr} Q${xr},${top} ${xr - rr},${top} H${xl + rr} Q${xl},${top} ${xl},${top + rr} V${bottom - rr} Q${xl},${bottom} ${xl + rr},${bottom} H${xr - rr} Q${xr},${bottom} ${xr},${bottom + rr}`;
    }
    // On to the close, where the knot takes over: beside the question on wide screens, over its right side on narrow ones.
    const close = page(end);
    const question = page(end.querySelector("h2")!);
    const side = end.querySelector(".close-side");
    const wide = width >= 1000 && side;
    box = wide
      ? { top: close.top, left: page(side).left, right: xr, bottom: page(side).top - 48 }
      : { top: close.top, left: width * 0.5, right: xr, bottom: question.bottom + 40 };
    d += ` V${close.top}`;
    // A one-pixel-high box drawn with overflow visible, so the string never adds to the page's height.
    svg.setAttribute("viewBox", `0 0 ${width} 1`);
    svg.setAttribute("width", String(width));
    svg.setAttribute("height", "1");
    path.setAttribute("d", d);
    total = path.getTotalLength();
    samples = [];
    for (let len = 0; len <= total; len += 6) samples.push({ len, y: path.getPointAtLength(len).y });
    path.style.strokeDasharray = String(total);
    draw();
  };

  const draw = () => {
    if (still) { path.style.strokeDashoffset = "0"; tip.style.display = "none"; drawKnot(1, 1); return; }
    const target = scrollY + innerHeight * 0.6;
    let lo = 0;
    while (lo < samples.length - 1 && samples[lo + 1]!.y <= target) lo += 1;
    // Horizontal runs share one y: carry on along them until the path turns down again.
    const len = target <= samples[0]!.y ? 0 : samples[lo]!.len;
    path.style.strokeDashoffset = String(total - len);
    const p = path.getPointAtLength(len);
    tip.setAttribute("cx", String(p.x));
    tip.setAttribute("cy", String(p.y));
    tip.style.opacity = len > 0 && len < total ? "1" : "0";
    // The knot draws in as the tip reaches the close, then pulls straight into a check by the foot of the page.
    const h = box.bottom - box.top;
    const shown = Math.min(1, Math.max(0, (target - box.top) / h));
    // It untangles while in view: from its middle entering the screen to its middle at 35% of the screen height.
    const pull = Math.min(1, Math.max(0, (scrollY + innerHeight - (box.top + h * 0.5)) / (innerHeight * 0.65)));
    drawKnot(pull * pull * (3 - 2 * pull), shown);
  };

  let frame = 0;
  addEventListener("scroll", () => { if (!frame) frame = requestAnimationFrame(() => { frame = 0; draw(); }); }, { passive: true });
  let timer = 0;
  new ResizeObserver(() => { clearTimeout(timer); timer = window.setTimeout(build, 120); }).observe(document.body);
  build();
}

/** The intro plays on every load of the home page; any key, click or scroll skips it. */
function initIntro() {
  if (!root.classList.contains("intro-play") || !document.querySelector("[data-intro]")) return;
  const skip = () => {
    root.classList.remove("intro-play");
    for (const type of ["keydown", "pointerdown", "wheel", "touchstart"]) removeEventListener(type, skip);
  };
  for (const type of ["keydown", "pointerdown", "wheel", "touchstart"]) addEventListener(type, skip, { passive: true });
  setTimeout(skip, 4000);
}

const marks: Record<CheckResult["state"], string> = { pass: "✓", fail: "✕", skip: "–" };

function initSelfTest() {
  const panel = document.getElementById("selftest");
  const button = panel?.querySelector<HTMLButtonElement>("[data-run-checks]");
  const summary = panel?.querySelector<HTMLElement>(".selftest-summary");
  if (!panel || !button || !summary) return;
  const rows = new Map(Array.from(panel.querySelectorAll<HTMLLIElement>(".check")).map((row) => [row.dataset.check!, row]));

  const frame = () => new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 40)));
  button.addEventListener("click", async () => {
    button.disabled = true;
    button.lastChild!.textContent = "Running";
    summary.removeAttribute("data-state");
    summary.textContent = "Running checks against this page…";
    for (const row of rows.values()) { row.dataset.state = "pending"; row.querySelector(".check-mark")!.textContent = "·"; row.querySelector(".check-value")!.textContent = ""; row.querySelector(".check-detail")?.remove(); }
    const tally = { pass: 0, fail: 0, skip: 0 };
    let elapsed = 0;
    for (const check of checks) {
      const row = rows.get(check.id);
      if (!row) continue;
      let result: CheckResult;
      const t0 = performance.now();
      try { result = await check.run(); } catch (error) { result = { state: "fail", value: "error", detail: String(error) }; }
      elapsed += performance.now() - t0;
      tally[result.state] += 1;
      row.dataset.state = result.state;
      row.querySelector(".check-mark")!.textContent = marks[result.state];
      row.querySelector(".check-value")!.textContent = result.value;
      if (result.detail && result.state === "fail") {
        const detail = document.createElement("span");
        detail.className = "check-detail";
        detail.textContent = result.detail;
        row.append(detail);
      }
      await frame();
    }
    // Time spent in the checks themselves, not the pauses that let each row paint.
    const ms = Math.round(elapsed);
    summary.dataset.state = tally.fail ? "fail" : "pass";
    summary.textContent = `${tally.pass} passed · ${tally.fail} failed${tally.skip ? ` · ${tally.skip} not measurable here` : ""} · ${ms} ms`;
    button.disabled = false;
    button.lastChild!.textContent = "Run again";
  });
}

observeVitals();
initTheme();
initCopy();
initCurrentSection();
initMenus();
initIntro();
initString();
initSchematic();
initSelfTest();
// The Scrollcraft harness waits for this before walking the page.
root.classList.add("sc-ready");
