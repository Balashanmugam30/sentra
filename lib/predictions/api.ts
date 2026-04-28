import type { PredictionResponse } from "@/lib/predictions/types";

export async function getLivePredictions(): Promise<PredictionResponse> {
  const response = await fetch("/api/predictions/live");

  if (!response.ok) {
    throw new Error(`Failed to fetch predictions: ${response.status}`);
  }

  return response.json() as Promise<PredictionResponse>;
}
