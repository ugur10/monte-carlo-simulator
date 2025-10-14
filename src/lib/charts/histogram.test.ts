import { describe, expect, it } from 'vitest';
import type { HistogramBin } from '$lib/types';
import { buildHistogramChartData } from './histogram';

describe('buildHistogramChartData', () => {
  it('returns empty chart data when no bins are provided', () => {
    const chart = buildHistogramChartData([]);
    expect(chart.labels).toEqual([]);
    expect(chart.values).toEqual([]);
    expect(chart.tooltips).toEqual([]);
  });

  it('formats labels and percentages for each bin', () => {
    const bins: HistogramBin[] = [
      { start: 0, end: 50_000, count: 100, probability: 0.2 },
      { start: 50_000, end: 100_000, count: 300, probability: 0.6 },
      { start: 100_000, end: 100_000, count: 100, probability: 0.2 },
    ];

    const chart = buildHistogramChartData(bins);

    expect(chart.labels).toEqual(['0 – 50,000', '50,000 – 100,000', '100,000']);
    expect(chart.values.map((value) => Number(value.toFixed(1)))).toEqual([20, 60, 20]);
    expect(chart.tooltips[1]).toContain('50,000 – 100,000');
    expect(chart.tooltips[1]).toContain('60.0%');
    expect(chart.tooltips[1]).toContain('300');
  });

  it('clamps probabilities to valid percentage ranges', () => {
    const bins: HistogramBin[] = [
      { start: 0, end: 1, count: 1, probability: -0.5 },
      { start: 1, end: 2, count: 1, probability: 1.5 },
    ];

    const chart = buildHistogramChartData(bins);

    expect(chart.values).toEqual([0, 100]);
  });
});
