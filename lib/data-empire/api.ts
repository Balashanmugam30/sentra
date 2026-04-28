import { apiClient } from "@/lib/core/api-client";
import type {
  Anomaly,
  DataEmpireLive,
  DataEmpireMutationResponse,
  DataProduct,
  DataSource,
  DataValue,
  EntityGraph,
  ForecastPoint,
  KnowledgeCompounding,
  Moat,
  PipelineHealth,
  PredictiveDataset,
  PrivacyPosture,
  ProprietaryInsight,
  SignalScore,
  SignalSummary,
} from "@/lib/data-empire/types";

export function getDataEmpireLive() {
  return apiClient.requestData<DataEmpireLive>("/data-empire/live", {
    cacheTtlMs: 10_000,
    priority: "normal",
  });
}

export function getDataEmpireSignals() {
  return apiClient.requestData<{
    sources: DataSource[];
    pipelines: PipelineHealth[];
    signals: SignalScore[];
    summary: SignalSummary;
  }>("/data-empire/signals", {
    cacheTtlMs: 12_000,
    priority: "normal",
  });
}

export function getDataEmpireGraph() {
  return apiClient.requestData<EntityGraph>("/data-empire/graph", {
    cacheTtlMs: 18_000,
    priority: "low",
  });
}

export function getDataEmpireInsights() {
  return apiClient.requestData<{ insights: ProprietaryInsight[] }>("/data-empire/insights", {
    cacheTtlMs: 12_000,
    priority: "normal",
  });
}

export function getDataEmpireForecast() {
  return apiClient.requestData<{ forecasts: ForecastPoint[] }>("/data-empire/forecast", {
    cacheTtlMs: 15_000,
    priority: "normal",
  });
}

export function getDataEmpireValue() {
  return apiClient.requestData<{
    anomalies: Anomaly[];
    products: DataProduct[];
    datasets: PredictiveDataset[];
    value: DataValue;
    knowledge: KnowledgeCompounding;
  }>("/data-empire/value", {
    cacheTtlMs: 18_000,
    priority: "low",
  });
}

export function getDataEmpireMoat() {
  return apiClient.requestData<{ moat: Moat }>("/data-empire/moat", {
    cacheTtlMs: 15_000,
    priority: "normal",
  });
}

export function getDataEmpirePrivacy() {
  return apiClient.requestData<{ privacy: PrivacyPosture }>("/data-empire/privacy", {
    cacheTtlMs: 20_000,
    priority: "low",
  });
}

export function runDataEmpireIngestion() {
  return apiClient.requestData<DataEmpireMutationResponse>("/data-empire/run-ingestion", {
    body: { scope: "all_sources" },
    method: "POST",
    priority: "high",
  });
}

export function runDataEmpireLearning() {
  return apiClient.requestData<DataEmpireMutationResponse>("/data-empire/run-learning", {
    body: { mode: "incremental" },
    method: "POST",
    priority: "high",
  });
}

export function runDataEmpireForecast() {
  return apiClient.requestData<DataEmpireMutationResponse>("/data-empire/run-forecast", {
    body: { horizons: ["1h", "24h", "7d", "30d", "90d", "1y", "5y"] },
    method: "POST",
    priority: "high",
  });
}

export function launchDataEmpireProduct(productId = "risk-signals-api") {
  return apiClient.requestData<DataEmpireMutationResponse>("/data-empire/launch-data-product", {
    body: { product_id: productId },
    method: "POST",
    priority: "high",
  });
}

export function runDataEmpireAnomalyScan() {
  return apiClient.requestData<DataEmpireMutationResponse>("/data-empire/run-anomaly-scan", {
    body: { mode: "privacy_safe" },
    method: "POST",
    priority: "high",
  });
}
