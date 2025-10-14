<script lang="ts">
import type { ChartConfiguration, TooltipItem } from 'chart.js';
import { onDestroy, onMount } from 'svelte';
import { buildHistogramChartData } from '$lib/charts/histogram';
import type { HistogramBin } from '$lib/types';

const props = $props<{ bins: HistogramBin[] }>();

let canvas = $state<HTMLCanvasElement | null>(null);
let chart: import('chart.js').Chart<'bar'> | null = null;
let chartModulePromise: Promise<typeof import('chart.js/auto')> | null = null;

let tooltips: string[] = [];

function loadChartModule() {
  if (!chartModulePromise) {
    chartModulePromise = import('chart.js/auto');
  }
  return chartModulePromise;
}

const isBrowser = typeof window !== 'undefined';

async function updateChart() {
  if (!isBrowser || !canvas) return;

  const chartData = buildHistogramChartData(props.bins);
  tooltips = chartData.tooltips;

  if (!chartData.labels.length) {
    chart?.destroy();
    chart = null;
    return;
  }

  const { Chart } = await loadChartModule();

  const configuration: ChartConfiguration<'bar'> = {
    type: 'bar',
    data: {
      labels: chartData.labels,
      datasets: [
        {
          label: 'Probability (%)',
          data: chartData.values,
          backgroundColor: 'rgba(94, 234, 212, 0.45)',
          borderColor: 'rgba(94, 234, 212, 0.9)',
          borderWidth: 1,
          borderRadius: 6,
          maxBarThickness: 42,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: {
            maxRotation: 0,
            minRotation: 0,
            autoSkip: true,
            maxTicksLimit: 6,
            callback(value) {
              const index = Number(value);
              const label = chartData.labels[index];
              return typeof label === 'string' ? label.replace(' – ', '–') : label;
            },
            color: '#94a3b8',
          },
          grid: {
            display: false,
          },
        },
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback(value) {
              return `${value}%`;
            },
            color: '#94a3b8',
          },
          grid: {
            color: 'rgba(148, 163, 184, 0.15)',
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label(context: TooltipItem<'bar'>) {
              return tooltips[context.dataIndex] ?? '';
            },
          },
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          borderColor: 'rgba(94, 234, 212, 0.3)',
          borderWidth: 1,
          titleColor: '#e2e8f0',
          bodyColor: '#cbd5f5',
        },
      },
    },
  };

  if (chart) {
    chart.data = configuration.data;
    chart.options = configuration.options ?? chart.options;
    chart.update();
    return;
  }

  chart = new Chart(canvas, configuration);
}

onMount(() => {
  void updateChart();
});

onDestroy(() => {
  chart?.destroy();
  chart = null;
});

$effect(() => {
  if (isBrowser) {
    void updateChart();
  }
});
</script>

<section class="rounded-[var(--radius-card)] border border-white/10 bg-surface/70 p-6 shadow-[var(--shadow-card)] backdrop-blur">
  <header class="mb-3 flex items-center justify-between">
    <h2 class="text-sm font-semibold uppercase tracking-widest text-slate-300">Revenue Distribution</h2>
    <span class="text-xs text-slate-500">{props.bins.length} bins</span>
  </header>

  {#if props.bins.length === 0}
    <p class="text-sm text-slate-400">
      Add deals and run a simulation to render the revenue distribution histogram.
    </p>
  {:else}
    <div class="relative h-72 w-full">
      <canvas bind:this={canvas} aria-label="Revenue distribution histogram"></canvas>
    </div>
  {/if}
</section>
