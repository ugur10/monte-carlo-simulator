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

<section class="card">
  <header class="card__header card__header--with-actions">
    <div>
      <p class="card__title">Pipeline Deals</p>
      <p class="card__subtitle">Track opportunity amounts, probabilities, and close timing.</p>
    </div>
    <span class="muted-text">{props.deals.length} total</span>
  </header>

  {#if props.deals.length === 0}
    <p class="pipeline-empty">
      Add a deal to begin exploring probabilistic outcomes. You can edit or remove entries at any time.
    </p>
  {:else}
    <ul class="pipeline-list">
      {#each props.deals as deal, index}
        <li class="pipeline-item">
          <div class="pipeline-item__header">
            <div>
              <p class="pipeline-item__title">{deal.name || `Deal #${index + 1}`}</p>
              <p class="pipeline-item__subtitle">{deal.owner ?? 'Unassigned owner'}</p>
            </div>
            <div class="card__actions">
              <button type="button" class="button button--ghost" onclick={() => edit(index)}>
                Edit
              </button>
              <button type="button" class="button button--ghost" onclick={() => remove(index)}>
                Remove
              </button>
            </div>
          </div>

          <dl class="pipeline-item__meta">
            <div class="meta-block">
              <dt>Amount</dt>
              <dd>${deal.amount.toLocaleString()}</dd>
            </div>
            <div class="meta-block">
              <dt>Win rate</dt>
              <dd>{(deal.winProbability * 100).toFixed(0)}%</dd>
            </div>
            <div class="meta-block">
              <dt>Expected close</dt>
              <dd>{deal.expectedCloseDate}</dd>
            </div>
          </dl>

          {#if deal.stage || deal.notes}
            <div class="pipeline-item__notes">
              {#if deal.stage}
                <p><strong>Stage:</strong> {deal.stage}</p>
              {/if}
              {#if deal.notes}
                <p style="white-space: pre-wrap;">{deal.notes}</p>
              {/if}
            </div>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</section>
