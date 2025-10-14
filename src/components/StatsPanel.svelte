<script lang="ts">
  import type { SimulationRunStatus, SimulationSummary } from '$lib/types';
  import { describeStatus } from '$lib/stores/simulation';

  export let summary: SimulationSummary | undefined;
  export let status: SimulationRunStatus = 'idle';
  export let error: string | undefined;
</script>

<section class="rounded-[var(--radius-card)] border border-white/10 bg-surface/80 p-6 shadow-[var(--shadow-card)] backdrop-blur">
  <header class="mb-3 flex items-center justify-between">
    <h2 class="text-sm font-semibold uppercase tracking-widest text-slate-300">Run Status</h2>
    <span class="text-xs text-slate-500">{describeStatus(status)}</span>
  </header>

  {#if error}
    <div class="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
      {error}
    </div>
  {:else if summary}
    <dl class="grid grid-cols-2 gap-3 text-sm text-slate-200">
      <div>
        <dt class="text-xs uppercase tracking-widest text-slate-500">Mean</dt>
        <dd class="font-semibold">${summary.mean.toLocaleString()}</dd>
      </div>
      <div>
        <dt class="text-xs uppercase tracking-widest text-slate-500">Median</dt>
        <dd class="font-semibold">${summary.median.toLocaleString()}</dd>
      </div>
      <div>
        <dt class="text-xs uppercase tracking-widest text-slate-500">P10</dt>
        <dd class="font-semibold">${summary.percentile10.toLocaleString()}</dd>
      </div>
      <div>
        <dt class="text-xs uppercase tracking-widest text-slate-500">P90</dt>
        <dd class="font-semibold">${summary.percentile90.toLocaleString()}</dd>
      </div>
    </dl>
  {:else}
    <p class="text-sm text-slate-400">
      Once simulations run, key summary statistics will render here for quick executive snapshots.
    </p>
  {/if}
</section>
