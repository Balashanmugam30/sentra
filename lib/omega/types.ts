export type OmegaMetrics = {
  accepted_decisions_percent: number;
  cities_active: number;
  civilization_resilience: number;
  climate_alerts: number;
  compound_intelligence_score: number;
  countries_modeled: number;
  current_objective: string;
  decision_accuracy: number;
  energy_stress_zones: number;
  forecast_accuracy: number;
  global_stability: number;
  governance_mode: string;
  learning_gain_percent: number;
  override_rate_percent: number;
  pandemic_watch_zones: number;
  recovery_improvement_percent: number;
  rejected_decisions_percent: number;
  self_heal_success_percent: number;
  supply_chokepoints: number;
  tenant_id: string;
  threat_events: number;
  trust_score: number;
  war_risk_regions: number;
};

export type OmegaLive = {
  generated_at: string;
  metrics: OmegaMetrics;
  planetary: Record<string, unknown>;
  recommended_actions: Array<Record<string, unknown>>;
  singularity: Record<string, unknown>;
  top_threats: Array<Record<string, unknown>>;
};

export type OmegaEnvelope<T = Record<string, unknown>> = {
  generated_at: string;
  data: T;
};

export type OmegaMutationResponse = {
  ok: boolean;
  message: string;
  generated_at: string;
  event: Record<string, unknown>;
  data: Record<string, unknown>;
};

