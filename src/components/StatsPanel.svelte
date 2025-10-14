<script lang="ts">
import { describeStatus } from '$lib/stores/simulation';
import type { SimulationRunStatus, SimulationSummary } from '$lib/types';

const props = $props<{
  summary?: SimulationSummary;
  status?: SimulationRunStatus;
  error?: string;
  duration?: number;
  lastUpdatedAt?: string;
}>();

const statusLabel = $derived(describeStatus(props.status ?? 'idle'));
const formattedDuration = $derived(
  typeof props.duration === 'number' ? `${props.duration.toFixed(2)} ms` : '—',
);
const formattedTimestamp = $derived(
  props.lastUpdatedAt ? new Date(props.lastUpdatedAt).toLocaleString() : '—',
);
</script>

<section class="rounded-[var(--radius-card)] border border-white/10 bg-surface/80 p-6 shadow-[var(--shadow-card)] backdrop-blur">
  <header class="mb-3 flex items-center justify-between">
    <h2 class="text-sm font-semibold uppercase tracking-widest text-slate-300">Run Status</h2>
    <span class="text-xs text-slate-500">{statusLabel}</span>
  </header>

  {#if props.error}
    <div class="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
      {props.error}
    </div>
  {:else if props.summary}
    <dl class="grid grid-cols-2 gap-3 text-sm text-slate-200">
      <div>
        <dt class="text-xs uppercase tracking-widest text-slate-500">Mean</dt>
        <dd class="font-semibold">${props.summary.mean.toLocaleString()}</dd>
      </div>
      <div>
        <dt class="text-xs uppercase tracking-widest text-slate-500">Median</dt>
        <dd class="font-semibold">${props.summary.median.toLocaleString()}</dd>
      </div>
      <div>
        <dt class="text-xs uppercase tracking-widest text-slate-500">P10</dt>
        <dd class="font-semibold">${props.summary.percentile10.toLocaleString()}</dd>
      </div>
      <div>
        <dt class="text-xs uppercase tracking-widest text-slate-500">P90</dt>
        <dd class="font-semibold">${props.summary.percentile90.toLocaleString()}</dd>
      </div>
      <div>
        <dt class="text-xs uppercase tracking-widest text-slate-500">Runtime</dt>
        <dd class="font-semibold">{formattedDuration}</dd>
      </div>
      <div>
        <dt class="text-xs uppercase tracking-widest text-slate-500">Last run</dt>
        <dd class="font-semibold">{formattedTimestamp}</dd>
      </div>
    </dl>
  {:else}
    <p class="text-sm text-slate-400">
      Once simulations run, key summary statistics will render here for quick executive snapshots.
    </p>
  {/if}
</section>
