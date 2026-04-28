import type {
  AnalyticsHotspotsResponse,
  AnalyticsTrendsResponse,
} from "@/lib/analytics/types";
import { apiClient } from "@/lib/core/api-client";

export async function getAnalyticsTrends(): Promise<AnalyticsTrendsResponse> {
  return apiClient.requestData<AnalyticsTrendsResponse>("/analytics/trends");
}

export async function getAnalyticsHotspots(): Promise<AnalyticsHotspotsResponse> {
  return apiClient.requestData<AnalyticsHotspotsResponse>("/analytics/hotspots");
}
