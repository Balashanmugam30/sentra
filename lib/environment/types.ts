export type EnvironmentWeatherState = {
  temperature_c: number;
  feels_like_c: number;
  humidity: number;
  wind_kph: number;
  wind_direction: string;
  rain_mm: number;
  pressure: number;
  visibility_km: number;
  condition: string;
};

export type EnvironmentAirQualityState = {
  aqi: number;
  pm25: number;
  pm10: number;
  o3: number;
  no2: number;
  risk_band: "good" | "fair" | "moderate" | "poor" | "severe";
};

export type EnvironmentHazards = {
  storm_risk: number;
  flood_risk: number;
  fire_spread_risk: number;
  heat_risk: number;
  smoke_risk: number;
  lightning_risk: number;
  visibility_risk: number;
};

export type EnvironmentOperationalImpacts = {
  evacuation_difficulty: number;
  responder_speed_penalty: number;
  drone_flight_status: "clear" | "caution" | "grounded";
  facility_hvac_recommendation: string;
  outdoor_alert_level: "normal" | "elevated" | "high" | "critical";
};

export type EnvironmentAlert = {
  alert_id: string;
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  summary: string;
};

export type EnvironmentForecastInterval = {
  label: "+1h" | "+3h" | "+6h" | "+12h" | "+24h" | "+48h";
  rain: number;
  wind: number;
  temp: number;
  hazard_score: number;
  summary: string;
};

export type EnvironmentLiveResponse = {
  summary_only: boolean;
  partial?: boolean;
  stale_data?: boolean;
  provider: string;
  updated_at: string;
  weather: EnvironmentWeatherState;
  air_quality: EnvironmentAirQualityState;
  hazards: EnvironmentHazards;
  operational_impacts: EnvironmentOperationalImpacts;
  global_hazard_score: number;
};

export type EnvironmentForecastResponse = {
  summary_only: boolean;
  provider: string;
  updated_at: string;
  intervals: EnvironmentForecastInterval[];
};

export type EnvironmentAlertsResponse = {
  summary_only: boolean;
  provider: string;
  updated_at: string;
  alerts: EnvironmentAlert[];
};

export type EnvironmentTestScenario =
  | "cyclone"
  | "heavy_rain"
  | "wildfire_smoke"
  | "toxic_leak_wind"
  | "heatwave"
  | "dense_fog"
  | "clear_day";

export type EnvironmentTestScenarioResponse = {
  status: string;
  scenario: EnvironmentTestScenario;
  live: EnvironmentLiveResponse;
};
