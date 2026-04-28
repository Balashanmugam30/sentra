export type GeoCoordinate = {
  lat: number;
  lng: number;
};

export type GeoIncidentItem = {
  incident_id: string;
  zone: string;
  type: string;
  severity: number;
  status: string;
  risk_level: string;
  recommended_action: string | null;
  source: string;
  coordinate: GeoCoordinate;
  radius_m: number;
};

export type GeoResponderItem = {
  responder_id: string;
  name: string;
  role: string;
  status: string;
  current_zone: string;
  battery: number;
  signal: string;
  last_seen: string;
  active_task_id: string | null;
  call_sign: string;
  mode: string;
  coordinate: GeoCoordinate;
};

export type GeoSensorItem = {
  device_id: string;
  zone: string;
  sensor_types: string[];
  alert_level: string;
  latest_alert: string | null;
  battery: number;
  rssi: number;
  coordinate: GeoCoordinate;
  status: string;
};

export type GeoFacilityItem = {
  asset_id: string;
  asset_type: string;
  zone: string;
  name: string;
  status: string;
  online: boolean;
  mode: string;
  last_seen: string;
  health_score: number;
  coordinate: GeoCoordinate;
};

export type GeoHotspotItem = {
  zone: string;
  risk_score: number;
  incident_count: number;
  movement: string;
  coordinate: GeoCoordinate;
  radius_m: number;
};

export type GeoBlockedRouteItem = {
  segment_id: string;
  from_zone: string;
  to_zone: string;
  reason: string;
  polyline: number[][];
};

export type GeoSafeZoneItem = {
  safe_zone_id: string;
  zone: string;
  name: string;
  coordinate: GeoCoordinate;
  capacity: number;
  status: string;
};

export type GeoHeatCellItem = {
  cell_id: string;
  center: GeoCoordinate;
  intensity: number;
  radius_m: number;
  source: string;
};

export type GeoEnvironmentOverlay = {
  provider: string;
  wind_kph: number;
  wind_direction: string;
  rain_mm: number;
  visibility_km: number;
  aqi: number;
  fire_spread_risk: number;
  flood_risk: number;
  smoke_risk: number;
};

export type GeoTrafficSegmentOverlay = {
  segment_id: string;
  from_zone: string;
  to_zone: string;
  speed_kph: number;
  congestion_score: number;
  blocked: boolean;
  eta_penalty_minutes: number;
  polyline: number[][];
};

export type GeoDispatchRouteOverlay = {
  route_id: string;
  vehicle_type: string;
  status: string;
  eta_minutes: number;
  green_signal_ready: boolean;
  polyline: number[][];
};

export type GeoPublicSafetyOverlay = {
  global_pressure: number;
  traffic_segments: GeoTrafficSegmentOverlay[];
  dispatch_routes: GeoDispatchRouteOverlay[];
  mobility: Record<string, number | string>;
  utilities: Record<string, string>;
};

export type GeoOsintHotspot = {
  hotspot_id: string;
  label: string;
  lat: number;
  lng: number;
  severity: string;
  source: string;
};

export type GeoOsintOverlay = {
  threat_level: string;
  reputation_risk: number;
  hotspots: GeoOsintHotspot[];
};

export type GeoLiveResponse = {
  generated_at: string;
  summary_only: boolean;
  partial?: boolean;
  stale_data?: boolean;
  incidents: GeoIncidentItem[];
  responders: GeoResponderItem[];
  sensors: GeoSensorItem[];
  facilities: GeoFacilityItem[];
  hotspots: GeoHotspotItem[];
  blocked_routes: GeoBlockedRouteItem[];
  safe_zones: GeoSafeZoneItem[];
  heat_cells: GeoHeatCellItem[];
  environment_overlay: GeoEnvironmentOverlay | null;
  public_safety_overlay: GeoPublicSafetyOverlay | null;
  osint_overlay: GeoOsintOverlay | null;
};

export type GeoLayerItem = {
  layer_id: "incidents" | "responders" | "sensors" | "routes" | "heatmap" | "facilities" | "safe_zones";
  label: string;
  enabled: boolean;
  restricted?: boolean;
  count: number;
};

export type GeoLayersResponse = {
  generated_at: string;
  layers: GeoLayerItem[];
};

export type GeoRouteAlternative = {
  mode: string;
  path: string[];
  polyline: number[][];
  eta_minutes: number;
  risk_score: number;
};

export type GeoRouteResponse = {
  from_zone: string;
  to_zone: string;
  mode: string;
  route_polyline: number[][];
  eta_minutes: number;
  risk_score: number;
  blocked_segments: GeoBlockedRouteItem[];
  alternatives: GeoRouteAlternative[];
};

export type GeoFocusResponse = {
  generated_at: string;
  zone: string;
  center: GeoCoordinate;
  polygon: number[][];
  incidents: GeoIncidentItem[];
  responders: GeoResponderItem[];
  sensors: GeoSensorItem[];
  facilities: GeoFacilityItem[];
  hotspot: GeoHotspotItem | null;
  blocked_routes: GeoBlockedRouteItem[];
};

export type GeoTestScenario =
  | "fire_zone2"
  | "gas_zone4"
  | "mass_panic_gate"
  | "blocked_exit"
  | "multi_zone_pressure";

export type GeoTestScenarioResponse = {
  status: string;
  scenario: GeoTestScenario;
  live: GeoLiveResponse;
};
