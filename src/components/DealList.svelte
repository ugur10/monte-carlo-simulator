<script lang="ts">
import type { DealInput } from '$lib/types';

const props = $props<{
  deals: DealInput[];
  onEdit?: (index: number) => void;
  onDelete?: (index: number) => void;
}>();

function edit(index: number) {
  props.onEdit?.(index);
}

function remove(index: number) {
  props.onDelete?.(index);
}
</script>

<section class="rounded-[var(--radius-card)] border border-white/5 bg-surface/80 p-6 shadow-[var(--shadow-card)] backdrop-blur">
  <header class="mb-4 flex items-center justify-between">
    <div>
      <h2 class="text-sm font-semibold uppercase tracking-widest text-slate-300">Pipeline Deals</h2>
      <p class="text-xs text-slate-500">Track opportunity amounts, probabilities, and close timing.</p>
    </div>
    <span class="text-xs text-slate-500">{props.deals.length} total</span>
  </header>

  {#if props.deals.length === 0}
    <p class="text-sm text-slate-400">
      Add a deal to begin exploring probabilistic outcomes. You can edit or remove entries at any time.
    </p>
  {:else}
    <ul class="space-y-3 text-sm text-slate-300">
      {#each props.deals as deal, index}
        <li class="rounded-xl border border-white/10 bg-surface-strong/70 px-4 py-3 shadow-inner shadow-black/10">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span class="text-xs uppercase tracking-[0.2em] text-slate-500">Deal</span>
              <p class="font-medium text-white">{deal.name || `Deal #${index + 1}`}</p>
              <p class="text-xs text-slate-500">{deal.owner ?? 'Unassigned owner'}</p>
            </div>

            <div class="flex items-center gap-2">
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-xs font-medium text-slate-200 transition hover:border-white/40 hover:bg-primary/10 hover:text-primary"
                onclick={() => edit(index)}
              >
                Edit
              </button>
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-xs font-medium text-slate-200 transition hover:border-danger/50 hover:bg-danger/10 hover:text-danger"
                onclick={() => remove(index)}
              >
                Remove
              </button>
            </div>
          </div>

          <dl class="mt-3 grid gap-4 sm:grid-cols-3">
            <div>
              <dt class="text-xs uppercase tracking-[0.24em] text-slate-500">Amount</dt>
              <dd class="text-sm font-semibold text-white">${deal.amount.toLocaleString()}</dd>
            </div>

            <div>
              <dt class="text-xs uppercase tracking-[0.24em] text-slate-500">Win rate</dt>
              <dd class="text-sm font-semibold text-white">{(deal.winProbability * 100).toFixed(0)}%</dd>
            </div>

            <div>
              <dt class="text-xs uppercase tracking-[0.24em] text-slate-500">Expected close</dt>
              <dd class="text-sm font-semibold text-white">{deal.expectedCloseDate}</dd>
            </div>
          </dl>

          {#if deal.stage || deal.notes}
            <div class="mt-3 rounded-lg bg-black/20 px-3 py-2 text-xs text-slate-400">
              {#if deal.stage}
                <p><span class="font-semibold text-slate-300">Stage:</span> {deal.stage}</p>
              {/if}
              {#if deal.notes}
                <p class="mt-2 whitespace-pre-wrap leading-relaxed text-slate-300">{deal.notes}</p>
              {/if}
            </div>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</section>
