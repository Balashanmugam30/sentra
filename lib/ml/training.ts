import type { MLDataset, MLExperiment, MLFeature, MLJob, MLModel, MLSummary } from "@/lib/ml/types";

export function datasetReadiness(dataset: Pick<MLDataset, "quality_score" | "label_coverage" | "missing_percent">) {
  return Math.max(0, Math.min(100, Math.round(dataset.quality_score * 0.45 + dataset.label_coverage * 0.45 + (100 - dataset.missing_percent) * 0.1)));
}

export function featureHealth(feature: Pick<MLFeature, "importance" | "drift_score">) {
  return Math.max(0, Math.min(100, Math.round(feature.importance * 0.72 + (100 - feature.drift_score) * 0.28)));
}

export function trainingScore(job: Pick<MLJob, "accuracy" | "precision" | "recall" | "f1" | "latency_score">) {
  return Math.round((job.accuracy + job.precision + job.recall + job.f1 + job.latency_score) / 5);
}

export function modelPromotionScore(model: Pick<MLModel, "score" | "latency_ms" | "status">) {
  const latencyBonus = Math.max(0, 100 - model.latency_ms) * 0.12;
  const statusBonus = model.status === "staging" ? 4 : model.status === "production" ? 2 : 0;
  return Math.min(100, Math.round(model.score * 0.88 + latencyBonus + statusBonus));
}

export const fallbackDatasets: MLDataset[] = [
  { dataset_id: "DS-SENSOR-ARCHIVE", name: "sensor_stream_archive", domain: "sensor telemetry", rows: 2480000, columns: 64, missing_percent: 0.9, freshness_minutes: 5, label_coverage: 81, quality_score: 95, source: "IoT telemetry lake", status: "ready" },
  { dataset_id: "DS-MALL-CROWD-Q1", name: "mall_crowd_behavior_q1", domain: "behavior", rows: 382000, columns: 58, missing_percent: 2.6, freshness_minutes: 42, label_coverage: 88, quality_score: 93, source: "crowd dynamics + mobile responses", status: "ready" },
  { dataset_id: "DS-HOTEL-INC-2024", name: "hotel_incidents_2024", domain: "incidents", rows: 148200, columns: 42, missing_percent: 1.8, freshness_minutes: 18, label_coverage: 92, quality_score: 96, source: "incident warehouse", status: "ready" },
  { dataset_id: "DS-EVAC-OUTCOMES", name: "evacuation_outcomes", domain: "outcomes", rows: 117600, columns: 52, missing_percent: 1.4, freshness_minutes: 14, label_coverage: 94, quality_score: 97, source: "human behavior memory graph", status: "ready" },
];

export const fallbackFeatures: MLFeature[] = [
  { feature_id: "FEAT-PANIC-DENSITY", name: "panic_density", domain: "behavior", freshness: "2 min", drift_score: 11, importance: 96, status: "healthy" },
  { feature_id: "FEAT-SMOKE-SLOPE", name: "smoke_trend_slope", domain: "iot", freshness: "real time", drift_score: 6, importance: 93, status: "healthy" },
  { feature_id: "FEAT-RESP-TIME", name: "avg_response_time", domain: "operations", freshness: "5 min", drift_score: 8, importance: 91, status: "healthy" },
  { feature_id: "FEAT-TRUST-DRIFT", name: "trust_drift_rate", domain: "behavior", freshness: "10 min", drift_score: 9, importance: 90, status: "healthy" },
];

export const fallbackJobs: MLJob[] = [
  { job_id: "JOB-RISK-XGB-024", model_domain: "Crisis Risk Prediction", algorithm: "XGBoost", status: "running", dataset: "hotel_incidents_2024", training_time_minutes: 18, accuracy: 94.2, precision: 93.1, recall: 91.8, f1: 92.4, latency_score: 88, gpu_usage: 42, owner: "AI Platform" },
  { job_id: "JOB-PANIC-LGBM-017", model_domain: "Panic Probability", algorithm: "LightGBM", status: "queued", dataset: "mall_crowd_behavior_q1", training_time_minutes: 24, accuracy: 92.8, precision: 91.4, recall: 93.6, f1: 92.5, latency_score: 91, gpu_usage: 0, owner: "Behavior AI" },
  { job_id: "JOB-CROWD-ENS-031", model_domain: "Crowd Congestion", algorithm: "Ensemble", status: "completed", dataset: "evacuation_outcomes", training_time_minutes: 31, accuracy: 95.1, precision: 94.5, recall: 94.2, f1: 94.3, latency_score: 85, gpu_usage: 68, owner: "Crowd Lab" },
];

export const fallbackModels: MLModel[] = [
  { model_id: "MODEL-RISK-V3", name: "Risk Model", version: "v3.2.0", domain: "Crisis Risk Prediction", status: "production", created_date: "2026-04-18", owner: "AI Platform", score: 95.4, production: true, latency_ms: 42, rollback_to: "v3.1.4" },
  { model_id: "MODEL-CROWD-V4", name: "Crowd Flow Model", version: "v4.0.3", domain: "Crowd Congestion", status: "production", created_date: "2026-04-19", owner: "Crowd Lab", score: 95.1, production: true, latency_ms: 51, rollback_to: "v3.9.8" },
  { model_id: "MODEL-PANIC-V2", name: "Panic Model", version: "v2.7.1", domain: "Panic Probability", status: "staging", created_date: "2026-04-22", owner: "Behavior AI", score: 93.2, production: false, latency_ms: 38, rollback_to: "v2.6.9" },
  { model_id: "MODEL-ETA-V5", name: "ETA Model", version: "v5.1.0", domain: "Resource ETA", status: "production", created_date: "2026-04-20", owner: "Ops AI", score: 92.9, production: true, latency_ms: 29, rollback_to: "v5.0.5" },
];

export const fallbackExperiments: MLExperiment[] = [
  { experiment_id: "EXP-RISK-ENSEMBLE", name: "risk_model_ensemble_sweep", model_domain: "Crisis Risk Prediction", runs: 18, winner_run: "RUN-014", best_accuracy: 95.4, feature_count: 32, hyperparameters: { max_depth: 7, eta: 0.06, subsample: 0.82 }, status: "winner" },
  { experiment_id: "EXP-PANIC-MSG", name: "panic_message_weighting", model_domain: "Panic Probability", runs: 12, winner_run: "RUN-009", best_accuracy: 93.2, feature_count: 27, hyperparameters: { leaves: 64, learning_rate: 0.04 }, status: "active" },
];

export const fallbackSummary: MLSummary = {
  generated_at: "2026-04-26T00:00:00.000Z",
  active_datasets: 6,
  ready_datasets: 5,
  total_rows: 3271000,
  avg_quality_score: 94.3,
  avg_label_coverage: 88.5,
  training_jobs: 3,
  running_jobs: 1,
  experiment_runs: 39,
  model_count: 8,
  production_models: 4,
  best_model: fallbackModels[0] as MLModel,
  accuracy_leaderboard: fallbackModels,
  feature_drift_watch: fallbackFeatures.filter((feature) => feature.drift_score >= 12),
  training_queue: fallbackJobs.filter((job) => job.status !== "completed"),
  gpu_usage: { active_percent: 42, queued_percent: 31, cluster: "sentra-demo-gpu-pool" },
  next_recommended_models: [
    { domain: "Panic Probability", algorithm: "LightGBM", why: "High label coverage and behavior outcomes now support a sharper panic classifier." },
    { domain: "Operator Overload Risk", algorithm: "Random Forest", why: "Team load and approval bottleneck features show stable predictive signal." },
  ],
};
