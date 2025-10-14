<script lang="ts">
import type { SimulationResult } from '$lib/types';

const props = $props<{ result?: SimulationResult }>();
const confidenceIntervals = $derived(props.result?.confidenceIntervals ?? []);
const targetProbabilities = $derived(props.result?.targetProbabilities ?? []);
</script>

<section class="rounded-[var(--radius-card)] border border-slate-200 bg-white p-6 shadow-[var(--shadow-card)]">
  <header class="mb-3">
    <h2 class="text-sm font-semibold uppercase tracking-widest text-slate-500">Simulation Output</h2>
  </header>

  {#if props.result}
    <div class="space-y-4 text-sm text-slate-600">
      <div class="space-y-1">
        <p>
          Last run ID: <span class="font-mono text-xs text-slate-500">{props.result.metadata.runId}</span>
        </p>
        <p>
          Iterations: <span class="font-semibold text-slate-900">{props.result.metadata.iterations.toLocaleString()}</span>
        </p>
        <p>
          Mean revenue: <span class="font-semibold text-slate-900">${props.result.summary.mean.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
        </p>
      </div>

      {#if confidenceIntervals.length}
        <div>
          <h3 class="text-xs font-semibold uppercase tracking-widest text-slate-400">Confidence Bands</h3>
          <table class="mt-2 w-full table-fixed border-separate border-spacing-y-1 text-xs">
            <thead class="text-slate-500">
              <tr>
                <th class="text-left">Level</th>
                <th class="text-right">Lower</th>
                <th class="text-right">Upper</th>
              </tr>
            </thead>
            <tbody>
              {#each confidenceIntervals as interval}
                <tr class="rounded-lg bg-slate-50">
                  <td class="rounded-l-lg px-3 py-2 font-medium text-slate-700">{Math.round(interval.level * 100)}%</td>
                  <td class="px-3 py-2 text-right tabular-nums">
                    <span class="text-slate-900">${interval.lower.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </td>
                  <td class="rounded-r-lg px-3 py-2 text-right tabular-nums">
                    <span class="text-slate-900">${interval.upper.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}

      {#if targetProbabilities.length}
        <div>
          <h3 class="text-xs font-semibold uppercase tracking-widest text-slate-400">Target Attainment</h3>
          <ul class="mt-2 space-y-1 text-xs">
            {#each targetProbabilities as entry}
              <li class="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                <span class="text-slate-600">${entry.target.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                <span class="font-semibold text-slate-900">{(entry.probability * 100).toFixed(1)}%</span>
              </li>
            {/each}
          </ul>
        </div>
      {/if}
    </div>
  {:else}
    <p class="text-sm text-slate-500">
      Trigger a simulation to populate revenue distributions, confidence bands, and target probabilities here.
    </p>
  {/if}
</section>
