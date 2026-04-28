export type MLDataset = {
  dataset_id: string;
  name: string;
  domain: string;
  rows: number;
  columns: number;
  missing_percent: number;
  freshness_minutes: number;
  label_coverage: number;
  quality_score: number;
  source: string;
  status: string;
};

export type MLFeature = {
  feature_id: string;
  name: string;
  domain: string;
  freshness: string;
  drift_score: number;
  importance: number;
  status: string;
};

export type MLJob = {
  job_id: string;
  model_domain: string;
  algorithm: string;
  status: string;
  dataset: string;
  training_time_minutes: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  latency_score: number;
  gpu_usage: number;
  owner: string;
};

export type MLExperiment = {
  experiment_id: string;
  name: string;
  model_domain: string;
  runs: number;
  winner_run: string;
  best_accuracy: number;
  feature_count: number;
  hyperparameters: Record<string, string | number>;
  status: string;
};

export type MLModel = {
  model_id: string;
  name: string;
  version: string;
  domain: string;
  status: "training" | "staging" | "production" | "archived" | string;
  created_date: string;
  owner: string;
  score: number;
  production: boolean;
  latency_ms: number;
  rollback_to: string;
};

export type MLSummary = {
  generated_at: string;
  active_datasets: number;
  ready_datasets: number;
  total_rows: number;
  avg_quality_score: number;
  avg_label_coverage: number;
  training_jobs: number;
  running_jobs: number;
  experiment_runs: number;
  model_count: number;
  production_models: number;
  best_model: MLModel;
  accuracy_leaderboard: MLModel[];
  feature_drift_watch: MLFeature[];
  training_queue: MLJob[];
  gpu_usage: {
    active_percent: number;
    queued_percent: number;
    cluster: string;
  };
  next_recommended_models: Array<{ domain: string; algorithm: string; why: string }>;
};

export type MLDataOperations = {
  generated_at: string;
  incident_data_volume: number;
  sensor_streams: number;
  behavior_events: number;
  revenue_signals: number;
  label_status: number;
  missing_fields: number;
  data_quality_score: number;
  freshness_monitor_minutes: number;
  source_connectors: string[];
  datasets: MLDataset[];
};

export type MLMutationResponse = {
  ok: boolean;
  message: string;
  data: Record<string, unknown>;
};
