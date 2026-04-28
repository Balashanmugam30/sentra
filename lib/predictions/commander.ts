import type { CommanderResponse } from "@/lib/predictions/types";

export async function getCommanderDecisions(): Promise<CommanderResponse> {
  const response = await fetch("/api/predictions/commander");

  if (!response.ok) {
    throw new Error(`Failed to fetch commander decisions: ${response.status}`);
  }

  return response.json() as Promise<CommanderResponse>;
}
