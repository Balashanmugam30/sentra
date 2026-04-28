export type HardwareState = "healthy" | "warning" | "degraded" | "critical";
export type HardwareDeviceType =
  | "esp32"
  | "raspberry_pi"
  | "arduino_gateway"
  | "relay_controller"
  | "camera_metadata_node";
export type HardwareSensorType =
  | "temperature"
  | "humidity"
  | "smoke"
  | "gas"
  | "flame"
  | "motion"
  | "door_contact"
  | "vibration"
  | "noise"
  | "power_loss"
  | "panic_button";
export type HardwareRuleName =
  | "fire_risk"
  | "gas_leak"
  | "intrusion_watch"
  | "emergency_manual_alert"
  | "infrastructure_failure";
export type HardwareCommand =
  | "siren_on"
  | "siren_off"
  | "relay_on"
  | "relay_off"
  | "flash_beacon"
  | "restart_device";
export type HardwareDeliveryMode = "mqtt" | "http" | "mock";
export type HardwareTestScenario =
  | "fire_zone2"
  | "gas_zone4"
  | "panic_zone1"
  | "power_loss_zone3"
  | "intrusion_zone5";

export type HardwareRegisterRequest = {
  device_id: string;
  device_type: HardwareDeviceType;
  zone: string;
  sensors: HardwareSensorType[];
  firmware: string;
  preferred_transport?: HardwareDeliveryMode;
};

export type HardwareRegisterResponse = {
  status: string;
  registered_at: string;
  auth_token: string;
  heartbeat_interval: number;
};

export type HardwareIngestRequest = {
  device_id: string;
  zone: string;
  telemetry: Record<string, number | string | boolean>;
};

export type HardwareIngestResponse = {
  accepted: boolean;
  threat_delta: number;
  rules_triggered: HardwareRuleName[];
  incident_created: boolean;
  next_poll_seconds: number;
};

export type HardwareTestRequest = {
  scenario: HardwareTestScenario;
};

export type HardwareTestResponse = {
  status: string;
  scenario: string;
  ingest: HardwareIngestResponse;
};

export type HardwareCommandRequest = {
  device_id: string;
  command: HardwareCommand;
};

export type HardwareCommandResponse = {
  queued: boolean;
  delivered_mode: HardwareDeliveryMode;
};

export type HardwareDeviceItem = {
  device_id: string;
  zone: string;
  type: HardwareDeviceType;
  online: boolean;
  last_seen: string;
  firmware: string;
  health_score: number;
  sensors: HardwareSensorType[];
  battery: number;
  rssi: number;
  mode: "mock" | "real";
};

export type HardwareDevicesResponse = {
  generated_at: string;
  devices: HardwareDeviceItem[];
};

export type HardwareTopDeviceItem = {
  device_id: string;
  zone: string;
  status: "online" | "offline" | "warning";
  battery: number;
  rssi: number;
  last_seen: string;
  latest_alert: string | null;
};

export type HardwareLiveResponse = {
  generated_at: string;
  global_hardware_state: HardwareState;
  online_devices: number;
  offline_devices: number;
  battery_low_count: number;
  signal_weak_count: number;
  active_sensor_alerts: number;
  top_devices: HardwareTopDeviceItem[];
  recommended_actions: string[];
  summary: string;
};
