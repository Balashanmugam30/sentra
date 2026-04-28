export type WorldMetrics = {
  tenant_id: string;
  countries_live: number;
  threats_active: number;
  global_stability: number;
  continuity_score: number;
  supremacy_score: number;
  forecast_accuracy: number;
  economic_pressure: string;
  pandemic_watch_zones: number;
  climate_alerts: number;
  supply_chain_chokepoints: number;
  diplomacy_index: number;
  satellite_resilience: number;
  generated_mode: string;
  updated_at: string;
};

export type WorldLiveResponse = {
  provider: string;
  generated_at: string;
  metrics: WorldMetrics;
  earth_twin: Record<string, unknown>;
  top_threats: Array<Record<string, unknown>>;
  continuity: Record<string, unknown>;
  supremacy: Record<string, unknown>;
  recommended_actions: Array<Record<string, unknown>>;
};

export type WorldDataResponse = {
  provider: string;
  generated_at: string;
  data: Record<string, unknown>;
};

export type WorldMutationResponse = {
  ok: boolean;
  message: string;
  generated_at: string;
  event: Record<string, unknown>;
  data: Record<string, unknown>;
};

