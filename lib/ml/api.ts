import { apiClient } from "@/lib/core/api-client";
import type { MLDataset, MLExperiment, MLFeature, MLJob, MLModel, MLMutationResponse, MLSummary } from "@/lib/ml/types";

export function getMLSummary() {
  return apiClient.requestData<{ data: MLSummary }>("/ml/summary", { priority: "high", cacheTtlMs: 12_000 });
}

export function getMLDatasets() {
  return apiClient.requestData<{ items: MLDataset[] }>("/ml/datasets", { priority: "normal", cacheTtlMs: 12_000 });
}

export function getMLFeatures() {
  return apiClient.requestData<{ items: MLFeature[] }>("/ml/features", { priority: "normal", cacheTtlMs: 12_000 });
}

export function getMLJobs() {
  return apiClient.requestData<{ items: MLJob[] }>("/ml/jobs", { priority: "normal", cacheTtlMs: 8_000 });
}

export function getMLExperiments() {
  return apiClient.requestData<{ items: MLExperiment[] }>("/ml/experiments", { priority: "normal", cacheTtlMs: 12_000 });
}

export function getMLModels() {
  return apiClient.requestData<{ items: MLModel[] }>("/ml/models", { priority: "normal", cacheTtlMs: 12_000 });
}

export function runMLTraining(model_domain = "Panic Probability", algorithm = "LightGBM", dataset = "mall_crowd_behavior_q1") {
  return apiClient.requestData<MLMutationResponse>("/ml/train", {
    method: "POST",
    body: { model_domain, algorithm, dataset },
    priority: "high",
  });
}

export function uploadMLDataset(name = "uploaded_incident_batch") {
  return apiClient.requestData<MLMutationResponse>("/ml/dataset/upload", {
    method: "POST",
    body: { name, domain: "incidents", rows: 24000, columns: 32, label_coverage: 78, quality_score: 89 },
    priority: "high",
  });
}

export function promoteMLModel(model_id = "MODEL-PANIC-V2") {
  return apiClient.requestData<MLMutationResponse>("/ml/promote", {
    method: "POST",
    body: { model_id },
    priority: "high",
  });
}

export function archiveMLModel(model_id = "MODEL-SEV-V2") {
  return apiClient.requestData<MLMutationResponse>("/ml/archive", {
    method: "POST",
    body: { model_id },
    priority: "high",
  });
}
