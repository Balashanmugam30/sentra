export type FieldResponderRole =
  | "firefighter"
  | "medical"
  | "security"
  | "facility_staff"
  | "commander"
  | "supervisor"
  | "volunteer";

export type FieldResponderDevice =
  | "android"
  | "ios"
  | "web"
  | "rugged_tablet"
  | "radio_terminal";

export type FieldResponderStatus =
  | "available"
  | "assigned"
  | "enroute"
  | "active"
  | "blocked"
  | "offline"
  | "sync_pending";

export type FieldResponderSignal = "weak" | "fair" | "strong";
export type FieldTaskPriority = "low" | "medium" | "high" | "critical";
export type FieldTaskStatus =
  | "pending"
  | "acknowledged"
  | "enroute"
  | "arrived"
  | "active"
  | "blocked"
  | "completed";

export type FieldGlobalState =
  | "normal"
  | "mobilizing"
  | "active_response"
  | "overloaded"
  | "critical";

export type FieldSyncEventType =
  | "acknowledge"
  | "status"
  | "backup_request"
  | "checkpoint";

export type FieldResponderItem = {
  responder_id: string;
  name: string;
  role: FieldResponderRole;
  status: FieldResponderStatus;
  current_zone: string;
  battery: number;
  signal: FieldResponderSignal;
  last_seen: string;
  active_task_id: string | null;
  call_sign: string;
  mode: "demo" | "real";
};

export type FieldRespondersResponse = {
  generated_at: string;
  responders: FieldResponderItem[];
};

export type FieldTaskItem = {
  task_id: string;
  priority: FieldTaskPriority;
  assigned_to: string | null;
  role: FieldResponderRole;
  zone: string;
  title: string;
  instructions: string;
  eta_minutes: number;
  route_hint: string;
  status: FieldTaskStatus;
  created_at: string;
  note: string | null;
  source_system: string;
};

export type FieldTasksResponse = {
  generated_at: string;
  tasks: FieldTaskItem[];
};

export type FieldLiveResponse = {
  generated_at: string;
  global_field_state: FieldGlobalState;
  online_responders: number;
  offline_responders: number;
  tasks_pending: number;
  tasks_active: number;
  backup_requests_open: number;
  zones_covered: number;
  recommended_actions: string[];
  summary: string;
};

export type FieldRegisterRequest = {
  responder_id: string;
  name: string;
  role: FieldResponderRole;
  device: FieldResponderDevice;
  zone: string;
};

export type FieldRegisterResponse = {
  registered: boolean;
  session_token: string;
  call_sign: string;
  sync_interval_seconds: number;
};

export type FieldAcknowledgeRequest = {
  task_id: string;
  responder_id: string;
};

export type FieldAcknowledgeResponse = {
  status: "acknowledged";
  task: FieldTaskItem;
};

export type FieldStatusUpdateRequest = {
  task_id: string;
  responder_id: string;
  status: "acknowledged" | "enroute" | "arrived" | "active" | "blocked" | "completed";
  note?: string | null;
};

export type FieldStatusUpdateResponse = {
  status: "updated";
  task: FieldTaskItem;
};

export type FieldBackupRequest = {
  responder_id: string;
  zone: string;
  reason: string;
};

export type FieldBackupResponse = {
  status: "open";
  request_id: string;
  open_requests: number;
};

export type FieldCheckpointRequest = {
  responder_id: string;
  zone: string;
  checkpoint: string;
};

export type FieldCheckpointResponse = {
  status: "verified";
  checkpoint: string;
  task_updated: boolean;
};

export type FieldSyncEvent = {
  event_type: FieldSyncEventType;
  task_id?: string | null;
  status?: "acknowledged" | "enroute" | "arrived" | "active" | "blocked" | "completed" | null;
  note?: string | null;
  zone?: string | null;
  checkpoint?: string | null;
  reason?: string | null;
};

export type FieldSyncRequest = {
  responder_id: string;
  queued_events: FieldSyncEvent[];
};

export type FieldSyncResponse = {
  status: "synced";
  processed_events: number;
  queued_remaining: number;
};

