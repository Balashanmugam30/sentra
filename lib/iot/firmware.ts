import { apiClient } from "@/lib/core/api-client";
import type { IotDataResponse, IotFirmwareData } from "@/lib/iot/types";

export function getIotFirmware() {
  return apiClient.requestData<IotDataResponse<IotFirmwareData>>("/iot/firmware", {
    priority: "normal",
    cacheTtlMs: 10_000,
  });
}

export function releaseIotFirmware(version: string, rolloutPercentage: number, target: string) {
  return apiClient.requestData<IotDataResponse<IotFirmwareData>>("/iot/firmware/release", {
    method: "POST",
    body: { version, rollout_percentage: rolloutPercentage, target },
    priority: "high",
  });
}

export function rollbackIotFirmware() {
  return apiClient.requestData<IotDataResponse<IotFirmwareData>>("/iot/firmware/rollback", {
    method: "POST",
    priority: "high",
  });
}
