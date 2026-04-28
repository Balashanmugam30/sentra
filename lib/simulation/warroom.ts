import type { WarRoomResponse } from "@/lib/simulation/types";

export async function getWarRoomState(): Promise<WarRoomResponse> {
  const response = await fetch("/api/simulation/warroom");

  if (!response.ok) {
    throw new Error(`Failed to fetch AI war room state: ${response.status}`);
  }

  return response.json() as Promise<WarRoomResponse>;
}
