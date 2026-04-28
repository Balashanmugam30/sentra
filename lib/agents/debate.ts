import type {
  DebateHistoryResponse,
  DebateLiveResponse,
  DebateResetResponse,
  DebateRunRequest,
} from "@/lib/agents/types";

async function parseResponse<T>(response: Response, fallback: string): Promise<T> {
  if (!response.ok) {
    throw new Error(`${fallback}: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function getAgentsDebateLive(): Promise<DebateLiveResponse> {
  const response = await fetch("/api/agents/debate/live");
  return parseResponse<DebateLiveResponse>(response, "Failed to fetch live debate state");
}

export async function getAgentsDebateHistory(): Promise<DebateHistoryResponse> {
  const response = await fetch("/api/agents/debate/history");
  return parseResponse<DebateHistoryResponse>(response, "Failed to fetch debate history");
}

export async function runAgentsDebate(
  payload: DebateRunRequest,
): Promise<DebateLiveResponse> {
  const response = await fetch("/api/agents/debate/run", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return parseResponse<DebateLiveResponse>(response, "Failed to run debate scenario");
}

export async function resetAgentsDebate(): Promise<DebateResetResponse> {
  const response = await fetch("/api/agents/debate/reset", {
    method: "POST",
  });
  return parseResponse<DebateResetResponse>(response, "Failed to reset debate state");
}
