export type IotRiskLevel = "SAFE" | "WARNING" | "CRITICAL" | "CRITICAL+";
export type IotNodeStatus =
  | "online"
  | "offline"
  | "warning"
  | "critical"
  | "awaiting_telemetry"
  | "maintenance"
  | "disabled";
export type IotNodeType = "utility_risk_node" | "corridor_camera" | "hybrid_node";
export type IotMode = "REAL" | "DEMO" | "HYBRID";

export type IotTelemetryRecord = {
  event_id: string;
  node_id: string;
  timestamp: string;
  temperature: number | null;
  humidity: number | null;
  gas_level: number | null;
  flame_detected: boolean;
  button_pressed: boolean;
  wifi_rssi: number | null;
  battery: number | null;
  risk_level: IotRiskLevel;
  risk_score: number;
  triggers: string[];
  action_status: string;
  incident_id: string | null;
};

export type IotAlertRecord = {
  event_id: string;
  node_id: string;
  timestamp: string;
  alert_type: string;
  message: string;
  risk_level: IotRiskLevel;
  risk_score: number;
  incident_id: string | null;
};

export type IotEventRecord = IotTelemetryRecord | IotAlertRecord;

export type IotNode = {
  node_id: string;
  node_type: IotNodeType;
  label: string;
  building: string;
  zone: string;
  install_location: string;
  status: IotNodeStatus;
  last_heartbeat: string | null;
  wifi_rssi: number | null;
  battery: number | null;
  risk_level: IotRiskLevel;
  risk_score: number;
  latest_telemetry: IotTelemetryRecord | null;
  floor: string;
  firmware_version: string;
  assigned_role: string;
  health_score: number;
  latency_ms: number;
  packet_success_rate: number;
  uptime_percent: number;
  false_alarm_count: number;
  muted: boolean;
  disabled: boolean;
};

export type IotNodesResponse = {
  generated_at: string;
  nodes: IotNode[];
};

export type IotEventsResponse = {
  generated_at: string;
  events: IotEventRecord[];
};

export type IotCameraLatestResponse = {
  node_id: string;
  label: string;
  building: string;
  zone: string;
  public_area_only: boolean;
  snapshot_url: string;
  stream_url: string;
  last_capture_at: string | null;
  status: IotNodeStatus;
};

export type IotFleetSummary = {
  active_nodes: number;
  offline_nodes: number;
  critical_alerts: number;
  avg_health_score: number;
  avg_latency_ms: number;
  total_events_today: number;
  camera_nodes_online: number;
  mode: IotMode;
};

export type IotFleetResponse = {
  generated_at: string;
  summary: IotFleetSummary;
  nodes: IotNode[];
};

export type IotNodeDetailResponse = {
  generated_at: string;
  node: IotNode;
  recent_events: IotEventRecord[];
  diagnostics: Record<string, string | number | boolean | null>;
  calibration: IotCalibrationProfile;
};

export type IotCalibrationProfile = {
  gas_warning_threshold: number;
  gas_danger_threshold: number;
  temp_warning_threshold: number;
  temp_critical_threshold: number;
  flame_debounce_ms: number;
  ultrasonic_blocked_distance_cm: number;
  panic_hold_duration_ms: number;
  buzzer_policy: "off" | "warning_only" | "critical_only" | "always";
  preset: string;
};

export type IotThresholdsResponse = {
  generated_at: string;
  thresholds: IotCalibrationProfile;
  presets: string[];
};

export type IotAnalyticsTimeRange = "1h" | "24h" | "7d" | "30d";

export type IotChartPoint = {
  label: string;
  value: number;
};

export type IotAnalyticsResponse = {
  generated_at: string;
  time_range: IotAnalyticsTimeRange;
  metrics: {
    hourly_incidents: number;
    gas_trend_peak: number;
    temp_trend_peak: number;
    busiest_zones: string[];
    false_alarms: number;
    offline_durations_minutes: number;
    avg_response_time_seconds: number;
    camera_request_frequency: number;
  };
  series: {
    gas: IotChartPoint[];
    temperature: IotChartPoint[];
    incidents: IotChartPoint[];
  };
};

export type IotHealthResponse = {
  generated_at: string;
  fleet_health_score: number;
  diagnostics: Array<{
    node_id: string;
    label: string;
    health_score: number;
    status: IotNodeStatus;
    signal: number | null;
    latency_ms: number | null;
    recommendation: string;
  }>;
};

export type IotFeedItem = {
  id: string;
  timestamp: string;
  node_id: string;
  severity: IotRiskLevel;
  message: string;
  kind: "telemetry" | "alert" | "command";
};

export type IotFeedResponse = {
  generated_at: string;
  feed: IotFeedItem[];
};

export type IotSettings = {
  polling_interval_ms: number;
  retention_days: number;
  simulation_speed: number;
  auto_refresh: boolean;
  node_timeout_seconds: number;
  notification_rules: string[];
  sound_enabled: boolean;
  export_csv: boolean;
  mode: IotMode;
};

export type IotSettingsResponse = {
  generated_at: string;
  settings: IotSettings;
};

export type IotActionResponse = {
  accepted: boolean;
  node_id: string;
  action: string;
  message: string;
  node: IotNode;
};

export type IotDataResponse<TData = Record<string, unknown>> = {
  generated_at: string;
  data: TData;
};

export type IotProvisionDevice = {
  label: string;
  building: string;
  floor: string;
  zone: string;
  node_type: "sensor" | "camera" | "hybrid";
  tenant: string;
  firmware_version: string;
};

export type IotProvisioningData = {
  summary: {
    registered_devices: number;
    awaiting_install: number;
    secure_tokens_issued: number;
    bulk_import_ready: boolean;
  };
  devices: IotNode[];
  bulk_template_columns: string[];
};

export type IotProvisionResponse = {
  generated_at: string;
  device: IotNode & { tenant?: string; secure_token_preview?: string };
  qr_payload: string;
  secure_token_preview: string;
};

export type IotFirmwareData = {
  current_versions: Record<string, number>;
  available_releases: Array<{
    version: string;
    target: string;
    notes: string;
    compatible_devices: string[];
    status: string;
  }>;
  rollout: {
    active_version: string;
    rollout_percentage: number;
    canary_devices: string[];
    paused: boolean;
    rollback_available: string;
  };
  failed_upgrades: Array<{ node_id: string; reason: string; retry_window: string }>;
};

export type IotNetworkData = {
  summary: {
    buildings_online: number;
    floors_monitored: number;
    devices_active: number;
    critical_incidents: number;
    avg_response_time_seconds: number;
  };
  buildings: Array<{
    name: string;
    type: string;
    floors: number;
    rooms: number;
    nodes: number;
    camera_zones: number;
    risk: "safe" | "watch" | "critical";
    online: boolean;
  }>;
};

export type IotVisionData = {
  privacy_rules: string[];
  camera_zones: Array<{
    zone: string;
    camera_id: string;
    smoke_confidence: number;
    crowd_density: number;
    blocked_exit: boolean;
    slip_fall: boolean;
    queue_congestion: number;
    visibility: number;
  }>;
  inference_pipeline: {
    mode: string;
    face_recognition: boolean;
    room_surveillance: boolean;
    retention_hours: number;
    edge_blur_enabled: boolean;
  };
};

export type IotDemoScenario = {
  id: string;
  title: string;
  severity: IotRiskLevel;
  building: string;
  expected_eta: string;
};

export type IotDemoData = {
  scenarios: IotDemoScenario[];
};

export type IotDemoRunData = {
  scenario: IotDemoScenario;
  alert: IotAlertRecord;
  routing_update: string;
  executive_summary: string;
};

export type IotRoiInputs = {
  rooms: number;
  floors: number;
  staff_count: number;
  incidents_per_year: number;
  avg_loss_per_incident: number;
};

export type IotRoiData = {
  inputs: IotRoiInputs;
  prevented_losses: number;
  faster_response_savings: number;
  insurance_reduction_estimate: number;
  staffing_efficiency: number;
  annual_value: number;
  estimated_year_one_cost: number;
  roi_percent: number;
  payback_months: number;
};

export type IotLaunchData = {
  tam: string;
  sam: string;
  pricing: Array<{ tier: string; price: string; best_for: string }>;
  arr_forecast: Array<{ year: string; arr: number }>;
  moats: string[];
  roadmap: string[];
};

export function isIotAlertRecord(event: IotEventRecord): event is IotAlertRecord {
  return "alert_type" in event;
}
