import { apiClient } from "@/lib/core/api-client";
import type {
  GeoFocusResponse,
  GeoLayersResponse,
  GeoLiveResponse,
  GeoRouteResponse,
  GeoTestScenario,
  GeoTestScenarioResponse,
} from "@/lib/geospatial/types";

export async function getGeoLive(): Promise<GeoLiveResponse> {
  return apiClient.requestData<GeoLiveResponse>("/geo/live", {
    cacheTtlMs: 3_000,
    priority: "high",
    timeoutMs: 6_000,
  });
}

export async function getGeoLayers(options: { background?: boolean } = {}): Promise<GeoLayersResponse> {
  return apiClient.requestData<GeoLayersResponse>("/geo/layers", {
    background: options.background,
    cacheTtlMs: 30_000,
    priority: options.background ? "background" : "normal",
    timeoutMs: options.background ? 14_000 : 8_000,
  });
}

export async function postGeoRoute(fromZone: string, toZone: string, mode: string): Promise<GeoRouteResponse> {
  return apiClient.requestData<GeoRouteResponse>("/geo/route", {
    method: "POST",
    body: { from_zone: fromZone, to_zone: toZone, mode },
  });
}

export async function postGeoFocus(zone: string): Promise<GeoFocusResponse> {
  return apiClient.requestData<GeoFocusResponse>("/geo/focus", {
    method: "POST",
    body: { zone },
  });
}

export async function postGeoTestScenario(scenario: GeoTestScenario): Promise<GeoTestScenarioResponse> {
  return apiClient.requestData<GeoTestScenarioResponse>("/geo/test-scenario", {
    method: "POST",
    body: { scenario },
  });
}
