import type { OverrideResponse } from "@/lib/perception/types";

export async function getPerceptionOverrides(): Promise<OverrideResponse> {
  const response = await fetch("/api/perception/overrides");

  if (!response.ok) {
    throw new Error(`Failed to fetch adaptive overrides: ${response.status}`);
  }

  return response.json() as Promise<OverrideResponse>;
}

