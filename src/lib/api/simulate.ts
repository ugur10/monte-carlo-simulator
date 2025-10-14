import type {
  SimulationRequestPayload,
  SimulationResponsePayload,
  SimulationResult,
} from '$lib/types';

export interface SimulationApiSuccess {
  result: SimulationResult;
  durationMs?: number;
}

export interface SimulationApiError {
  status: number;
  message: string;
  issues?: Array<{ path: string; code: string; message: string }>;
}

export type SimulationApiResponse = SimulationApiSuccess | SimulationApiError;

/**
 * Calls the `/api/simulate` endpoint using the provided `fetch` implementation.
 * Returns the parsed result or a structured error object that can be surfaced to the UI.
 */
export async function postSimulation(
  payload: SimulationRequestPayload,
  fetchImpl: typeof fetch,
): Promise<SimulationApiResponse> {
  try {
    const response = await fetchImpl('/api/simulate', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const durationHeader = response.headers.get('x-simulation-duration-ms');

    const data = await safeParseJson(response);

    if (!response.ok) {
      return {
        status: response.status,
        message: isSimulationApiError(data) ? data.message : response.statusText,
        issues: isSimulationApiError(data) ? data.issues : undefined,
      };
    }

    if (isSimulationResponsePayload(data)) {
      return {
        result: data.result,
        durationMs: durationHeader ? Number.parseFloat(durationHeader) : undefined,
      };
    }

    return {
      status: 0,
      message: 'Unexpected response format from simulation API',
    };
  } catch (error) {
    return {
      status: 0,
      message: error instanceof Error ? error.message : 'Unknown simulation error',
    };
  }
}

async function safeParseJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function isSimulationResponsePayload(value: unknown): value is SimulationResponsePayload {
  if (!value || typeof value !== 'object') return false;
  return 'result' in value && typeof (value as { result: unknown }).result === 'object';
}

function isSimulationApiError(value: unknown): value is SimulationApiError {
  return (
    !!value &&
    typeof value === 'object' &&
    'message' in value &&
    typeof (value as { message: unknown }).message === 'string'
  );
}
