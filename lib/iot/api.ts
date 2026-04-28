import { apiClient } from "@/lib/core/api-client";
import type {
  IotActionResponse,
  IotAnalyticsResponse,
  IotAnalyticsTimeRange,
  IotCalibrationProfile,
  IotCameraLatestResponse,
  IotEventsResponse,
  IotFeedResponse,
  IotFleetResponse,
  IotHealthResponse,
  IotNodeDetailResponse,
  IotNodesResponse,
  IotSettings,
  IotSettingsResponse,
  IotThresholdsResponse,
} from "@/lib/iot/types";

export function getIotNodes() {
  return apiClient.requestData<IotNodesResponse>("/iot/nodes", {
    priority: "normal",
    cacheTtlMs: 4_000,
    staleWhileRevalidateMs: 8_000,
  });
}

export function getIotEvents() {
  return apiClient.requestData<IotEventsResponse>("/iot/events", {
    priority: "normal",
    cacheTtlMs: 4_000,
    staleWhileRevalidateMs: 8_000,
  });
}

export function getIotCameraLatest() {
  return apiClient.requestData<IotCameraLatestResponse>("/iot/camera/latest", {
    priority: "low",
    cacheTtlMs: 8_000,
    staleWhileRevalidateMs: 15_000,
  });
}

export function getIotFleet() {
  return apiClient.requestData<IotFleetResponse>("/iot/fleet", {
    priority: "normal",
    cacheTtlMs: 4_000,
    staleWhileRevalidateMs: 8_000,
  });
}

export function getIotNodeDetail(nodeId: string) {
  return apiClient.requestData<IotNodeDetailResponse>(`/iot/node/${encodeURIComponent(nodeId)}`, {
    priority: "normal",
    cacheTtlMs: 4_000,
  });
}

export function runIotNodeAction(nodeId: string, action: "restart" | "mute" | "snapshot" | "ping" | "disable") {
  return apiClient.requestData<IotActionResponse>(`/iot/node/${encodeURIComponent(nodeId)}/${action}`, {
    method: "POST",
    priority: "high",
  });
}

export function renameIotNode(nodeId: string, label: string) {
  return apiClient.requestData<IotActionResponse>(`/iot/node/${encodeURIComponent(nodeId)}/rename`, {
    method: "POST",
    body: { label },
    priority: "high",
  });
}

export function calibrateIotNode(nodeId: string, calibration: IotCalibrationProfile) {
  return apiClient.requestData<IotActionResponse>(`/iot/node/${encodeURIComponent(nodeId)}/calibrate`, {
    method: "POST",
    body: calibration,
    priority: "high",
  });
}

export function getIotAnalytics(timeRange: IotAnalyticsTimeRange = "24h") {
  return apiClient.requestData<IotAnalyticsResponse>(`/iot/analytics?time_range=${encodeURIComponent(timeRange)}`, {
    priority: "low",
    cacheTtlMs: 10_000,
    staleWhileRevalidateMs: 20_000,
  });
}

export function getIotThresholds() {
  return apiClient.requestData<IotThresholdsResponse>("/iot/thresholds", {
    priority: "normal",
    cacheTtlMs: 10_000,
  });
}

export function updateIotThresholds(thresholds: IotCalibrationProfile) {
  return apiClient.requestData<IotThresholdsResponse>("/iot/thresholds", {
    method: "POST",
    body: thresholds,
    priority: "high",
  });
}

export function getIotHealth() {
  return apiClient.requestData<IotHealthResponse>("/iot/health", {
    priority: "normal",
    cacheTtlMs: 6_000,
  });
}

export function getIotFeed() {
  return apiClient.requestData<IotFeedResponse>("/iot/feed", {
    priority: "normal",
    cacheTtlMs: 4_000,
  });
}

export function getIotSettings() {
  return apiClient.requestData<IotSettingsResponse>("/iot/settings", {
    priority: "normal",
    cacheTtlMs: 12_000,
  });
}

export function updateIotSettings(settings: Partial<IotSettings>) {
  return apiClient.requestData<IotSettingsResponse>("/iot/settings", {
    method: "POST",
    body: settings,
    priority: "high",
  });
}
