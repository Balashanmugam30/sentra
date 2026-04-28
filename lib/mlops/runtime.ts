import type { DriftSignal, ExplainLog, LiveModel, MLOpsMonitoring, MLOpsPrediction, MLOpsScenario, MLOpsSummary, ModelDeployment } from "@/lib/mlops/types";

export function inferRuntimeScore(input: Pick<MLOpsScenario, "occupancy" | "smoke" | "motion" | "incident_history" | "operator_load">) {
  return Math.min(99, Math.max(12, Math.round(input.smoke * 0.34 + Math.min(input.occupancy / 22, 45) + input.motion * 0.18 + input.incident_history * 1.4 + input.operator_load * 0.16)));
}

export function driftTone(level: string) {
  if (level === "high") {
    return "border-red-300/30 bg-red-500/10 text-red-100";
  }
  if (level === "medium") {
    return "border-amber-300/30 bg-amber-500/10 text-amber-100";
  }
  return "border-emerald-300/30 bg-emerald-500/10 text-emerald-100";
}

export function modelStateTone(state: string) {
  if (state === "production") {
    return "border-emerald-300/30 bg-emerald-400/10 text-emerald-100";
  }
  if (state === "canary") {
    return "border-cyan-300/30 bg-cyan-400/10 text-cyan-100";
  }
  if (state === "shadow") {
    return "border-indigo-300/30 bg-indigo-400/10 text-indigo-100";
  }
  if (state === "rollback") {
    return "border-amber-300/30 bg-amber-400/10 text-amber-100";
  }
  return "border-white/10 bg-white/10 text-slate-100";
}

export const fallbackLiveModels: LiveModel[] = [
  { model_id: "MLOPS-RISK-V3", name: "Crisis Risk Predictor", domain: "Crisis Risk Predictor", version: "v3.2.0", state: "production", traffic_percent: 100, accuracy: 95.4, confidence: 94, latency_ms: 42, error_rate: 0.3, sla_ms: 120, owner: "AI Platform", rollback_to: "v3.1.4" },
  { model_id: "MLOPS-PANIC-V2", name: "Panic Probability Engine", domain: "Panic Probability Engine", version: "v2.7.1", state: "canary", traffic_percent: 25, accuracy: 93.2, confidence: 91, latency_ms: 38, error_rate: 0.4, sla_ms: 110, owner: "Behavior AI", rollback_to: "v2.6.9" },
  { model_id: "MLOPS-CROWD-V4", name: "Crowd Congestion Forecaster", domain: "Crowd Congestion Forecaster", version: "v4.0.3", state: "production", traffic_percent: 100, accuracy: 95.1, confidence: 93, latency_ms: 51, error_rate: 0.5, sla_ms: 130, owner: "Crowd Lab", rollback_to: "v3.9.8" },
  { model_id: "MLOPS-ETA-V5", name: "Resource ETA Model", domain: "Resource ETA Model", version: "v5.1.0", state: "production", traffic_percent: 100, accuracy: 92.9, confidence: 90, latency_ms: 29, error_rate: 0.2, sla_ms: 90, owner: "Ops AI", rollback_to: "v5.0.5" },
  { model_id: "MLOPS-CHURN-V1", name: "Churn Predictor", domain: "Churn Predictor", version: "v1.8.2", state: "production", traffic_percent: 100, accuracy: 89.7, confidence: 88, latency_ms: 46, error_rate: 0.7, sla_ms: 140, owner: "Growth AI", rollback_to: "v1.7.8" },
  { model_id: "MLOPS-OVERLOAD-V1", name: "Operator Overload Predictor", domain: "Operator Overload Predictor", version: "v1.2.1", state: "canary", traffic_percent: 10, accuracy: 88.4, confidence: 86, latency_ms: 33, error_rate: 0.8, sla_ms: 100, owner: "Ops AI", rollback_to: "v1.1.7" },
];

export const fallbackScenarios: MLOpsScenario[] = [
  { scenario_id: "hotel_fire_floor3", title: "Hotel fire floor 3", domain: "Crisis Risk Predictor", zone: "Grand Meridian Floor 3 Kitchen B", occupancy: 428, smoke: 81, motion: 68, weather: "dry wind", incident_history: 7, operator_load: 42 },
  { scenario_id: "gas_leak_lab", title: "Gas leak lab", domain: "Incident Severity Ranker", zone: "Bala University Chemistry Lab", occupancy: 96, smoke: 28, motion: 41, weather: "humid", incident_history: 4, operator_load: 38 },
  { scenario_id: "mall_stampede_risk", title: "Mall stampede risk", domain: "Crowd Congestion Forecaster", zone: "Nova Mall Food Court", occupancy: 1840, smoke: 18, motion: 91, weather: "indoor", incident_history: 12, operator_load: 64 },
  { scenario_id: "hospital_oxygen_issue", title: "Hospital oxygen issue", domain: "Resource ETA Model", zone: "MetroCare ICU Wing", occupancy: 220, smoke: 14, motion: 36, weather: "controlled", incident_history: 6, operator_load: 55 },
  { scenario_id: "overload_operator_shift", title: "Overload operator shift", domain: "Operator Overload Predictor", zone: "Sentra Ops Desk Night Shift", occupancy: 34, smoke: 0, motion: 52, weather: "normal", incident_history: 18, operator_load: 88 },
  { scenario_id: "enterprise_churn_warning", title: "Enterprise churn warning", domain: "Churn Predictor", zone: "Skyline Campus Renewal Desk", occupancy: 12, smoke: 0, motion: 22, weather: "normal", incident_history: 3, operator_load: 35 },
];

export const fallbackPredictions: MLOpsPrediction[] = [
  { prediction_id: "PRED-0001", model_id: "MLOPS-RISK-V3", scenario_id: "hotel_fire_floor3", zone: "Grand Meridian Floor 3 Kitchen B", risk_score: 91, severity_class: "critical", eta_minutes: 6, confidence: 94, recommended_action: "Trigger guided floor 3 evacuation and dispatch containment team.", latency_ms: 44, model_version: "v3.2.0", success: true, created_at: "2026-04-26T00:04:00.000Z" },
  { prediction_id: "PRED-0002", model_id: "MLOPS-CROWD-V4", scenario_id: "mall_stampede_risk", zone: "Nova Mall Food Court", risk_score: 78, severity_class: "high", eta_minutes: 9, confidence: 89, recommended_action: "Split crowd toward north and east exits before density crosses threshold.", latency_ms: 53, model_version: "v4.0.3", success: true, created_at: "2026-04-26T00:07:00.000Z" },
  { prediction_id: "PRED-0003", model_id: "MLOPS-OVERLOAD-V1", scenario_id: "overload_operator_shift", zone: "Sentra Ops Desk Night Shift", risk_score: 74, severity_class: "high", eta_minutes: 12, confidence: 86, recommended_action: "Shift approvals to deputy pool and reduce noncritical polling.", latency_ms: 34, model_version: "v1.2.1", success: true, created_at: "2026-04-26T00:11:00.000Z" },
];

export const fallbackDrift: DriftSignal[] = [
  { drift_id: "DRIFT-PANIC-DENSITY", feature: "panic_density", domain: "behavior", drift_score: 27, level: "high", reason: "Mall crowd response differs from prior quarter after new signage flow.", recommended_action: "Trigger retraining for Panic Probability Engine." },
  { drift_id: "DRIFT-TEAM-LOAD", feature: "team_load", domain: "operations", drift_score: 21, level: "medium", reason: "Night shift approval workload is trending above historical load.", recommended_action: "Canary overload model to 25 percent." },
  { drift_id: "DRIFT-SMOKE-SLOPE", feature: "smoke_trend_slope", domain: "iot", drift_score: 18, level: "medium", reason: "Kitchen sensor variance is 14 percent above training baseline.", recommended_action: "Collect 6 more hours of labeled telemetry." },
  { drift_id: "DRIFT-RENEWAL-PROB", feature: "renewal_probability", domain: "revenue", drift_score: 11, level: "low", reason: "Usage mix is within expected enterprise expansion range.", recommended_action: "No action required." },
];

export const fallbackExplainLogs: ExplainLog[] = [
  { explain_id: "EXP-0001", prediction_id: "PRED-0001", model_id: "MLOPS-RISK-V3", top_features: ["smoke=81", "occupancy=428", "incident_history=7"], why_chosen: "Smoke intensity and occupied floor density make full guided evacuation safer than containment only.", why_rejected: "Shelter in place rejected because smoke spread and exit confidence are still favorable.", confidence_reason: "High sensor agreement and recent labeled hotel fire outcomes.", created_at: "2026-04-26T00:04:02.000Z" },
  { explain_id: "EXP-0002", prediction_id: "PRED-0002", model_id: "MLOPS-CROWD-V4", top_features: ["motion=91", "occupancy=1840", "smoke=18"], why_chosen: "Motion pressure shows crowd compression before hazard severity peaks.", why_rejected: "Single-exit routing rejected due to projected stairwell overload.", confidence_reason: "Strong match to mall crowd behavior training set.", created_at: "2026-04-26T00:07:03.000Z" },
];

export const fallbackDeployments: ModelDeployment[] = [
  { deployment_id: "DEP-RISK-320", model_id: "MLOPS-RISK-V3", name: "Crisis Risk Predictor", version: "v3.2.0", state: "production", canary_percent: 100, shadow_model: "v3.3.0-rc1", approval_status: "approved", version_health: 97, release_notes: "Lower false positives in mixed smoke and crowd anomalies.", rollback_available: true },
  { deployment_id: "DEP-PANIC-271", model_id: "MLOPS-PANIC-V2", name: "Panic Probability Engine", version: "v2.7.1", state: "canary", canary_percent: 25, shadow_model: "v2.8.0-shadow", approval_status: "watching", version_health: 92, release_notes: "Message-tone weights tuned from Phase 28 behavior outcomes.", rollback_available: true },
  { deployment_id: "DEP-CROWD-403", model_id: "MLOPS-CROWD-V4", name: "Crowd Congestion Forecaster", version: "v4.0.3", state: "production", canary_percent: 100, shadow_model: "v4.1.0-shadow", approval_status: "approved", version_health: 95, release_notes: "Adds corridor reverse-flow pressure features.", rollback_available: true },
  { deployment_id: "DEP-SEV-234", model_id: "MLOPS-SEVERITY-V2", name: "Incident Severity Ranker", version: "v2.3.4", state: "shadow", canary_percent: 0, shadow_model: "v2.3.4", approval_status: "pending", version_health: 90, release_notes: "Shadow comparing against current deterministic severity policy.", rollback_available: false },
];

export const fallbackMonitoring: MLOpsMonitoring = {
  generated_at: "2026-04-26T00:00:00.000Z",
  accuracy_decay: fallbackLiveModels.map((model) => ({ domain: model.domain, decay_percent: Number(Math.max(0.6, 100 - model.accuracy).toFixed(1)) })),
  drift_metrics: fallbackDrift,
  latency_sla: fallbackLiveModels.map((model) => ({ domain: model.domain, latency_ms: model.latency_ms, sla_ms: model.sla_ms, status: model.latency_ms <= model.sla_ms ? "pass" : "breach" })),
  error_rate: fallbackLiveModels.map((model) => ({ domain: model.domain, error_rate: model.error_rate })),
  class_imbalance: [
    { domain: "Incident Severity Ranker", minority_class: "critical_plus", coverage: 14 },
    { domain: "Churn Predictor", minority_class: "save_playbook_success", coverage: 21 },
  ],
  prediction_quality: 92.7,
  retrain_recommendations: [
    { domain: "Panic Probability Engine", reason: "Panic density drift crossed retrain threshold.", priority: "high", trigger: "auto retrain" },
    { domain: "Operator Overload Predictor", reason: "Night shift workload differs from training baseline.", priority: "medium", trigger: "human review" },
  ],
  alert_feed: [
    { title: "High drift detected", detail: "Panic density drift crossed retrain threshold.", severity: "high" },
    { title: "Shadow model beating baseline", detail: "Severity v2.3.4 improved recall by 3.1 percent in hidden traffic.", severity: "medium" },
    { title: "Latency SLA healthy", detail: "All production models remain below configured response SLA.", severity: "low" },
  ],
};

export const fallbackSummary: MLOpsSummary = {
  generated_at: "2026-04-26T00:00:00.000Z",
  active_production_models: 4,
  active_models: 8,
  predictions_per_minute: 284,
  avg_inference_latency: 42.1,
  avg_confidence: 90.3,
  failed_predictions: 0,
  error_rate: 0.5,
  drift_warnings: 3,
  high_drift_warnings: 1,
  sla_health: 96,
  rollback_ready_models: 4,
  top_risk_alerts: fallbackPredictions,
  confidence_heatmap: fallbackLiveModels.map((model) => ({ domain: model.domain, confidence: model.confidence, state: model.state })),
  explainability_feed: fallbackExplainLogs,
  live_inputs: fallbackScenarios,
  active_models_detail: fallbackLiveModels,
};

