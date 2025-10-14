import { describe, expect, it } from 'vitest';

import { POST } from './+server';

type PostArgs = Parameters<typeof POST>[0];

const invokePost = (request: Request) => POST({ request } as PostArgs);

interface ApiSuccessBody {
  result: {
    metadata: {
      iterations: number;
      durationMs?: number;
    };
    dealImpacts: Array<{ dealId: string }>;
  };
}

const API_URL = 'http://localhost/api/simulate';

describe('POST /api/simulate', () => {
  const basePayload = {
    deals: [
      {
        id: 'pipeline-1',
        name: 'Enterprise Expansion',
        amount: 120_000,
        winProbability: 0.55,
        expectedCloseDate: '2025-12-15',
        stage: 'Negotiation',
      },
      {
        name: 'New Logo - Rising Star',
        amount: 60_000,
        winProbability: 0.35,
        expectedCloseDate: '2026-01-05',
        owner: 'Ayla',
      },
    ],
    config: {
      iterations: 3_000,
      seed: 1_234,
      histogramBinCount: 30,
      revenueTargets: [100_000, 160_000],
      includeDealImpacts: true,
    },
  };

  it('returns a simulation result for a valid payload', async () => {
    const request = new Request(API_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(basePayload),
    });

    const response = await invokePost(request);
    expect(response.status).toBe(200);

    const durationHeader = response.headers.get('x-simulation-duration-ms');
    expect(durationHeader).toBeTruthy();
    const body: ApiSuccessBody = await response.json();

    expect(body.result.metadata.iterations).toBe(basePayload.config?.iterations);
    expect(body.result.metadata.durationMs ?? 0).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(body.result.dealImpacts)).toBe(true);
    expect(body.result.dealImpacts).toHaveLength(basePayload.deals.length);
  });

  it('auto-assigns missing deal identifiers and can disable deal impacts', async () => {
    const payload = {
      ...basePayload,
      deals: basePayload.deals.map(({ id, ...rest }) => rest),
      config: {
        ...basePayload.config,
        includeDealImpacts: false,
      },
    };

    const request = new Request(API_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const response = await invokePost(request);
    expect(response.status).toBe(200);

    const body: ApiSuccessBody = await response.json();

    expect(body.result.dealImpacts).toHaveLength(0);
    expect(body.result.metadata.iterations).toBe(payload.config.iterations);
  });

  it('rejects malformed JSON payloads', async () => {
    const request = new Request(API_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{invalid',
    });

    const response = await invokePost(request);
    expect(response.status).toBe(400);
    const body = (await response.json()) as { message: string };
    expect(body.message.toLowerCase()).toContain('invalid json');
  });

  it('requires at least one deal', async () => {
    const request = new Request(API_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ deals: [] }),
    });

    const response = await invokePost(request);
    expect(response.status).toBe(400);
    const body = (await response.json()) as { message: string; issues?: unknown };
    expect(body.message.toLowerCase()).toContain('invalid');
  });

  it('enforces application/json content-type', async () => {
    const request = new Request(API_URL, {
      method: 'POST',
      headers: { 'content-type': 'text/plain' },
      body: JSON.stringify(basePayload),
    });

    const response = await invokePost(request);
    expect(response.status).toBe(415);
    const body = (await response.json()) as { message: string };
    expect(body.message.toLowerCase()).toContain('content-type');
  });
});
