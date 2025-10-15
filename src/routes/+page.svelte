<script lang="ts">
import {
  createDealDraft,
  createSimulationStore,
  removeDeal,
  resetStatus,
  runSimulation,
  upsertDeal,
} from '$lib/stores/simulation';
import type { DealInput } from '$lib/types';
import DealForm from '../components/DealForm.svelte';
import DealList from '../components/DealList.svelte';
import DistributionChart from '../components/DistributionChart.svelte';
import SimulationResults from '../components/SimulationResults.svelte';
import StatsPanel from '../components/StatsPanel.svelte';

const simulation = createSimulationStore();

let draft: DealInput = $state(createDealDraft());
let editingIndex = $state<number | undefined>(undefined);
const formId = 'deal-form';
const isRunning = $derived($simulation.status === 'running');
const canSimulate = $derived($simulation.deals.length > 0 && !isRunning);
const lastDuration = $derived($simulation.result?.metadata.durationMs);
const lastUpdatedAt = $derived($simulation.lastUpdatedAt);

function handleCreate() {
  editingIndex = undefined;
  Object.assign(draft, createDealDraft());
  simulation.update((state) => resetStatus(state));
}

function handleSave(event: CustomEvent<{ deal: DealInput; index?: number }>) {
  const { deal, index } = event.detail;
  const existingId = typeof index === 'number' ? $simulation.deals[index]?.id : undefined;
  const payload: DealInput = existingId ? { ...deal, id: existingId } : deal;

  simulation.update((state) => upsertDeal(state, payload, index));
  handleCreate();
}

function handleEdit(index: number) {
  const deal = $simulation.deals[index];
  if (!deal) return;
  editingIndex = index;
  Object.assign(draft, deal);
  simulation.update((state) => resetStatus(state));
}

function handleDelete(index: number) {
  simulation.update((state) => removeDeal(state, index));
  if (editingIndex === index) {
    handleCreate();
  }
}

function handleCancel() {
  handleCreate();
}

async function handleRunSimulation() {
  if (isRunning || $simulation.deals.length === 0) return;
  await runSimulation(simulation);
}

handleCreate();
</script>

<svelte:head>
  <title>Monte Carlo Sales Pipeline Simulator</title>
</svelte:head>

<main class="page">
  <section class="hero">
    <span class="badge">Phase 4 · UI Foundations</span>

    <h1 class="hero__title">
      Build, simulate, and understand your sales pipeline volatility
    </h1>
    <p class="hero__lead">
      The core Monte Carlo engine and API are live. This milestone sets up the interactive UI: deal
      entry, pipeline overview, and rich visualizations. Over the next iterations we&apos;ll replace
      these scaffolds with fully functional components.
    </p>
  </section>

  <section class="layout-grid">
    <div class="layout-grid__primary">
      <section class="card">
        <header class="card__header card__header--with-actions">
          <div>
            <p class="card__title">
              {typeof editingIndex === 'number' ? 'Edit Deal' : 'Add Deal'}
            </p>
            <p class="card__subtitle">Capture the key inputs needed for Monte Carlo sampling.</p>
          </div>
          <div class="card__actions">
            <button
              type="submit"
              form={formId}
              class="button button--primary"
            >
              {typeof editingIndex === 'number' ? 'Update deal' : 'Save deal'}
            </button>
            <button
              type="button"
              class="button button--ghost"
              onclick={handleCreate}
            >
              Clear form
            </button>
          </div>
        </header>
        <DealForm {draft} index={editingIndex} formId={formId} on:save={handleSave} on:cancel={handleCancel} />
      </section>

      <DealList deals={$simulation.deals} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
    <aside class="layout-grid__aside">
      <StatsPanel
        summary={$simulation.result?.summary}
        status={$simulation.status}
        error={$simulation.error}
        duration={lastDuration}
        lastUpdatedAt={lastUpdatedAt}
      />
      <button
        type="button"
        class="button button--primary"
        onclick={handleRunSimulation}
        disabled={!canSimulate}
      >
        {#if isRunning}
          Running simulation…
        {:else if $simulation.deals.length === 0}
          Add a deal to simulate
        {:else}
          Run Monte Carlo Simulation
        {/if}
      </button>
      <SimulationResults result={$simulation.result} />
    </aside>
  </section>

  <section class="layout-grid__primary">
    <DistributionChart bins={$simulation.result?.histogram ?? []} />
  </section>

  <section class="card card--muted">
    <h2 class="card__title" style="letter-spacing: 0.24em;">Roadmap Highlights</h2>
    <ul class="roadmap-list">
      <li>Hook the deal form and list into reactive stores with validation + optimistic updates.</li>
      <li>Invoke the simulation API from the UI, stream results into charts and stat panels.</li>
      <li>Layer on scenario persistence, exports, dark mode, and polished interactions.</li>
    </ul>
  </section>
</main>
