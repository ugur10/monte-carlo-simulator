<script lang="ts">
  import type { DealInput } from '$lib/types';

  export let deals: DealInput[] = [];
</script>

<!-- Phase 4 scaffold: this panel will render interactive deal rows -->
<section class="rounded-[var(--radius-card)] border border-white/5 bg-surface/80 p-6 shadow-[var(--shadow-card)] backdrop-blur">
  <header class="mb-4 flex items-center justify-between">
    <h2 class="text-sm font-semibold uppercase tracking-widest text-slate-300">
      Pipeline Deals
    </h2>
    <span class="text-xs text-slate-500">{deals.length} total</span>
  </header>

  {#if deals.length === 0}
    <p class="text-sm text-slate-400">
      No deals yet — once the form is wired up, submitted opportunities will be listed here with edit
      and remove actions.
    </p>
  {:else}
    <ul class="space-y-2 text-sm text-slate-300">
      {#each deals as deal, index}
        <li class="rounded-xl border border-white/10 bg-surface-strong/70 px-4 py-3">
          <div class="flex items-center justify-between">
            <span class="font-medium text-white">{deal.name || `Deal #${index + 1}`}</span>
            <span class="text-xs text-slate-400">{deal.expectedCloseDate}</span>
          </div>
          <div class="mt-2 flex flex-wrap gap-4 text-xs text-slate-400">
            <span>Amount: ${deal.amount.toLocaleString()}</span>
            <span>Win rate: {(deal.winProbability * 100).toFixed(0)}%</span>
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</section>
