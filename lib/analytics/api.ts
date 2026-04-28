import type {
  AnalyticsHubEnvelope,
  AnalyticsHubSummary,
  AnalyticsKpiCardsResponse,
  AnalyticsLiveResponse,
} from "@/lib/analytics/types";
import { apiClient } from "@/lib/core/api-client";

export async function getLiveAnalytics(): Promise<AnalyticsLiveResponse> {
  return apiClient.requestData<AnalyticsLiveResponse>("/analytics/live");
}

export async function getAnalyticsKpis(): Promise<AnalyticsKpiCardsResponse> {
  return apiClient.requestData<AnalyticsKpiCardsResponse>("/analytics/kpis");
}

export function getAnalyticsHubSummary() {
  return apiClient.requestData<AnalyticsHubEnvelope<AnalyticsHubSummary>>("/analytics/summary", {
    priority: "normal",
    cacheTtlMs: 20_000,
  });
}
