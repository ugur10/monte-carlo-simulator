import { describe, expect, it, vi } from 'vitest';
import type { SimulationRequestPayload, SimulationResult } from '$lib/types';
import { postSimulation } from './simulate';

const basePayload: SimulationRequestPayload = {
  deals: [
    {
      name: 'Synthetic Deal',
      amount: 50_000,
      winProbability: 0.4,
      expectedCloseDate: '2026-04-01',
    },
  ],
};

describe('postSimulation', () => {
  const resultStub: SimulationResult = {
    revenueSamples: [0, 100_000],
    histogram: [],
    confidenceIntervals: [],
    targetProbabilities: [],
    dealImpacts: [],
    summary: {
      mean: 50_000,
      median: 50_000,
      standardDeviation: 50_000,
      min: 0,
      max: 100_000,
      percentile10: 0,
      percentile90: 100_000,
    },
    metadata: {
      iterations: 10_000,
      seed: 42,
      generatedAt: new Date().toISOString(),
      version: '0.1.0',
    },
  };

  it('returns parsed result and duration when the request succeeds', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ result: resultStub }), {
        status: 200,
        headers: {
          'content-type': 'application/json',
          'x-simulation-duration-ms': '123.45',
        },
      }),
    );

    const response = await postSimulation(basePayload, fetchMock);

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/simulate',
      expect.objectContaining({ method: 'POST' }),
    );
    expect('result' in response).toBe(true);
    if ('result' in response) {
      expect(response.result.metadata.iterations).toBe(10_000);
      expect(response.durationMs).toBeCloseTo(123.45);
    }
  });

  it('propagates validation errors with issue details', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          message: 'Invalid simulation payload',
          issues: [{ path: 'deals.0.name', code: 'too_small', message: 'Name is required' }],
        }),
        {
          status: 400,
          headers: {
            'content-type': 'application/json',
          },
        },
      ),
    );

    const response = await postSimulation(basePayload, fetchMock);

    expect('status' in response).toBe(true);
    if ('status' in response) {
      expect(response.status).toBe(400);
      expect(response.issues?.[0]?.path).toBe('deals.0.name');
    }
  });

  it('handles non-json error responses gracefully', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response('Service unavailable', { status: 503, statusText: 'Service Unavailable' }),
      );

    const response = await postSimulation(basePayload, fetchMock);

    expect('status' in response).toBe(true);
    if ('status' in response) {
      expect(response.status).toBe(503);
      expect(response.message).toBe('Service Unavailable');
    }
  });

  it('handles network failures with a synthetic error response', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('Network down'));

    const response = await postSimulation(basePayload, fetchMock);

    expect('status' in response).toBe(true);
    if ('status' in response) {
      expect(response.status).toBe(0);
      expect(response.message).toContain('Network down');
    }
  });
});
