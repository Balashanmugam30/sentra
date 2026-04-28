import { apiClient } from "@/lib/core/api-client";
import type {
  EnvironmentAlertsResponse,
  EnvironmentForecastResponse,
  EnvironmentLiveResponse,
  EnvironmentTestScenario,
  EnvironmentTestScenarioResponse,
} from "@/lib/environment/types";

export async function getEnvironmentLive(): Promise<EnvironmentLiveResponse> {
  return apiClient.requestData<EnvironmentLiveResponse>("/environment/live", {
    cacheTtlMs: 5_000,
    priority: "normal",
    timeoutMs: 6_000,
  });
}

export async function getEnvironmentForecast(
  options: { background?: boolean } = {},
): Promise<EnvironmentForecastResponse> {
  return apiClient.requestData<EnvironmentForecastResponse>("/environment/forecast", {
    background: options.background,
    cacheTtlMs: 30_000,
    priority: options.background ? "background" : "low",
    timeoutMs: options.background ? 14_000 : 10_000,
  });
}

export async function getEnvironmentAlerts(
  options: { background?: boolean } = {},
): Promise<EnvironmentAlertsResponse> {
  return apiClient.requestData<EnvironmentAlertsResponse>("/environment/alerts", {
    background: options.background,
    cacheTtlMs: 20_000,
    priority: options.background ? "background" : "normal",
    timeoutMs: options.background ? 14_000 : 8_000,
  });
}

export async function postEnvironmentScenario(
  scenario: EnvironmentTestScenario,
): Promise<EnvironmentTestScenarioResponse> {
  return apiClient.requestData<EnvironmentTestScenarioResponse>("/environment/test-scenario", {
    method: "POST",
    body: { scenario },
  });
}

export async function postEnvironmentFocus(
  lat: number,
  lng: number,
): Promise<EnvironmentLiveResponse> {
  return apiClient.requestData<EnvironmentLiveResponse>("/environment/focus", {
    method: "POST",
    body: { lat, lng },
  });
}
