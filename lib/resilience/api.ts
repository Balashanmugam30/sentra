import type {
  RecoverWorkflowRequest,
  RecoverWorkflowResponse,
  ResetCircuitRequest,
  ResetCircuitResponse,
  ResilienceHistoryResponse,
  ResilienceLiveResponse,
  ResilienceRunTestRequest,
  ResilienceRunTestResponse,
} from "@/lib/resilience/types";

async function parseResponse<T>(response: Response, fallback: string): Promise<T> {
  if (!response.ok) {
    throw new Error(`${fallback}: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function getResilienceLive(): Promise<ResilienceLiveResponse> {
  const response = await fetch("/api/resilience/live");
  return parseResponse<ResilienceLiveResponse>(response, "Failed to fetch resilience live state");
}

export async function getResilienceHistory(): Promise<ResilienceHistoryResponse> {
  const response = await fetch("/api/resilience/history");
  return parseResponse<ResilienceHistoryResponse>(response, "Failed to fetch resilience history");
}

export async function runResilienceTest(
  payload: ResilienceRunTestRequest,
): Promise<ResilienceRunTestResponse> {
  const response = await fetch("/api/resilience/run-test", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return parseResponse<ResilienceRunTestResponse>(response, "Failed to run resilience test");
}

export async function resetResilienceCircuit(
  payload: ResetCircuitRequest,
): Promise<ResetCircuitResponse> {
  const response = await fetch("/api/resilience/reset-circuit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return parseResponse<ResetCircuitResponse>(response, "Failed to reset resilience circuit");
}

export async function recoverResilienceWorkflow(
  payload: RecoverWorkflowRequest,
): Promise<RecoverWorkflowResponse> {
  const response = await fetch("/api/resilience/recover-workflow", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return parseResponse<RecoverWorkflowResponse>(response, "Failed to recover workflow");
}
