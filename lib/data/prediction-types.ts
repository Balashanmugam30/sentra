// lib/data/prediction-types.ts
/**
 * Sentra Phase 5 - Canonical Data Plane & Prediction TypeScript Interfaces.
 * Mirrors app/data/canonical_schemas.py with full support for multi-source ingestion,
 * calibrated uncertainty intervals (90% bounds), feature engineering snapshots,
 * and MLOps model governance records.
 */

export type SensorModality =
  | "FLIR_THERMAL"
  | "AIR_QUALITY"
  | "CCTV_OPTICAL"
  | "ACOUSTIC_SENSOR"
  | "HUMAN_REPORT"
  | "STRUCTURAL_IOT";

export type ProcessingStatus =
  | "received"
  | "validated"
  | "normalized"
  | "persisted"
  | "aggregated"
  | "rejected";

export type PredictionStatus =
  | "CONFIRMED"
  | "ESTIMATED"
  | "INSUFFICIENT_EVIDENCE"
  | "LOW_COVERAGE"
  | "HEURISTIC_FALLBACK";

export type ModelDeploymentState =
  | "candidate"
  | "validated"
  | "shadow"
  | "active"
  | "retired"
  | "rollback";

export type DriftState = "NORMAL" | "WATCH" | "DRIFT_DETECTED" | "SEVERE_DRIFT";

export interface LocationCoordinates {
  latitude?: number | null;
  longitude?: number | null;
  elevation_meters?: number | null;
  building_id: string;
  floor: string;
  zone_id: string;
  zone_name: string;
}

export interface ObservationEnvelope {
  reading_id: string;
  tenant_id: string;
  incident_id: string;
  sensor_id: string;
  modality: SensorModality;
  location: LocationCoordinates;
  timestamp: string;
  ingestion_timestamp: string;
  metrics: Record<string, unknown>;
  provenance: string;
  confidence: number;
  status?: ProcessingStatus;
  schema_version: string;
}

export interface QualityIssue {
  issue_type: "STALE_DATA" | "SENSOR_DROPOUT" | "OUT_OF_BOUNDS" | "CROSS_MODAL_CONFLICT" | "CLOCK_SKEW";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  sensor_id: string;
  description: string;
  timestamp: string;
}

export interface DataQualityReport {
  incident_id: string;
  overall_score: number; // 0.0 - 1.0
  active_sensors_count: number;
  expected_sensors_count: number;
  coverage_ratio: number;
  freshest_reading_timestamp: string;
  staleness_seconds: number;
  detected_issues: QualityIssue[];
  is_valid_for_inference: boolean;
}

export interface EnvironmentalFeatures {
  peak_thermal_gradient_celsius: number;
  mean_temperature_celsius: number;
  air_quality_composite_aqi: number;
  toxic_gas_dispersion_rate: number;
  hazard_index: number;
}

export interface SpatialFeatures {
  affected_area_sqm: number;
  nearest_egress_distance_meters: number;
  active_structural_zones_count: number;
  spatial_spread_velocity_mps: number;
  topological_chokepoint_proximity: number;
}

export interface CrowdFeatures {
  estimated_occupants_count: number;
  crowd_density_per_sqm: number;
  optical_flow_divergence: number;
  panic_velocity_mps: number;
  egress_obstruction_ratio: number;
}

export interface TemporalFeatures {
  elapsed_incident_seconds: number;
  acceleration_rate_pct: number;
  telemetry_frequency_hz: number;
  cycle_delta_seconds: number;
}

export interface EvidenceFeatures {
  total_evidence_nodes: number;
  corroborated_edges_count: number;
  conflict_edges_count: number;
  conflict_ratio: number;
  graph_density: number;
}

export interface FeatureSnapshot {
  incident_id: string;
  tenant_id: string;
  generated_at: string;
  environmental: EnvironmentalFeatures;
  spatial: SpatialFeatures;
  crowd: CrowdFeatures;
  temporal: TemporalFeatures;
  evidence: EvidenceFeatures;
  provenance_hash: string;
}

export interface UncertaintyInterval {
  point_estimate: number;
  lower_bound_90: number;
  upper_bound_90: number;
  interval_width: number;
  epistemic_uncertainty: number;
  aleatoric_uncertainty: number;
  is_calibrated: boolean;
}

export interface SeverityPrediction {
  current_level: number;
  predicted_level_15m: number;
  predicted_level_30m: number;
  confidence: number;
  uncertainty: UncertaintyInterval;
  rationale: string;
}

export interface EscalationRiskPrediction {
  risk_score: number;
  escalation_probability_10m: number;
  escalation_probability_30m: number;
  primary_catalyst: string;
  uncertainty: UncertaintyInterval;
  contributing_factors: Record<string, number>;
}

export interface EvacuationCorridorRisk {
  corridor_id: string;
  corridor_name: string;
  zone_id: string;
  pinch_point_risk: number;
  estimated_throughput_ppl_per_min: number;
  is_viable: boolean;
  clearance_priority: number;
}

export interface HazardPersistenceTrend {
  decay_half_life_minutes: number;
  persistence_category: "TRANSIENT" | "MODERATE" | "PERSISTENT" | "CRITICAL_PROLONGED";
  estimated_containment_minutes: number;
  trend_slope: number;
}

export interface CriticalStateEstimation {
  minutes_to_critical_threshold: number;
  time_to_flashover_seconds: number | null;
  time_to_structural_fatigue_minutes: number | null;
  uncertainty: UncertaintyInterval;
  is_imminent: boolean;
}

export interface IncidentPredictionBundle {
  id: string;
  incident_id: string;
  tenant_id: string;
  generated_at: string;
  status: PredictionStatus;
  fallback_reason: string | null;
  features_snapshot: FeatureSnapshot;
  data_quality: DataQualityReport;
  severity: SeverityPrediction;
  escalation_risk: EscalationRiskPrediction;
  evacuation_corridors: EvacuationCorridorRisk[];
  hazard_persistence: HazardPersistenceTrend;
  critical_state: CriticalStateEstimation;
  model_id: string;
  model_version: string;
  inference_latency_ms: number;
  is_simulation: boolean;
}

export interface ModelEvaluationMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  calibration_error_ece: number;
  mean_latency_ms: number;
}

export interface ModelVersionRecord {
  model_id: string;
  model_name: string;
  version: string;
  task: string;
  framework: string;
  training_data_reference: string;
  deployment_state: ModelDeploymentState;
  is_active: boolean;
  is_shadow: boolean;
  metrics: ModelEvaluationMetrics;
  created_at: string;
  deployed_at?: string | null;
  author: string;
}

export interface ShadowDivergenceLog {
  id: string;
  incident_id: string;
  timestamp: string;
  active_model_id: string;
  shadow_model_id: string;
  active_prediction: number;
  shadow_prediction: number;
  divergence_delta: number;
  active_latency_ms: number;
  shadow_latency_ms: number;
  within_acceptable_threshold: boolean;
}

export interface DriftMetric {
  feature_name: string;
  psi_value: number;
  status: DriftState;
  baseline_mean: number;
  current_mean: number;
}

export interface DriftReport {
  incident_id: string;
  evaluated_at: string;
  overall_psi: number;
  drift_state: DriftState;
  feature_drifts: DriftMetric[];
  recommendation: string;
}

export interface InferenceTelemetryReport {
  timestamp: string;
  total_inferences_24h: number;
  p50_latency_ms: number;
  p95_latency_ms: number;
  p99_latency_ms: number;
  fallback_rate_pct: number;
  gemini_api_cost_usd_est: number;
  active_model_count: number;
  shadow_model_count: number;
}
