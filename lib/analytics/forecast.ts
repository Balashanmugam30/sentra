import type {
  AnalyticsBoardroomResponse,
  AnalyticsForecastResponse,
} from "@/lib/analytics/types";
import { apiClient } from "@/lib/core/api-client";

export async function getAnalyticsForecast(): Promise<AnalyticsForecastResponse> {
  return apiClient.requestData<AnalyticsForecastResponse>("/analytics/forecast");
}

export async function getAnalyticsBoardroom(): Promise<AnalyticsBoardroomResponse> {
  return apiClient.requestData<AnalyticsBoardroomResponse>("/analytics/boardroom");
}
