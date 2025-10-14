<script lang="ts">
  import DealInput from '../components/DealInput.svelte';
  import DealList from '../components/DealList.svelte';
  import DistributionChart from '../components/DistributionChart.svelte';
  import SimulationResults from '../components/SimulationResults.svelte';
  import StatsPanel from '../components/StatsPanel.svelte';
  import { createDealDraft, createSimulationStore } from '$lib/stores/simulation';

  const simulation = createSimulationStore();
  const placeholderDeal = createDealDraft();
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
      <DealInput value={placeholderDeal} />
      <DealList deals={$simulation.deals} />
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
