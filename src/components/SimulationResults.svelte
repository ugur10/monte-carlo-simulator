<script lang="ts">
import type { SimulationResult } from '$lib/types';

const props = $props<{ result?: SimulationResult }>();
const confidenceIntervals = $derived(props.result?.confidenceIntervals ?? []);
const targetProbabilities = $derived(props.result?.targetProbabilities ?? []);
</script>

<section class="card">
  <header class="card__header">
    <p class="card__title">Simulation Output</p>
    <p class="card__subtitle">Insights from the most recent Monte Carlo run.</p>
  </header>

  {#if props.result}
    <div class="pipeline-list">
      <div class="card-message" style="color: var(--color-text); font-size: 0.95rem;">
        <p style="margin: 0;">
          Last run ID:
          <span style="font-family: var(--font-sans); font-weight: 600; color: var(--color-text-soft);">
            {props.result.metadata.runId}
          </span>
        </p>
        <p style="margin: 0.35rem 0 0;">
          Iterations:
          <span style="font-weight: 600;">{props.result.metadata.iterations.toLocaleString()}</span>
        </p>
        <p style="margin: 0.35rem 0 0;">
          Mean revenue:
          <span style="font-weight: 600;">${props.result.summary.mean.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
        </p>
      </div>

      {#if confidenceIntervals.length}
        <div>
          <h3 class="card__subtitle" style="text-transform: uppercase; letter-spacing: 0.24em;">
            Confidence Bands
          </h3>
          <table class="results-table">
            <thead>
              <tr>
                <th style="text-align: left;">Level</th>
                <th style="text-align: right;">Lower</th>
                <th style="text-align: right;">Upper</th>
              </tr>
            </thead>
            <tbody>
              {#each confidenceIntervals as interval}
                <tr>
                  <td>{Math.round(interval.level * 100)}%</td>
                  <td style="text-align: right;">
                    ${interval.lower.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>
                  <td style="text-align: right;">
                    ${interval.upper.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}

      {#if targetProbabilities.length}
        <div>
          <h3 class="card__subtitle" style="text-transform: uppercase; letter-spacing: 0.24em;">
            Target Attainment
          </h3>
          <ul class="pipeline-list">
            {#each targetProbabilities as entry}
              <li class="pipeline-item__notes" style="display: flex; justify-content: space-between; align-items: center;">
                <span>${entry.target.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                <span style="font-weight: 600;">{(entry.probability * 100).toFixed(1)}%</span>
              </li>
            {/each}
          </ul>
        </div>
      {/if}
    </div>
  {:else}
    <p class="card-message">
      Trigger a simulation to populate revenue distributions, confidence bands, and target probabilities here.
    </p>
  {/if}
</section>
