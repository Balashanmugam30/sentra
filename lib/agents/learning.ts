import type {
  LearningHistoryResponse,
  LearningLiveResponse,
  LearningResetResponse,
  LearningRunRequest,
  LearningRunResponse,
} from "@/lib/agents/types";

async function parseResponse<T>(response: Response, fallback: string): Promise<T> {
  if (!response.ok) {
    throw new Error(`${fallback}: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function getAgentsLearningLive(): Promise<LearningLiveResponse> {
  const response = await fetch("/api/agents/learning/live");
  return parseResponse<LearningLiveResponse>(response, "Failed to fetch learning state");
}

export async function getAgentsLearningHistory(): Promise<LearningHistoryResponse> {
  const response = await fetch("/api/agents/learning/history");
  return parseResponse<LearningHistoryResponse>(response, "Failed to fetch learning history");
}

export async function runAgentsLearningCycle(
  payload: LearningRunRequest,
): Promise<LearningRunResponse> {
  const response = await fetch("/api/agents/learning/run-cycle", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return parseResponse<LearningRunResponse>(response, "Failed to run learning cycle");
}

export async function resetAgentsLearning(): Promise<LearningResetResponse> {
  const response = await fetch("/api/agents/learning/reset", {
    method: "POST",
  });
  return parseResponse<LearningResetResponse>(response, "Failed to reset learning memory");
}
