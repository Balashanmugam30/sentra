import type { ResourceDeploymentResponse } from "@/lib/predictions/types";

export async function getResourceDeployments(): Promise<ResourceDeploymentResponse> {
  const response = await fetch("/api/predictions/resources");

  if (!response.ok) {
    throw new Error(`Failed to fetch resource deployments: ${response.status}`);
  }

  return response.json() as Promise<ResourceDeploymentResponse>;
}
