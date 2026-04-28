import type {
  LearningDecisionResponse,
  MemoryResponse,
} from "@/lib/predictions/types";

export async function getMemorySnapshot(): Promise<MemoryResponse> {
  const response = await fetch("/api/predictions/memory");

  if (!response.ok) {
    throw new Error(`Failed to fetch memory snapshot: ${response.status}`);
  }

  return response.json() as Promise<MemoryResponse>;
}

export async function getLearningDecisions(): Promise<LearningDecisionResponse> {
  const response = await fetch("/api/predictions/learning-decisions");

  if (!response.ok) {
    throw new Error(`Failed to fetch learning decisions: ${response.status}`);
  }

  return response.json() as Promise<LearningDecisionResponse>;
}
