import { apiClient } from "@/lib/core/api-client";
import type { DataHubEnvelope, DataHubGraph, DataHubPipelines, DataHubSummary } from "@/lib/data/types";

export function getDataHubSummary() {
  return apiClient.requestData<DataHubEnvelope<DataHubSummary>>("/data/summary", {
    priority: "high",
    cacheTtlMs: 12_000,
  });
}

export function getDataHubPipelines() {
  return apiClient.requestData<DataHubEnvelope<DataHubPipelines>>("/data/pipelines", {
    priority: "normal",
    cacheTtlMs: 12_000,
  });
}

export function getDataHubGraph() {
  return apiClient.requestData<DataHubEnvelope<DataHubGraph>>("/data/graph", {
    priority: "normal",
    cacheTtlMs: 12_000,
  });
}

export function runDataPipeline(pipelineId = "PIPE-INCIDENTS") {
  return apiClient.requestData<{ ok: boolean; message: string; data: Record<string, unknown> }>("/data/run", {
    method: "POST",
    priority: "high",
    body: { pipeline_id: pipelineId, reason: "Phase 22.X replay-safe data pipeline run" },
  });
}
