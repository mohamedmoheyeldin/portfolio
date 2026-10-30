/*
 * The only JavaScript the published site ships. Pages are complete HTML without it; this adds:
 * the theme toggle, copy-address buttons, the current section in the header, menu positioning and closing, the
 * command palette, the Before / Diff / After views on workflow diffs, and the self-test runner.
 */
import { checks, observeVitals, type CheckResult } from "@/lib/selftest";

const root = document.documentElement;
const themeColors = { light: "#f6f5f1", dark: "#0d0d0e" } as const;
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
 * The command palette: a combobox over the options the server rendered. Typing filters by every word; arrows move
 * the active option; Enter opens it. Focus returns to whatever opened the palette.
 */
function initPalette() {
  const dialog = document.getElementById("palette") as HTMLDialogElement | null;
  const input = dialog?.querySelector<HTMLInputElement>("[data-palette-input]");
  const empty = dialog?.querySelector<HTMLElement>(".palette-empty");
  if (!dialog || !input || !empty || typeof dialog.showModal !== "function") {
    document.querySelectorAll("[data-palette-open]").forEach((el) => el.remove());
    return;
  }
  const options = Array.from(dialog.querySelectorAll<HTMLLIElement>("[role='option']"));
  const mac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  document.querySelectorAll("[data-shortcut]").forEach((kbd) => { kbd.textContent = mac ? "⌘K" : "Ctrl K"; });
  let active = 0;
  let opener: HTMLElement | null = null;

  const visibleOptions = () => options.filter((o) => !o.hidden);
  const setActive = (index: number) => {
    const list = visibleOptions();
    if (!list.length) { input.removeAttribute("aria-activedescendant"); return; }
    active = (index + list.length) % list.length;
    list.forEach((o, i) => o.setAttribute("aria-selected", String(i === active)));
    input.setAttribute("aria-activedescendant", list[active]!.id);
    list[active]!.scrollIntoView({ block: "nearest" });
  };
  const filter = () => {
    const words = input.value.toLowerCase().split(/\s+/).filter(Boolean);
    for (const option of options) option.hidden = !words.every((w) => option.dataset.search!.includes(w));
    const any = visibleOptions().length > 0;
    empty.hidden = any;
    input.setAttribute("aria-expanded", String(any));
    setActive(0);
  };
  const open = () => {
    if (dialog.open) return;
    opener = document.activeElement as HTMLElement | null;
    input.value = "";
    filter();
    dialog.showModal();
    input.focus();
  };
  const close = () => { if (dialog.open) dialog.close(); };
  const choose = async (option: HTMLLIElement | undefined) => {
    if (!option) return;
    const { href, action } = option.dataset;
    close();
    if (action === "theme") toggleTheme();
    else if (action === "copy-email") {
      const address = document.querySelector<HTMLElement>("[data-copy]")?.dataset.copy;
      if (address) { try { await copyText(address); } catch { location.href = `mailto:${address}`; } }
    } else if (href) {
      const url = new URL(href, location.href);
      if (url.pathname === location.pathname && url.hash) {
        const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
        if (target) { history.pushState(null, "", url.hash); target.scrollIntoView(); target.focus({ preventScroll: true }); return; }
      }
      location.href = url.href;
    }
  };

  dialog.addEventListener("close", () => { opener?.focus?.(); opener = null; });
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) { close(); return; }
    const option = (event.target as Element).closest<HTMLLIElement>("[role='option']");
    if (option) void choose(option);
  });
  dialog.addEventListener("mousemove", (event) => {
    const option = (event.target as Element).closest<HTMLLIElement>("[role='option']");
    if (option && !option.hidden) setActive(visibleOptions().indexOf(option));
  });
  input.addEventListener("input", filter);
  input.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") { event.preventDefault(); setActive(active + 1); }
    else if (event.key === "ArrowUp") { event.preventDefault(); setActive(active - 1); }
    else if (event.key === "Home" && event.ctrlKey) { event.preventDefault(); setActive(0); }
    else if (event.key === "End" && event.ctrlKey) { event.preventDefault(); setActive(-1); }
    else if (event.key === "Enter") { event.preventDefault(); void choose(visibleOptions()[active]); }
  });
  document.querySelectorAll<HTMLButtonElement>("[data-palette-open]").forEach((button) => button.addEventListener("click", open));
  document.addEventListener("keydown", (event) => {
    const typing = (event.target as Element | null)?.closest("input, textarea, select, [contenteditable='true']");
    if ((event.key === "k" || event.key === "K") && (event.metaKey || event.ctrlKey)) { event.preventDefault(); dialog.open ? close() : open(); }
    else if (event.key === "/" && !typing && !dialog.open) { event.preventDefault(); open(); }
  });
}

/** Before / Diff / After on each workflow diff, and pairing: pointing at a line outlines the line it replaces. */
function initDiffs() {
  document.querySelectorAll<HTMLElement>("[data-diff]").forEach((diff) => {
    const buttons = Array.from(diff.querySelectorAll<HTMLButtonElement>("[data-diff-view]"));
    for (const button of buttons) {
      button.addEventListener("click", () => {
        diff.dataset.view = button.dataset.diffView!;
        buttons.forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
      });
    }
    const lines = Array.from(diff.querySelectorAll<HTMLElement>(".diff-line"));
    const pair = (pairId: string | null) => lines.forEach((line) => line.classList.toggle("is-paired", pairId !== null && line.dataset.pair === pairId));
    for (const line of lines) {
      line.addEventListener("pointerenter", () => pair(line.dataset.pair!));
      line.addEventListener("pointerleave", () => pair(null));
    }
  });
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
initPalette();
initDiffs();
initSelfTest();
// The Scrollcraft harness waits for this before walking the page.
root.classList.add("sc-ready");
