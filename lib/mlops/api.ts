import { apiClient } from "@/lib/core/api-client";
import type { DriftSignal, LiveModel, MLOpsMonitoring, MLOpsMutationResponse, MLOpsSummary, ModelDeployment } from "@/lib/mlops/types";

export function getMLOpsSummary() {
  return apiClient.requestData<{ data: MLOpsSummary }>("/mlops/summary", { priority: "high", cacheTtlMs: 8_000 });
}

export function getLiveMLOpsModels() {
  return apiClient.requestData<{ items: LiveModel[] }>("/mlops/models/live", { priority: "normal", cacheTtlMs: 8_000 });
}

export function runMLOpsPrediction(scenario = "hotel_fire_floor3") {
  return apiClient.requestData<MLOpsMutationResponse>("/mlops/predict", {
    method: "POST",
    body: { scenario },
    priority: "critical",
  });
}

export function getMLOpsDeployments() {
  return apiClient.requestData<{ items: ModelDeployment[] }>("/mlops/deployments", { priority: "normal", cacheTtlMs: 8_000 });
}

export function promoteMLOpsModel(model_id = "MLOPS-SEVERITY-V2") {
  return apiClient.requestData<MLOpsMutationResponse>("/mlops/promote", {
    method: "POST",
    body: { model_id },
    priority: "high",
  });
}

export function setMLOpsCanary(model_id = "MLOPS-PANIC-V2", canary_percent = 25) {
  return apiClient.requestData<MLOpsMutationResponse>("/mlops/canary", {
    method: "POST",
    body: { model_id, canary_percent },
    priority: "high",
  });
}

export function rollbackMLOpsModel(model_id = "MLOPS-PANIC-V2") {
  return apiClient.requestData<MLOpsMutationResponse>("/mlops/rollback", {
    method: "POST",
    body: { model_id },
    priority: "high",
  });
}

export function getMLOpsDrift() {
  return apiClient.requestData<{ items: DriftSignal[] }>("/mlops/drift", { priority: "normal", cacheTtlMs: 8_000 });
}

export function getMLOpsMonitoring() {
  return apiClient.requestData<{ data: MLOpsMonitoring }>("/mlops/monitoring", { priority: "high", cacheTtlMs: 8_000 });
}

export function triggerMLOpsRetrain(domain = "Panic Probability Engine", reason = "high drift and confidence decay") {
  return apiClient.requestData<MLOpsMutationResponse>("/mlops/retrain", {
    method: "POST",
    body: { domain, reason },
    priority: "high",
  });
}

