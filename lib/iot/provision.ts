import { apiClient } from "@/lib/core/api-client";
import type { IotDataResponse, IotProvisionDevice, IotProvisioningData, IotProvisionResponse } from "@/lib/iot/types";

export function getIotProvisioning() {
  return apiClient.requestData<IotDataResponse<IotProvisioningData>>("/iot/provisioning", {
    priority: "normal",
    cacheTtlMs: 8_000,
  });
}

export function provisionIotDevice(device: IotProvisionDevice) {
  return apiClient.requestData<IotProvisionResponse>("/iot/provision", {
    method: "POST",
    body: device,
    priority: "high",
  });
}
