export type OfflineMode = "online" | "degraded" | "offline_local" | "recovery_sync";
export type OfflineInternetStatus = "up" | "down";
export type OfflineBackendStatus = "healthy" | "degraded" | "offline";
export type OfflineLocalAlertChannel = "sms_local" | "wifi_lan" | "device_siren";
export type OfflineQueueState = "queued" | "synced" | "failed";
export type OfflineOutageScenario =
  | "internet_loss"
  | "cloud_loss"
  | "backend_partial"
  | "mobile_network_loss"
  | "power_failure_gateway";

export type OfflineQueueEventItem = {
  event_id: string;
  source: string;
  type: string;
  payload: Record<string, unknown>;
  created_at: string;
  sync_state: OfflineQueueState;
  last_error: string | null;
};

export type OfflineLiveResponse = {
  generated_at: string;
  mode: OfflineMode;
  internet_status: OfflineInternetStatus;
  backend_status: OfflineBackendStatus;
  cached_assets_ready: boolean;
  offline_queue_count: number;
  pending_sync_count: number;
  local_alert_channels: OfflineLocalAlertChannel[];
  estimated_autonomy_minutes: number;
  recommended_actions: string[];
  summary: string;
};

export type OfflineCacheStatusResponse = {
  generated_at: string;
  maps_cached: boolean;
  zones_cached: boolean;
  tasks_cached: boolean;
  devices_cached: boolean;
  last_snapshot_at: string | null;
  cache_health_score: number;
  queued_events: OfflineQueueEventItem[];
};

export type OfflineActivateResponse = {
  status: "activated" | "deactivated";
  mode: OfflineMode;
};

export type OfflineStoreEventRequest = {
  source: string;
  type: string;
  payload: Record<string, unknown>;
};

export type OfflineStoreEventResponse = {
  status: "stored";
  event_id: string;
  queue_count: number;
};

export type OfflineSyncNowResponse = {
  status: "completed";
  synced_count: number;
  failed_count: number;
  remaining: number;
};

export type OfflineTestOutageRequest = {
  scenario: OfflineOutageScenario;
};

export type OfflineTestOutageResponse = {
  status: "completed";
  scenario: OfflineOutageScenario;
  mode: OfflineMode;
};

