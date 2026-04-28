export type CivilizationLive = {
  generated_at: string;
  countries_connected: number;
  cities_active: number;
  population_supported: number;
  hospitals_connected: number;
  universities: number;
  power_grid_uptime: number;
  water_security_score: number;
  transport_nodes: number;
  food_reserve_days: number;
  disaster_forecast_accuracy: number;
  recovery_coordination_score: number;
  civilization_score: number;
  label: string;
  backbone_thesis: string;
};

export type NationalGrid = {
  countries_connected: number;
  ministries_active: number;
  emergency_mesh_health: number;
  readiness_score: number;
  countries: Array<{ country: string; ministries_active: number; emergency_mesh_health: number; readiness: number; population_supported: number }>;
  command_posture: string;
};

export type ContinuityBackbone = {
  recovery_eta_minutes: number;
  redundancy_depth: number;
  cross_sector_coordination: number;
  population_served: number;
  continuity_layers: Array<{ layer: string; health: number }>;
};

export type MegaCityOps = {
  cities_onboarded: number;
  traffic_intelligence: number;
  crowd_flow: number;
  emergency_corridors: number;
  public_safety_posture: number;
  cities: Array<{ city: string; traffic_intelligence: number; crowd_flow: number; emergency_corridors: number; public_safety: number }>;
};

export type EducationGrid = {
  universities: number;
  schools: number;
  campus_safety: number;
  continuity_learning_posture: number;
  remote_continuity_capacity: number;
  priority_networks: string[];
};

export type UtilityResilience = {
  power_uptime: number;
  water_pressure: number;
  telecom_health: number;
  fuel_reserves_days: number;
  backup_generators: number;
  utility_assets: Array<{ name: string; type: string; uptime: number; risk: number; redundancy: number }>;
};

export type WaterCommand = {
  water_security_score: number;
  reservoirs: number;
  purification_plants: number;
  leak_detection: number;
  drought_pressure: number;
  water_systems: Array<{ name: string; capacity: number; quality: number; risk: number }>;
};

export type FoodSecurity = {
  warehouses: number;
  logistics_routes: number;
  cold_chain_health: number;
  shortage_risk: number;
  reserve_days: number;
  food_nodes: Array<{ name: string; reserve_days: number; route_health: number; risk: number }>;
};

export type TransportCommand = {
  transport_nodes: number;
  airports: number;
  ports: number;
  rail_nodes: number;
  metro_nodes: number;
  freight_nodes: number;
  reroute_efficiency: number;
  corridors: Array<{ name: string; mode: string; flow: number; reroute: number }>;
};

export type HealthcareNetwork = {
  hospitals_connected: number;
  icu_load: number;
  ambulance_routing: number;
  medicine_reserves_days: number;
  surge_readiness: number;
  hospital_regions: Array<{ region: string; hospitals: number; icu_load: number; surge: number }>;
};

export type DisasterPrediction = {
  forecast_accuracy: number;
  flood: { probability: number; readiness: number; eta_days: number };
  cyclone: { probability: number; readiness: number; eta_days: number };
  wildfire: { probability: number; readiness: number; eta_days: number };
  earthquake_response_readiness: number;
  heatwave_risk: number;
  future_risks: Array<{ risk: string; horizon: string; probability: number; mitigation: string }>;
};

export type CivilizationScore = {
  civilization_score: number;
  label: string;
  national_grid_score: number;
  mega_city_score: number;
  utility_resilience_score: number;
  transport_score: number;
  healthcare_score: number;
  education_score: number;
  food_security_score: number;
  water_command_score: number;
  disaster_prediction_score: number;
  continuity_backbone_score: number;
};

export type CivilizationMutationResponse = {
  ok: boolean;
  message: string;
  data: Record<string, unknown>;
};

