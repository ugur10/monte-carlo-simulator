<script lang="ts">
  import DealForm from '../components/DealForm.svelte';
  import DealList from '../components/DealList.svelte';
  import DistributionChart from '../components/DistributionChart.svelte';
  import SimulationResults from '../components/SimulationResults.svelte';
  import StatsPanel from '../components/StatsPanel.svelte';
  import {
    createDealDraft,
    createSimulationStore,
    removeDeal,
    resetStatus,
    upsertDeal,
  } from '$lib/stores/simulation';
  import type { DealInput } from '$lib/types';

  const simulation = createSimulationStore();

  let draft = createDealDraft();
  let editingIndex: number | undefined;

  function handleCreate() {
    editingIndex = undefined;
    draft = createDealDraft();
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
    draft = { ...deal };
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

handleCreate();
</script>

<svelte:head>
  <title>Monte Carlo Sales Pipeline Simulator</title>
</svelte:head>

<main class="mx-auto flex min-h-screen max-w-6xl flex-col gap-12 px-6 py-16">
  <section class="space-y-5">
    <span class="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-surface/60 px-4 py-1 text-xs font-medium uppercase tracking-[0.32em] text-primary/80 backdrop-blur">
      <span class="h-1 w-1 rounded-full bg-primary/80" aria-hidden="true"></span>
      Phase 4 · UI Foundations
    </span>

    <h1 class="text-balance text-4xl font-semibold leading-tight text-white md:text-5xl">
      Build, simulate, and understand your sales pipeline volatility
    </h1>
    <p class="max-w-2xl text-balance text-base text-slate-300 md:text-lg">
      The core Monte Carlo engine and API are live. This milestone sets up the interactive UI: deal
      entry, pipeline overview, and rich visualizations. Over the next iterations we&apos;ll replace
      these scaffolds with fully functional components.
    </p>
  </section>

<section class="grid gap-6 lg:grid-cols-3">
    <div class="space-y-6 lg:col-span-2">
      <section class="rounded-[var(--radius-card)] border border-white/10 bg-surface/70 p-6 shadow-[var(--shadow-card)] backdrop-blur">
        <header class="mb-5 flex items-center justify-between">
          <div>
            <h2 class="text-sm font-semibold uppercase tracking-widest text-slate-300">
              {typeof editingIndex === 'number' ? 'Edit Deal' : 'Add Deal'}
            </h2>
            <p class="text-xs text-slate-500">Capture the key inputs needed for Monte Carlo sampling.</p>
          </div>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-primary/40 hover:text-primary"
            on:click={handleCreate}
          >
            New deal
          </button>
        </header>
        <DealForm {draft} index={editingIndex} on:save={handleSave} on:cancel={handleCancel} />
      </section>

      <DealList deals={$simulation.deals} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
    <aside class="space-y-6">
      <StatsPanel
        summary={$simulation.result?.summary}
        status={$simulation.status}
        error={$simulation.error}
      />
      <SimulationResults result={$simulation.result} />
    </aside>
  </section>

  <section class="space-y-6">
    <DistributionChart bins={$simulation.result?.histogram ?? []} />
  </section>

  <section class="rounded-[var(--radius-card)] border border-white/5 bg-gradient-to-br from-surface/90 via-surface-strong/80 to-surface-muted/60 p-6 shadow-[var(--shadow-card)] backdrop-blur">
    <h2 class="text-lg font-semibold text-white">Roadmap Highlights</h2>
    <ul class="mt-4 space-y-3 text-sm text-slate-300">
      <li class="flex items-start gap-2">
        <span class="mt-1 h-1.5 w-1.5 rounded-full bg-primary/80" aria-hidden="true"></span>
        Hook the deal form and list into reactive stores with validation + optimistic updates.
      </li>
      <li class="flex items-start gap-2">
        <span class="mt-1 h-1.5 w-1.5 rounded-full bg-primary/80" aria-hidden="true"></span>
        Invoke the simulation API from the UI, stream results into charts and stat panels.
      </li>
      <li class="flex items-start gap-2">
        <span class="mt-1 h-1.5 w-1.5 rounded-full bg-primary/80" aria-hidden="true"></span>
        Layer on scenario persistence, exports, dark mode, and polished interactions.
      </li>
    </ul>
  </section>
</main>
