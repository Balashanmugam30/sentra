export type FacilityConnectorName =
  | "access_control"
  | "hvac_bms"
  | "pa_system"
  | "cctv_metadata"
  | "elevator_controller"
  | "fire_panel"
  | "lighting_controller"
  | "campus_dispatch";

export type FacilityConnectorMode = "real" | "mock" | "offline_fallback";
export type FacilityGlobalState = "normal" | "alert" | "lockdown" | "degraded" | "emergency";
export type FacilityScope = "zone" | "building" | "campus";
export type FacilityDoorCommand = "lock" | "unlock" | "pulse_open";
export type FacilityHvacCommand = "shutdown" | "purge_air" | "normal_mode";
export type FacilityAnnouncementTemplate =
  | "evacuate_now"
  | "shelter_in_place"
  | "security_alert"
  | "test_message"
  | "all_clear";
export type FacilityScenario =
  | "fire_zone2"
  | "gas_zone3"
  | "intrusion_zone1"
  | "campus_lockdown"
  | "all_clear";

export type FacilityConnectorItem = {
  name: FacilityConnectorName;
  status: "ready" | "standby" | "degraded" | "offline";
  mode: FacilityConnectorMode;
};

export type FacilityAssetItem = {
  asset_id: string;
  asset_type: FacilityConnectorName;
  zone: string;
  name: string;
  status: string;
  online: boolean;
  mode: FacilityConnectorMode;
  last_seen: string;
  health_score: number;
};

export type FacilityAssetGroup = {
  asset_type: FacilityConnectorName;
  assets: FacilityAssetItem[];
};

export type FacilityEventItem = {
  timestamp: string;
  source: string;
  message: string;
  severity: "normal" | "high" | "critical";
};

export type FacilityLiveResponse = {
  generated_at: string;
  global_facility_state: FacilityGlobalState;
  connected_systems: number;
  assets_online: number;
  assets_offline: number;
  active_commands: number;
  critical_events: number;
  zones_secured: number;
  recommended_actions: string[];
  summary: string;
  connectors: FacilityConnectorItem[];
};

export type FacilityAssetsResponse = {
  generated_at: string;
  groups: FacilityAssetGroup[];
};

export type FacilityEventsResponse = {
  generated_at: string;
  events: FacilityEventItem[];
};

export type FacilityActionResponse = {
  status: "completed" | "queued";
  action: string;
  mode: FacilityConnectorMode;
  triggered_assets: string[];
  approval_required: boolean;
  required_role: string | null;
};

export type FacilityLockdownRequest = {
  scope: FacilityScope;
  zone?: string | null;
  reason: string;
};

export type FacilityDoorCommandRequest = {
  asset_id: string;
  command: FacilityDoorCommand;
};

export type FacilityHvacCommandRequest = {
  zone: string;
  command: FacilityHvacCommand;
};

export type FacilityAnnouncementRequest = {
  scope: FacilityScope;
  zone?: string | null;
  template: FacilityAnnouncementTemplate;
};

export type FacilityElevatorRecallRequest = {
  building: string;
};

export type FacilityFirePanelEventRequest = {
  zone: string;
  alarm: string;
};

export type FacilityFirePanelEventResponse = {
  status: "accepted";
  incident_created: boolean;
  action: string;
};

export type FacilityTestScenarioRequest = {
  scenario: FacilityScenario;
};

export type FacilityTestScenarioResponse = {
  status: "completed";
  scenario: FacilityScenario;
  actions: FacilityActionResponse[];
};

