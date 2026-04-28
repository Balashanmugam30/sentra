export type DataEmpireLive = {
  generated_at: string;
  signals_day: number;
  linked_entities: number;
  unique_datasets: number;
  prediction_accuracy: number;
  insights_generated_day: number;
  anomalies_found_week: number;
  data_product_arr: number;
  knowledge_growth_rate: number;
  competitive_moat_score: number;
  switching_cost_index: string;
};

export type DataSource = {
  source_id: string;
  name: string;
  category: string;
  tenant_scope: string;
  signals_day: number;
  freshness_seconds: number;
  trust_score: number;
  privacy_tier: string;
  last_ingested_at: string;
};

export type PipelineHealth = {
  pipeline_id: string;
  name: string;
  status: string;
  throughput_per_minute: number;
  quality_score: number;
  latency_ms: number;
  dedupe_rate: number;
  masked_fields: number;
};

export type SignalScore = {
  signal_id: string;
  source: string;
  importance_score: number;
  rarity_score: number;
  prediction_value: number;
  monetization_value: number;
  trust_score: number;
  decision_impact: number;
};

export type SignalSummary = {
  strongest_signal: string;
  highest_prediction_value: number;
  monetizable_signal_share: number;
  trusted_signal_share: number;
  decision_impact_index: number;
};

export type EntityNode = {
  id: string;
  label: string;
  entity_type: string;
  risk_score: number;
  value_score: number;
  confidence: number;
};

export type EntityRelationship = {
  source: string;
  target: string;
  relationship: string;
  strength: number;
};

export type EntityGraph = {
  generated_at: string;
  linked_entities: number;
  nodes: EntityNode[];
  relationships: EntityRelationship[];
};

export type ProprietaryInsight = {
  insight_id: string;
  title: string;
  detail: string;
  impact: string;
  confidence: number;
  monetization_value: number;
  moat_value: number;
  suggested_action: string;
};

export type ForecastPoint = {
  horizon: string;
  domain: string;
  risk_level: string;
  forecast: string;
  confidence: number;
  expected_value: number;
  recommended_action: string;
};

export type Anomaly = {
  anomaly_id: string;
  title: string;
  source: string;
  severity: string;
  probability: number;
  economic_impact: number;
  recommended_action: string;
};

export type DataProduct = {
  product_id: string;
  name: string;
  category: string;
  arr_potential: number;
  status: string;
  buyers: string[];
  margin: number;
};

export type PredictiveDataset = {
  dataset_id: string;
  name: string;
  uniqueness_score: number;
  training_value: number;
  revenue_value: number;
};

export type KnowledgeCompounding = {
  new_patterns_found: number;
  models_improved: number;
  prediction_accuracy_gain: number;
  cross_tenant_anonymized_learning: boolean;
  knowledge_asset_growth: number;
  daily_learning_summary: string[];
};

export type DataValue = {
  data_product_arr: number;
  benchmark_reports_arr: number;
  risk_api_arr: number;
  geo_forecast_arr: number;
  executive_insights_arr: number;
  government_watch_arr: number;
  margin_profile: number;
};

export type Moat = {
  competitive_moat_score: number;
  data_volume_score: number;
  data_uniqueness_score: number;
  prediction_accuracy_score: number;
  ecosystem_depth_score: number;
  retention_lift_score: number;
  switching_cost_index: string;
  ai_superiority_score: number;
  partner_data_advantage: number;
};

export type PrivacyPosture = {
  rbac_enforced: boolean;
  tenant_isolation: string;
  audit_logs: string;
  field_masking: string[];
  encryption: string;
  consent_flags: string;
  anonymized_learning_pools: string;
  deletion_workflows: string;
  export_controls: string;
  privacy_score: number;
};

export type DataEmpireMutationResponse = {
  ok: boolean;
  message: string;
  data: Record<string, unknown>;
};
