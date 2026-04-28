import { apiClient } from "@/lib/core/api-client";
import type {
  PublicSafetyLiveResponse,
  PublicSafetyRoutePriorityResponse,
  PublicSafetyScenario,
  PublicSafetyTestScenarioResponse,
  PublicSafetyTrafficResponse,
  PublicSafetyTransitResponse,
  PublicSafetyUtilityResponse,
} from "@/lib/public-safety/types";

export async function getPublicSafetyLive(): Promise<PublicSafetyLiveResponse> {
  return apiClient.requestData<PublicSafetyLiveResponse>("/public-safety/live", {
    cacheTtlMs: 5_000,
    priority: "normal",
    timeoutMs: 6_000,
  });
}

export async function getPublicSafetyTraffic(
  options: { background?: boolean } = {},
): Promise<PublicSafetyTrafficResponse> {
  return apiClient.requestData<PublicSafetyTrafficResponse>("/public-safety/traffic", {
    background: options.background,
    cacheTtlMs: 20_000,
    priority: options.background ? "background" : "normal",
    timeoutMs: options.background ? 14_000 : 8_000,
  });
}

export async function getPublicSafetyTransit(
  options: { background?: boolean } = {},
): Promise<PublicSafetyTransitResponse> {
  return apiClient.requestData<PublicSafetyTransitResponse>("/public-safety/transit", {
    background: options.background,
    cacheTtlMs: 30_000,
    priority: options.background ? "background" : "low",
    timeoutMs: options.background ? 14_000 : 10_000,
  });
}

export async function getPublicSafetyUtilities(
  options: { background?: boolean } = {},
): Promise<PublicSafetyUtilityResponse> {
  return apiClient.requestData<PublicSafetyUtilityResponse>("/public-safety/utilities", {
    background: options.background,
    cacheTtlMs: 30_000,
    priority: options.background ? "background" : "low",
    timeoutMs: options.background ? 14_000 : 10_000,
  });
}

export async function postPublicSafetyRoutePriority(
  vehicleType: "ambulance" | "fire" | "police",
  fromZone: string,
  toZone: string,
): Promise<PublicSafetyRoutePriorityResponse> {
  return apiClient.requestData<PublicSafetyRoutePriorityResponse>("/public-safety/route-priority", {
    method: "POST",
    body: {
      vehicle_type: vehicleType,
      from_zone: fromZone,
      to_zone: toZone,
    },
  });
}

export async function postPublicSafetyScenario(
  scenario: PublicSafetyScenario,
): Promise<PublicSafetyTestScenarioResponse> {
  return apiClient.requestData<PublicSafetyTestScenarioResponse>("/public-safety/test-scenario", {
    method: "POST",
    body: { scenario },
  });
}
