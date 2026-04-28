import type {
  AgentScenarioRequest,
  AgentScenarioResponse,
  AgentsLiveResponse,
  AgentsMemoryResponse,
  AgentsResetResponse,
} from "@/lib/agents/types";

async function parseResponse<T>(response: Response, fallback: string): Promise<T> {
  if (!response.ok) {
    throw new Error(`${fallback}: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function getAgentsLive(): Promise<AgentsLiveResponse> {
  const response = await fetch("/api/agents/live");
  return parseResponse<AgentsLiveResponse>(response, "Failed to fetch agents live state");
}

export async function getAgentsMemory(): Promise<AgentsMemoryResponse> {
  const response = await fetch("/api/agents/memory");
  return parseResponse<AgentsMemoryResponse>(response, "Failed to fetch agent memory");
}

export async function resetAgents(): Promise<AgentsResetResponse> {
  const response = await fetch("/api/agents/reset", {
    method: "POST",
  });
  return parseResponse<AgentsResetResponse>(response, "Failed to reset agent council");
}

export async function testAgentScenario(
  payload: AgentScenarioRequest,
): Promise<AgentScenarioResponse> {
  const response = await fetch("/api/agents/test-scenario", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return parseResponse<AgentScenarioResponse>(response, "Failed to apply agent scenario");
}
