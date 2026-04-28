import { apiClient } from "@/lib/core/api-client";
import type { IotDataResponse, IotRoiData, IotRoiInputs } from "@/lib/iot/types";

export function getIotRoiDefaults() {
  return apiClient.requestData<IotDataResponse<IotRoiData>>("/iot/roi", {
    priority: "normal",
    cacheTtlMs: 12_000,
  });
}

export function calculateIotRoi(inputs: IotRoiInputs) {
  return apiClient.requestData<IotDataResponse<IotRoiData>>("/iot/roi/calculate", {
    method: "POST",
    body: inputs,
    priority: "high",
  });
}
