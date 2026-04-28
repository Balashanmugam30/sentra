import { apiClient } from "@/lib/core/api-client";
import type {
  IotDataResponse,
  IotDemoData,
  IotDemoRunData,
  IotLaunchData,
  IotNetworkData,
  IotVisionData,
} from "@/lib/iot/types";

export function getIotNetwork() {
  return apiClient.requestData<IotDataResponse<IotNetworkData>>("/iot/network", {
    priority: "normal",
    cacheTtlMs: 10_000,
  });
}

export function getIotVision() {
  return apiClient.requestData<IotDataResponse<IotVisionData>>("/iot/vision", {
    priority: "normal",
    cacheTtlMs: 10_000,
  });
}

export function getIotDemoScenarios() {
  return apiClient.requestData<IotDataResponse<IotDemoData>>("/iot/demo/scenarios", {
    priority: "normal",
    cacheTtlMs: 10_000,
  });
}

export function runIotDemoScenario(scenarioId: string) {
  return apiClient.requestData<IotDataResponse<IotDemoRunData>>("/iot/demo/run", {
    method: "POST",
    body: { scenario_id: scenarioId },
    priority: "high",
  });
}

export function getIotLaunch() {
  return apiClient.requestData<IotDataResponse<IotLaunchData>>("/iot/launch", {
    priority: "normal",
    cacheTtlMs: 15_000,
  });
}
