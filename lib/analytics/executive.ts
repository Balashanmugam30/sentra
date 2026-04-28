import type {
  AnalyticsReadinessResponse,
  ExecutiveAnalyticsResponse,
} from "@/lib/analytics/types";
import { apiClient } from "@/lib/core/api-client";

export async function getExecutiveAnalytics(): Promise<ExecutiveAnalyticsResponse> {
  return apiClient.requestData<ExecutiveAnalyticsResponse>("/analytics/executive");
}

export async function getReadinessAnalytics(): Promise<AnalyticsReadinessResponse> {
  return apiClient.requestData<AnalyticsReadinessResponse>("/analytics/readiness");
}
