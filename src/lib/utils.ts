import type {
  ConfidenceInterval,
  HistogramBin,
  SimulationConfig,
  SimulationMetadata,
  SimulationSummary,
  TargetProbability,
} from './types';

export type RandomGenerator = () => number;

const UINT32_MAX = 0xffffffff;

export const DEFAULT_SIMULATION_ITERATIONS = 10_000;
export const DEFAULT_CONFIDENCE_LEVELS: readonly number[] = [0.5, 0.8, 0.95];
export const DEFAULT_HISTOGRAM_BIN_COUNT = 40;
export const SIMULATION_VERSION = '0.1.0-dev';

export function createSeededRng(seed: number = Date.now()): RandomGenerator {
  let value = seed >>> 0;
  return () => {
    value = (value + 0x6d2b79f5) | 0;
    let t = Math.imul(value ^ (value >>> 15), value | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / (UINT32_MAX + 1);
  };
}

export function normalizeIterations(config?: SimulationConfig): number {
  const iterations = config?.iterations ?? DEFAULT_SIMULATION_ITERATIONS;
  return clampInteger(iterations, 100, 200_000);
}

export function normalizeConfidenceLevels(levels?: number[]): number[] {
  if (!levels || levels.length === 0) {
    return [...DEFAULT_CONFIDENCE_LEVELS];
  }

  const normalized = Array.from(
    new Set(
      levels
        .filter((level) => Number.isFinite(level))
        .map((level) => Number(level))
        .filter((level) => level > 0 && level < 1),
    ),
  ).sort((a, b) => a - b);

  return normalized.length ? normalized : [...DEFAULT_CONFIDENCE_LEVELS];
}

export function normalizeHistogramBinCount(binCount?: number): number {
  if (typeof binCount !== 'number' || !Number.isFinite(binCount)) {
    return DEFAULT_HISTOGRAM_BIN_COUNT;
  }

  return clampInteger(binCount, 5, 200);
}

export function calculatePercentile(sortedValues: readonly number[], percentile: number): number {
  if (sortedValues.length === 0) {
    return 0;
  }

  if (percentile <= 0) {
    return sortedValues[0] ?? 0;
  }

  if (percentile >= 1) {
    return sortedValues[sortedValues.length - 1] ?? 0;
  }

  const index = (sortedValues.length - 1) * percentile;
  const lowerIndex = Math.floor(index);
  const upperIndex = Math.ceil(index);
  const weight = index - lowerIndex;
  const lower = sortedValues[lowerIndex] ?? 0;
  const upper = sortedValues[upperIndex] ?? lower;
  return lower + (upper - lower) * weight;
}

export function computeSummaryStatistics(samples: readonly number[]): SimulationSummary {
  if (!samples.length) {
    return {
      mean: 0,
      median: 0,
      standardDeviation: 0,
      min: 0,
      max: 0,
      percentile10: 0,
      percentile90: 0,
    };
  }

  const sorted = sortNumbers(samples);
  const mean = sorted.reduce((acc, value) => acc + value, 0) / sorted.length;
  const variance =
    sorted.reduce((acc, value) => {
      const diff = value - mean;
      return acc + diff * diff;
    }, 0) / sorted.length;
  return {
    mean,
    median: calculatePercentile(sorted, 0.5),
    standardDeviation: Math.sqrt(variance),
    min: sorted[0] ?? 0,
    max: sorted[sorted.length - 1] ?? 0,
    percentile10: calculatePercentile(sorted, 0.1),
    percentile90: calculatePercentile(sorted, 0.9),
  };
}

export function buildConfidenceIntervals(
  samples: readonly number[],
  levels: readonly number[],
): ConfidenceInterval[] {
  if (!samples.length) {
    return levels.map((level) => ({
      level,
      lower: 0,
      upper: 0,
    }));
  }

  const sorted = sortNumbers(samples);
  return levels.map((level) => {
    const tail = (1 - level) / 2;
    return {
      level,
      lower: calculatePercentile(sorted, tail),
      upper: calculatePercentile(sorted, 1 - tail),
    };
  });
}

export function computeHistogram(samples: readonly number[], binCount: number): HistogramBin[] {
  if (!samples.length) {
    return [];
  }

  const min = Math.min(...samples);
  const max = Math.max(...samples);

  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return [];
  }

  if (min === max) {
    return [
      {
        start: min,
        end: max,
        count: samples.length,
        probability: 1,
      },
    ];
  }

  const effectiveBinCount = Math.max(1, binCount | 0);
  const range = max - min;
  const width = range / effectiveBinCount;

  const bins: HistogramBin[] = Array.from({ length: effectiveBinCount }, (_, index) => {
    const start = min + index * width;
    const end = index === effectiveBinCount - 1 ? max : start + width;
    return { start, end, count: 0, probability: 0 };
  });

  for (const sample of samples) {
    const clamped = Math.min(Math.max(sample, min), max);
    let index = width === 0 ? 0 : Math.floor((clamped - min) / width);
    if (index >= effectiveBinCount) {
      index = effectiveBinCount - 1;
    } else if (index < 0) {
      index = 0;
    }
    bins[index].count += 1;
  }

  const total = samples.length;
  for (const bin of bins) {
    bin.probability = bin.count / total;
  }

  return bins;
}

export function computeTargetProbabilities(
  sortedSamples: readonly number[],
  targets?: number[],
): TargetProbability[] {
  if (!targets || targets.length === 0 || sortedSamples.length === 0) {
    return [];
  }

  const uniqueTargets = Array.from(
    new Set(targets.filter((target) => Number.isFinite(target)).map((target) => Number(target))),
  ).sort((a, b) => a - b);

  const total = sortedSamples.length;
  return uniqueTargets.map((target) => {
    const index = lowerBound(sortedSamples, target);
    return {
      target,
      probability: (total - index) / total,
    };
  });
}

export function sortNumbers(values: readonly number[]): number[] {
  return [...values].sort((a, b) => a - b);
}

export function clampProbability(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  if (value < 0) {
    return 0;
  }
  if (value > 1) {
    return 1;
  }
  return value;
}

export function clampInteger(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) {
    return min;
  }
  return Math.floor(Math.min(Math.max(value, min), max));
}

export function normalizeSeed(seed?: number): number {
  if (typeof seed === 'number' && Number.isFinite(seed) && seed >= 0) {
    return Math.floor(seed) >>> 0;
  }
  return Math.floor(Date.now() % UINT32_MAX);
}

export function createSimulationMetadata(
  config: SimulationConfig | undefined,
  overrides: Partial<SimulationMetadata> = {},
): SimulationMetadata {
  return {
    iterations: overrides.iterations ?? normalizeIterations(config),
    seed: overrides.seed ?? normalizeSeed(config?.seed),
    generatedAt: overrides.generatedAt ?? new Date().toISOString(),
    version: overrides.version ?? SIMULATION_VERSION,
    runId: overrides.runId,
  };
}

export function generateRunId(prefix = 'simulation'): string {
  const cryptoRef = globalThis.crypto;
  if (cryptoRef && typeof cryptoRef.randomUUID === 'function') {
    return `${prefix}-${cryptoRef.randomUUID()}`;
  }

  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function lowerBound(array: readonly number[], target: number): number {
  let low = 0;
  let high = array.length;

  while (low < high) {
    const mid = (low + high) >>> 1;
    if (array[mid] >= target) {
      high = mid;
    } else {
      low = mid + 1;
    }
  }

  return low;
}
