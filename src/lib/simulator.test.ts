import { describe, expect, it } from 'vitest';

import { simulatePipeline } from './simulator';
import type { Deal, SimulationConfig } from './types';
import { createSeededRng, DEFAULT_CONFIDENCE_LEVELS, normalizeConfidenceLevels } from './utils';

describe('createSeededRng', () => {
  it('produces a deterministic sequence when seeded', () => {
    const seed = 42;
    const first = createSeededRng(seed);
    const second = createSeededRng(seed);

    const firstSequence = Array.from({ length: 5 }, () => first());
    const secondSequence = Array.from({ length: 5 }, () => second());

    expect(secondSequence).toEqual(firstSequence);
    expect(firstSequence.every((value) => value >= 0 && value < 1)).toBe(true);
  });
});

describe('normalizeConfidenceLevels', () => {
  it('falls back to defaults when input is missing or invalid', () => {
    expect(normalizeConfidenceLevels()).toEqual(DEFAULT_CONFIDENCE_LEVELS);
    expect(normalizeConfidenceLevels([1.4, -0.3, Number.NaN])).toEqual(DEFAULT_CONFIDENCE_LEVELS);
  });

  it('sorts, deduplicates, and filters levels', () => {
    expect(normalizeConfidenceLevels([0.95, 0.5, 0.5, 0.8])).toEqual([0.5, 0.8, 0.95]);
  });
});

describe('simulatePipeline', () => {
  const deals: Deal[] = [
    {
      id: 'deal-1',
      name: 'Expansion - Northern Corp',
      amount: 120_000,
      winProbability: 0.6,
      expectedCloseDate: '2025-11-15',
    },
    {
      id: 'deal-2',
      name: 'Net-new - Horizon Labs',
      amount: 80_000,
      winProbability: 0.35,
      expectedCloseDate: '2025-12-01',
    },
  ];

  const baseConfig: SimulationConfig = {
    iterations: 2_000,
    seed: 1_337,
    histogramBinCount: 24,
    revenueTargets: [100_000, 150_000],
  };

  it('produces deterministic results for identical seeds', () => {
    const first = simulatePipeline(deals, baseConfig);
    const second = simulatePipeline(deals, baseConfig);

    expect(second.revenueSamples).toEqual(first.revenueSamples);
    expect(second.histogram).toEqual(first.histogram);
    expect(second.targetProbabilities).toEqual(first.targetProbabilities);
  });

  it('computes metadata, summary stats, and histogram totals', () => {
    const result = simulatePipeline(deals, baseConfig);

    expect(result.metadata.iterations).toBe(baseConfig.iterations);
    expect(result.metadata.seed).toBe(baseConfig.seed);
    expect(result.metadata.runId).toMatch(/^simulation-/);
    expect(result.confidenceIntervals.map((c) => c.level)).toEqual(DEFAULT_CONFIDENCE_LEVELS);

    const expectedMean = deals.reduce((acc, deal) => acc + deal.amount * deal.winProbability, 0);
    expect(Math.abs(result.summary.mean - expectedMean)).toBeLessThan(20_000);

    const histogramCount = result.histogram.reduce((acc, bin) => acc + bin.count, 0);
    expect(histogramCount).toBe(baseConfig.iterations);
  });

  it('calculates target probabilities in ascending order', () => {
    const result = simulatePipeline(deals, baseConfig);
    const targets = result.targetProbabilities.map((entry) => entry.target);

    expect(targets).toEqual([...targets].sort((a, b) => a - b));
    expect(
      result.targetProbabilities.every((entry) => entry.probability >= 0 && entry.probability <= 1),
    ).toBe(true);
  });

  it('supports disabling deal impact analytics', () => {
    const result = simulatePipeline(deals, { ...baseConfig, includeDealImpacts: false });
    expect(result.dealImpacts).toHaveLength(0);
  });

  it('returns zeroed results when no deals are supplied', () => {
    const result = simulatePipeline([], { iterations: 500, seed: 42 });

    expect(result.revenueSamples).toHaveLength(500);
    expect(result.revenueSamples.every((value) => value === 0)).toBe(true);
    expect(result.histogram).toHaveLength(1);
    expect(result.histogram[0]).toMatchObject({
      start: 0,
      end: 0,
      probability: 1,
    });
    expect(result.summary).toMatchObject({
      mean: 0,
      min: 0,
      max: 0,
    });
  });

  it('clamps deal probabilities to the [0, 1] interval', () => {
    const extremeDeals: Deal[] = [
      {
        id: 'negative-prob',
        name: 'Impossible Upsell',
        amount: 10_000,
        winProbability: -0.4,
        expectedCloseDate: '2025-09-01',
      },
      {
        id: 'certain-win',
        name: 'Locked Renewal',
        amount: 25_000,
        winProbability: 1.25,
        expectedCloseDate: '2025-10-01',
      },
    ];

    const result = simulatePipeline(extremeDeals, { iterations: 200, seed: 7 });

    // Negative probabilities should never contribute revenue.
    expect(result.revenueSamples.every((value) => value === 25_000)).toBe(true);
    expect(result.dealImpacts).toHaveLength(extremeDeals.length);
    expect(result.dealImpacts[0].expectedValue).toBe(0);
    expect(result.dealImpacts[1].expectedValue).toBeCloseTo(25_000);
  });

  it('computes deal impact metrics within reasonable bounds', () => {
    const result = simulatePipeline(deals, baseConfig);

    expect(result.dealImpacts).toHaveLength(deals.length);
    result.dealImpacts.forEach((impact, index) => {
      expect(impact.expectedValue).toBeGreaterThanOrEqual(0);
      expect(impact.varianceContribution).toBeGreaterThanOrEqual(0);
      expect(impact.sensitivity).toBeGreaterThanOrEqual(0);
      expect(impact.sensitivity).toBeLessThanOrEqual(1);

      // Expected value should not exceed the deal amount.
      expect(impact.expectedValue).toBeLessThanOrEqual(deals[index].amount);
    });
  });
});
