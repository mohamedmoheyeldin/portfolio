/*
 * The only JavaScript the published site ships. Pages are complete HTML without it; this adds:
 * the theme toggle, copy-address buttons, the current section in the header, closing the phone menu after a jump,
 * a link fallback where the popover API is missing, and the self-test runner.
 */
import { checks, observeVitals, type CheckResult } from "@/lib/selftest";

const root = document.documentElement;
const themeColors = { light: "#f6f4ef", dark: "#131312" } as const;

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

function initTheme() {
  document.querySelectorAll<HTMLButtonElement>("[data-theme-toggle]").forEach((button) => {
    syncThemeButton(button);
    button.addEventListener("click", () => {
      const flip = () => setTheme(!root.classList.contains("dark-mode"));
      const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
      if (doc.startViewTransition && matchMedia("(prefers-reduced-motion: no-preference)").matches) doc.startViewTransition(flip);
      else flip();
    });
  });
  // Follow the system while the visitor has not chosen.
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (event) => {
    let saved: string | null = null;
    try { saved = localStorage.getItem("theme"); } catch { /* ignore */ }
    if (!saved) { root.classList.toggle("dark-mode", event.matches); document.querySelectorAll<HTMLButtonElement>("[data-theme-toggle]").forEach(syncThemeButton); }
  });
}

function initCopy() {
  document.querySelectorAll<HTMLButtonElement>("[data-copy]").forEach((button) => {
    const original = button.textContent;
    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(button.dataset.copy!);
        button.textContent = "Copied";
      } catch {
        button.textContent = "Press Ctrl+C";
        const range = document.createRange();
        const target = document.getElementById(button.getAttribute("aria-describedby") ?? "");
        if (target) { range.selectNodeContents(target); getSelection()?.removeAllRanges(); getSelection()?.addRange(range); }
      }
      setTimeout(() => { button.textContent = original; }, 1800);
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

/** Close the phone menu after choosing a link, so the jump is visible. */
function initMenus() {
  document.querySelectorAll<HTMLElement>("[popover]").forEach((menu) => {
    menu.addEventListener("click", (event) => {
      if ((event.target as Element).closest("a")) (menu as HTMLElement & { hidePopover?: () => void }).hidePopover?.();
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
initSelfTest();
// The Scrollcraft harness waits for this before walking the page.
root.classList.add("sc-ready");
