import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  buildConfidenceIntervals,
  clampInteger,
  clampProbability,
  computeHistogram,
  computeSummaryStatistics,
  computeTargetProbabilities,
  createSimulationMetadata,
  generateRunId,
  normalizeHistogramBinCount,
  normalizeIterations,
  normalizeSeed,
  SIMULATION_VERSION,
} from './utils';

describe('normalizeIterations', () => {
  it('clamps values to the configured bounds', () => {
    expect(normalizeIterations({ iterations: 50 })).toBe(100);
    expect(normalizeIterations({ iterations: 250_000 })).toBe(200_000);
    expect(normalizeIterations({ iterations: 5_000 })).toBe(5_000);
  });

  it('falls back to defaults when config is missing', () => {
    expect(normalizeIterations()).toBe(10_000);
  });
});

describe('normalizeHistogramBinCount', () => {
  it('clamps to a sane rendering range', () => {
    expect(normalizeHistogramBinCount(1)).toBe(5);
    expect(normalizeHistogramBinCount(999)).toBe(200);
    expect(normalizeHistogramBinCount(40)).toBe(40);
  });
});

describe('computeSummaryStatistics', () => {
  it('returns zeroed summary for empty samples', () => {
    expect(computeSummaryStatistics([])).toEqual({
      mean: 0,
      median: 0,
      standardDeviation: 0,
      min: 0,
      max: 0,
      percentile10: 0,
      percentile90: 0,
    });
  });

  it('computes standard statistics for a numeric dataset', () => {
    const summary = computeSummaryStatistics([10, 20, 30, 40, 50]);
    expect(summary.mean).toBe(30);
    expect(summary.median).toBe(30);
    expect(summary.min).toBe(10);
    expect(summary.max).toBe(50);
    expect(summary.percentile10).toBe(14);
    expect(summary.percentile90).toBe(46);
    expect(summary.standardDeviation).toBeCloseTo(14.142, 3);
  });
});

describe('buildConfidenceIntervals', () => {
  it('creates symmetric intervals around the requested levels', () => {
    const levels = [0.5, 0.8];
    const intervals = buildConfidenceIntervals([10, 20, 30, 40, 50], levels);
    expect(intervals).toHaveLength(levels.length);
    expect(intervals[0]).toMatchObject({ level: 0.5, lower: 20, upper: 40 });
  });
});

describe('computeHistogram', () => {
  it('produces probability mass that sums to one', () => {
    const samples = [0, 10, 20, 30];
    const histogram = computeHistogram(samples, 4);
    const totalCount = histogram.reduce((sum, bin) => sum + bin.count, 0);
    const totalProbability = histogram.reduce((sum, bin) => sum + bin.probability, 0);

    expect(totalCount).toBe(samples.length);
    expect(totalProbability).toBeCloseTo(1, 10);
    expect(histogram[0].start).toBe(0);
    expect(histogram.at(-1)?.end).toBe(30);
  });
});

describe('computeTargetProbabilities', () => {
  it('deduplicates and sorts targets while computing survival probabilities', () => {
    const sortedSamples = [100, 200, 300, 400];
    const targets = [250, 50, 400, 400];
    const probabilities = computeTargetProbabilities(sortedSamples, targets);

    expect(probabilities.map((entry) => entry.target)).toEqual([50, 250, 400]);
    expect(probabilities.find((entry) => entry.target === 50)?.probability).toBe(1);
    expect(probabilities.find((entry) => entry.target === 250)?.probability).toBe(0.5);
    expect(probabilities.find((entry) => entry.target === 400)?.probability).toBe(0.25);
  });

  it('returns an empty array when inputs are missing', () => {
    expect(computeTargetProbabilities([], [100])).toEqual([]);
    expect(computeTargetProbabilities([10, 20, 30])).toEqual([]);
  });
});

describe('clampProbability', () => {
  it('bounds probability inputs to [0, 1]', () => {
    expect(clampProbability(-0.2)).toBe(0);
    expect(clampProbability(0.4)).toBe(0.4);
    expect(clampProbability(2)).toBe(1);
    expect(clampProbability(Number.NaN)).toBe(0);
  });
});

describe('clampInteger', () => {
  it('enforces integer range constraints', () => {
    expect(clampInteger(10.7, 5, 15)).toBe(10);
    expect(clampInteger(-3, 0, 10)).toBe(0);
    expect(clampInteger(99, 0, 10)).toBe(10);
    expect(clampInteger(Number.NaN, 1, 5)).toBe(1);
  });
});

describe('normalizeSeed', () => {
  it('returns deterministic seeds when provided', () => {
    expect(normalizeSeed(123.8)).toBe(123);
  });

  it('falls back to a timestamp-derived seed', () => {
    vi.spyOn(Date, 'now').mockReturnValue(42);
    expect(normalizeSeed()).toBe(42);
  });
});

describe('createSimulationMetadata', () => {
  it('builds metadata with sensible defaults and overrides', () => {
    const metadata = createSimulationMetadata(
      { iterations: 5_000, seed: 99 },
      { runId: 'custom', generatedAt: '2024-01-01T00:00:00.000Z' },
    );

    expect(metadata.iterations).toBe(5_000);
    expect(metadata.seed).toBe(99);
    expect(metadata.generatedAt).toBe('2024-01-01T00:00:00.000Z');
    expect(metadata.version).toBe(SIMULATION_VERSION);
    expect(metadata.runId).toBe('custom');
  });
});

describe('generateRunId', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('uses crypto.randomUUID when available', () => {
    const mockUUID = '00000000-0000-0000-0000-000000000000';
    const randomUUID = vi.fn(() => mockUUID);
    vi.stubGlobal('crypto', { randomUUID } as unknown as Crypto);

    expect(generateRunId('demo')).toBe(`demo-${mockUUID}`);
    expect(randomUUID).toHaveBeenCalledTimes(1);
  });

  it('falls back to Math.random when crypto is missing', () => {
    vi.stubGlobal('crypto', undefined);
    vi.spyOn(Math, 'random').mockReturnValue(0.123456);

    const runId = generateRunId('demo');
    expect(runId.startsWith('demo-')).toBe(true);
  });
});
