<script lang="ts">
  import type { SimulationResult } from '$lib/types';

  export let result: SimulationResult | undefined;
</script>

<!-- Placeholder for aggregated metrics, confidence intervals, and summary callouts -->
<section class="rounded-[var(--radius-card)] border border-white/10 bg-surface/80 p-6 shadow-[var(--shadow-card)] backdrop-blur">
  <header class="mb-3">
    <h2 class="text-sm font-semibold uppercase tracking-widest text-slate-300">
      Simulation Output
    </h2>
  </header>

  {#if result}
    <div class="space-y-2 text-sm text-slate-300">
      <p>
        Last run ID: <span class="font-mono text-xs">{result.metadata.runId}</span>
      </p>
      <p>
        Iterations: <span class="font-semibold">{result.metadata.iterations.toLocaleString()}</span>
        • Runtime: {result.metadata.durationMs?.toFixed(2) ?? '—'} ms
      </p>
      <p>
        Mean revenue: $
        {result.summary.mean.toLocaleString(undefined, { maximumFractionDigits: 0 })}
      </p>
    </div>
  {:else}
    <p class="text-sm text-slate-400">
      Trigger a simulation to populate revenue distributions, confidence bands, and target
      probabilities here.
    </p>
  {/if}
</section>
