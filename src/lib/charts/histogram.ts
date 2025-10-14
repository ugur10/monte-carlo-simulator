import type { HistogramBin } from '$lib/types';

export interface HistogramChartData {
  labels: string[];
  values: number[];
  tooltips: string[];
}

/**
 * Converts Monte Carlo histogram bins into Chart.js-friendly labels and values.
 * Values are returned as percentages (0-100) for display purposes.
 */
export function buildHistogramChartData(bins: HistogramBin[]): HistogramChartData {
  if (!bins.length) {
    return {
      labels: [],
      values: [],
      tooltips: [],
    };
  }

  const labels: string[] = [];
  const values: number[] = [];
  const tooltips: string[] = [];

  for (const bin of bins) {
    const label = formatRange(bin.start, bin.end);
    const percentage = clampToPercentage(bin.probability * 100);

    labels.push(label);
    values.push(percentage);
    tooltips.push(`${label} • ${percentage.toFixed(1)}% (${bin.count.toLocaleString()} samples)`);
  }

  return { labels, values, tooltips };
}

function clampToPercentage(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0;
  if (value > 100) return 100;
  return value;
}

function formatRange(start: number, end: number): string {
  const startLabel = formatCurrency(start);
  const endLabel = formatCurrency(end);
  return start === end ? startLabel : `${startLabel} – ${endLabel}`;
}

function formatCurrency(value: number): string {
  return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
}
