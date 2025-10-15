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

<section class="card">
  <header class="card__header card__header--with-actions">
    <div>
      <p class="card__title">Run Status</p>
      <p class="card__subtitle">Simulation progress and recent metrics.</p>
    </div>
    <span class="status-bubble">{statusLabel}</span>
  </header>

  {#if props.error}
    <div class="card-message" style="color: var(--color-danger); border: 1px solid rgba(239, 68, 68, 0.3); background: rgba(239, 68, 68, 0.08); padding: 0.75rem 1rem; border-radius: 14px;">
      {props.error}
    </div>
  {:else if props.summary}
    <dl class="stats-panel__grid">
      <div class="stats-panel__item">
        <dt class="stats-panel__label">Mean</dt>
        <dd class="stats-panel__value">${props.summary.mean.toLocaleString()}</dd>
      </div>
      <div class="stats-panel__item">
        <dt class="stats-panel__label">Median</dt>
        <dd class="stats-panel__value">${props.summary.median.toLocaleString()}</dd>
      </div>
      <div class="stats-panel__item">
        <dt class="stats-panel__label">P10</dt>
        <dd class="stats-panel__value">${props.summary.percentile10.toLocaleString()}</dd>
      </div>
      <div class="stats-panel__item">
        <dt class="stats-panel__label">P90</dt>
        <dd class="stats-panel__value">${props.summary.percentile90.toLocaleString()}</dd>
      </div>
      <div class="stats-panel__item">
        <dt class="stats-panel__label">Runtime</dt>
        <dd class="stats-panel__value">{formattedDuration}</dd>
      </div>
      <div class="stats-panel__item">
        <dt class="stats-panel__label">Last run</dt>
        <dd class="stats-panel__value">{formattedTimestamp}</dd>
      </div>
    </dl>
  {:else}
    <p class="card-message">
      Once simulations run, key summary statistics will render here for quick executive snapshots.
    </p>
  {/if}
</section>
