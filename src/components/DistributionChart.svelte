<script lang="ts">
  import type { HistogramBin } from '$lib/types';

  export let bins: HistogramBin[] = [];
</script>

<!-- Placeholder for forthcoming Chart.js histogram integration -->
<section class="rounded-[var(--radius-card)] border border-white/10 bg-surface/70 p-6 shadow-[var(--shadow-card)] backdrop-blur">
  <header class="mb-3 flex items-center justify-between">
    <h2 class="text-sm font-semibold uppercase tracking-widest text-slate-300">
      Revenue Distribution
    </h2>
    <span class="text-xs text-slate-500">{bins.length} bins</span>
  </header>

  {#if bins.length === 0}
    <p class="text-sm text-slate-400">
      A responsive histogram will render here once the Chart.js canvas layer is wired up. For now we
      keep a compact placeholder to cement layout.
    </p>
  {:else}
    <div class="rounded-lg border border-white/5 bg-black/20 p-4 text-xs text-slate-300">
      <p class="mb-2 font-semibold text-slate-200">Sample bins</p>
      <ul class="space-y-1">
        {#each bins.slice(0, 6) as bin}
          <li>
            ${bin.start.toLocaleString()} – ${bin.end.toLocaleString()} •
            {(bin.probability * 100).toFixed(1)}%
          </li>
        {/each}
        {#if bins.length > 6}
          <li class="text-slate-500">…{bins.length - 6} additional bins</li>
        {/if}
      </ul>
    </div>
  {/if}
</section>
