import type { FireSpreadResponse } from "@/lib/predictions/types";

export async function getFireSpreadForecast(): Promise<FireSpreadResponse> {
  const response = await fetch("/api/predictions/fire-spread");

  if (!response.ok) {
    throw new Error(`Failed to fetch fire spread forecast: ${response.status}`);
  }

  return response.json() as Promise<FireSpreadResponse>;
}
