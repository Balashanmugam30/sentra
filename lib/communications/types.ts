export type CommChannel =
  | "in_app"
  | "sms"
  | "email"
  | "whatsapp"
  | "voice"
  | "siren"
  | "executive_notice"
  | "radio";

export type CommLevel = "normal" | "elevated" | "high" | "critical";
export type CommAudience = "occupants" | "responders" | "executives";
export type CommN8nStatus = "ready" | "connected" | "disabled";
export type RoleName =
  | "occupants"
  | "responders"
  | "executives"
  | "security"
  | "medical"
  | "facility_staff";

export type CommunicationAlertItem = {
  zone: string;
  priority: CommLevel;
  title: string;
  message: string;
  channels: CommChannel[];
  audience: CommAudience;
};

export type DeliveryStatus = {
  queued: number;
  sent: number;
  failed: number;
};

export type CommunicationsLiveResponse = {
  generated_at: string;
  global_level: CommLevel;
  active_channels: CommChannel[];
  alerts: CommunicationAlertItem[];
  delivery_status: DeliveryStatus;
  templates_used: string[];
  next_actions: string[];
  n8n_status: CommN8nStatus;
};

export type SendTestRequest = {
  channel: CommChannel;
  target: string;
  message: string;
};

export type SendTestResponse = {
  status: "sent" | "queued" | "failed";
  receipt_id: string;
  n8n_triggered: boolean;
};

export type BroadcastRequest = {
  severity: CommLevel;
  zones: string[];
  message: string;
};

export type BroadcastResponse = {
  status: "completed";
  fanout_count: number;
  channels: CommChannel[];
  n8n_triggered: boolean;
};

export type RoleMessageItem = {
  role: RoleName;
  zone: string;
  priority: CommLevel;
  title: string;
  message: string;
  channels: CommChannel[];
};

export type RoleCommunicationsResponse = {
  generated_at: string;
  global_level: CommLevel;
  roles_active: RoleName[];
  messages: RoleMessageItem[];
  delivery_summary: DeliveryStatus;
  next_escalations: string[];
  n8n_status: CommN8nStatus;
};

export type RoleTestRequest = {
  role: RoleName;
  zone: string;
};

export type RoleTestResponse = {
  status: "sent" | "queued" | "failed";
  role: RoleName;
  zone: string;
  receipt_id: string;
  n8n_triggered: boolean;
};

export type ProviderName =
  | "whatsapp"
  | "email"
  | "slack"
  | "teams"
  | "sms"
  | "voice";

export type ProviderStatus = "ready" | "mock" | "standby";

export type IntegrationProviderItem = {
  name: ProviderName;
  status: ProviderStatus;
};

export type DeliveryQueueSummary = {
  pending: number;
  sent: number;
  failed: number;
  retried: number;
};

export type CommunicationsIntegrationsResponse = {
  generated_at: string;
  n8n_status: CommN8nStatus;
  webhook_configured: boolean;
  providers: IntegrationProviderItem[];
  queue: DeliveryQueueSummary;
  recent_events: string[];
};

export type TestWebhookRequest = {
  event: string;
  channel: CommChannel;
};

export type TestWebhookResponse = {
  status: "delivered" | "queued" | "failed";
  provider: "n8n";
  webhook_response: string;
  receipt_id: string;
};

export type RetryFailedResponse = {
  status: "completed";
  retried: number;
  remaining_failed: number;
};

export type AckStatusInput =
  | "SAFE"
  | "NEED_HELP"
  | "TRAPPED"
  | "EVACUATED"
  | "ON_SITE"
  | "TEAM_DEPLOYED"
  | "MEDICAL_REQUIRED"
  | "FALSE_ALARM";

export type AckStatus =
  | "safe"
  | "need_help"
  | "trapped"
  | "evacuated"
  | "on_site"
  | "team_deployed"
  | "medical_required"
  | "false_alarm";

export type AckPriority = "low" | "normal" | "elevated" | "high" | "critical";

export type AckTotals = {
  alerts_sent: number;
  acknowledged: number;
  need_help: number;
  trapped: number;
  evacuated: number;
  pending: number;
};

export type AcknowledgementItem = {
  id: string;
  zone: string;
  role: RoleName;
  status: AckStatus;
  priority: AckPriority;
  message: string;
  received_at: string;
};

export type CommunicationsAcksResponse = {
  generated_at: string;
  global_level: CommLevel;
  totals: AckTotals;
  responses: AcknowledgementItem[];
  hotspots: string[];
  recommended_actions: string[];
  n8n_status: CommN8nStatus;
};

export type AckRespondRequest = {
  zone: string;
  role: RoleName;
  status: AckStatusInput;
  message: string;
};

export type AckRespondResponse = {
  status: "received";
  ack_id: string;
  priority: AckPriority;
  n8n_triggered: boolean;
};

export type AckBulkTestRequest = {
  zone: string;
  count: number;
  status: AckStatusInput;
};

export type AckBulkTestResponse = {
  status: "completed";
  created: number;
  n8n_triggered: boolean;
};
