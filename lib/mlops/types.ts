export type ModelState = "training" | "staging" | "canary" | "production" | "shadow" | "rollback" | string;

export type LiveModel = {
  model_id: string;
  name: string;
  domain: string;
  version: string;
  state: ModelState;
  traffic_percent: number;
  accuracy: number;
  confidence: number;
  latency_ms: number;
  error_rate: number;
  sla_ms: number;
  owner: string;
  rollback_to: string;
};

export type MLOpsScenario = {
  scenario_id: string;
  title: string;
  domain: string;
  zone: string;
  occupancy: number;
  smoke: number;
  motion: number;
  weather: string;
  incident_history: number;
  operator_load: number;
};

export type MLOpsPrediction = {
  prediction_id: string;
  model_id: string;
  scenario_id: string;
  zone: string;
  risk_score: number;
  severity_class: "normal" | "watch" | "high" | "critical" | string;
  eta_minutes: number;
  confidence: number;
  recommended_action: string;
  latency_ms: number;
  model_version?: string;
  success: boolean;
  created_at: string;
};

export type ModelDeployment = {
  deployment_id: string;
  model_id: string;
  name: string;
  version: string;
  state: ModelState;
  canary_percent: number;
  shadow_model: string;
  approval_status: string;
  version_health: number;
  release_notes: string;
  rollback_available: boolean;
};

export type DriftSignal = {
  drift_id: string;
  feature: string;
  domain: string;
  drift_score: number;
  level: "low" | "medium" | "high" | string;
  reason: string;
  recommended_action: string;
};

export type ExplainLog = {
  explain_id: string;
  prediction_id: string;
  model_id: string;
  top_features: string[];
  why_chosen: string;
  why_rejected: string;
  confidence_reason: string;
  created_at: string;
};

export type MLOpsSummary = {
  generated_at: string;
  active_production_models: number;
  active_models: number;
  predictions_per_minute: number;
  avg_inference_latency: number;
  avg_confidence: number;
  failed_predictions: number;
  error_rate: number;
  drift_warnings: number;
  high_drift_warnings: number;
  sla_health: number;
  rollback_ready_models: number;
  top_risk_alerts: MLOpsPrediction[];
  confidence_heatmap: Array<{ domain: string; confidence: number; state: string }>;
  explainability_feed: ExplainLog[];
  live_inputs: MLOpsScenario[];
  active_models_detail: LiveModel[];
};

export type MLOpsMonitoring = {
  generated_at: string;
  accuracy_decay: Array<{ domain: string; decay_percent: number }>;
  drift_metrics: DriftSignal[];
  latency_sla: Array<{ domain: string; latency_ms: number; sla_ms: number; status: string }>;
  error_rate: Array<{ domain: string; error_rate: number }>;
  class_imbalance: Array<{ domain: string; minority_class: string; coverage: number }>;
  prediction_quality: number;
  retrain_recommendations: Array<{ domain: string; reason: string; priority: string; trigger: string }>;
  alert_feed: Array<{ title: string; detail: string; severity: string }>;
};

export type MLOpsMutationResponse = {
  ok: boolean;
  message: string;
  data: Record<string, unknown>;
};

