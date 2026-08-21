import type { AssistantSnapshot } from '@/lib/job-assistant';

declare global {
  interface Window { __ASSISTANT_FALLBACK__: AssistantSnapshot }
}

const root = document.querySelector<HTMLElement>('[data-assistant-root]');
if (!root) throw new Error('Assistant dashboard root is missing.');

const serviceUrl = root.dataset.serviceUrl ?? 'http://127.0.0.1:8787';
let snapshot = window.__ASSISTANT_FALLBACK__;
let previousStats: Partial<AssistantSnapshot['stats']> = {};

function render(): void {
  const live = snapshot.mode === 'live';
  root!.querySelector<HTMLElement>('[data-flow-map]')?.setAttribute('data-telemetry-mode', live ? 'live' : 'demo');
  for (const [name, value] of Object.entries(snapshot.stats)) {
    root!.querySelectorAll<HTMLElement>(`[data-stat="${name}"], [data-flow-value="${name}"]`).forEach((element) => {
      element.textContent = live ? String(value) : '—';
    });
    if (live && previousStats[name as keyof AssistantSnapshot['stats']] !== undefined && previousStats[name as keyof AssistantSnapshot['stats']] !== value) {
      const stage = root!.querySelector<HTMLElement>(`[data-flow-stage="${name}"]`);
      stage?.classList.add('is-updated');
      window.setTimeout(() => stage?.classList.remove('is-updated'), 900);
    }
  }
  previousStats = { ...snapshot.stats };
  const syncLabel = live ? snapshot.lastSyncAt ?? 'Live sanitized telemetry' : 'Live telemetry unavailable in local preview';
  root!.querySelector<HTMLElement>('[data-sync-label]')!.textContent = syncLabel;
  root!.querySelector<HTMLElement>('[data-flow-updated]')!.textContent = live ? syncLabel : 'No production values are simulated in local preview.';
  root!.querySelector<HTMLElement>('[data-runtime-updated]')!.textContent = syncLabel;
  root!.querySelector<HTMLElement>('[data-telemetry-label]')!.textContent = live ? 'Live sanitized telemetry' : 'Waiting for live telemetry';
  root!.querySelector<HTMLElement>('[data-runtime-mode]')!.textContent = live ? 'LIVE AGGREGATES' : 'NO LIVE DATA';
  root!.querySelector<HTMLElement>('[data-dashboard-provenance]')!.textContent = live ? 'Live sanitized totals' : 'No simulated totals';
}

async function loadSnapshot(): Promise<void> {
  root!.querySelector<HTMLElement>('[data-flow-map]')?.classList.add('is-refreshing');
  try {
    const response = await fetch(`${serviceUrl}/api/public-snapshot`, { signal: AbortSignal.timeout(2500) });
    if (!response.ok) throw new Error(`Service returned ${response.status}`);
    snapshot = await response.json() as AssistantSnapshot;
  } catch {
    snapshot = window.__ASSISTANT_FALLBACK__;
  }
  render();
  root!.querySelector<HTMLElement>('[data-flow-map]')?.classList.remove('is-refreshing');
}

render();
void loadSnapshot();
window.setInterval(() => {
  if (document.visibilityState === 'visible') void loadSnapshot();
}, 30_000);
