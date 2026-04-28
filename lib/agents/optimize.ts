import type {
  OptimizationHistoryResponse,
  OptimizationPlanResponse,
  OptimizationResetResponse,
  OptimizationRunRequest,
} from "@/lib/agents/types";

async function parseResponse<T>(response: Response, fallback: string): Promise<T> {
  if (!response.ok) {
    throw new Error(`${fallback}: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function getAgentsOptimizeLive(): Promise<OptimizationPlanResponse> {
  const response = await fetch("/api/agents/optimize/live");
  return parseResponse<OptimizationPlanResponse>(response, "Failed to fetch optimization plan");
}

export async function getAgentsOptimizeHistory(): Promise<OptimizationHistoryResponse> {
  const response = await fetch("/api/agents/optimize/history");
  return parseResponse<OptimizationHistoryResponse>(response, "Failed to fetch optimization history");
}

export async function runAgentsOptimization(
  payload: OptimizationRunRequest,
): Promise<OptimizationPlanResponse> {
  const response = await fetch("/api/agents/optimize/run", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return parseResponse<OptimizationPlanResponse>(response, "Failed to run optimization scenario");
}

export async function resetAgentsOptimization(): Promise<OptimizationResetResponse> {
  const response = await fetch("/api/agents/optimize/reset", {
    method: "POST",
  });
  return parseResponse<OptimizationResetResponse>(response, "Failed to reset optimization plans");
}
