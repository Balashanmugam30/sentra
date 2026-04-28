export type AuditStatus = "success" | "denied" | "error";
export type AuditSeverity = "low" | "medium" | "high" | "critical";

export interface AuditEventItem {
  event_id: string;
  timestamp_utc: string;
  category: string;
  action: string;
  severity: AuditSeverity;
  actor_user_id: string | null;
  actor_email: string | null;
  actor_role: string | null;
  source_ip: string | null;
  user_agent: string | null;
  target_module: string;
  target_id: string | null;
  status: AuditStatus;
  reason: string | null;
  before_state: Record<string, unknown> | null;
  after_state: Record<string, unknown> | null;
  risk_score: number;
  correlation_id: string;
  session_id: string | null;
  previous_hash: string;
  record_hash: string;
}

export interface AuditAnomalyItem {
  anomaly_id: string;
  title: string;
  severity: AuditSeverity;
  description: string;
  related_event_ids: string[];
}

export interface AuditIntegrityStatus {
  chain_valid: boolean;
  broken_records: string[];
  total_records: number;
}

export interface AuditTotals {
  total_events_today: number;
  failed_logins: number;
  denied_requests: number;
  critical_actions: number;
}

export interface AuditLiveResponse {
  generated_at: string;
  totals: AuditTotals;
  recent_events: AuditEventItem[];
  anomalies: AuditAnomalyItem[];
  integrity_status: AuditIntegrityStatus;
  summary_only: boolean;
}

export interface AuditEventsResponse {
  generated_at: string;
  page: number;
  page_size: number;
  total_records: number;
  events: AuditEventItem[];
}

export interface AuditSearchPayload {
  user?: string;
  role?: string;
  module?: string;
  severity?: AuditSeverity;
  status?: AuditStatus;
  date_from?: string;
  date_to?: string;
  page?: number;
  page_size?: number;
}

export interface AuditExportResponse {
  format: "json" | "csv";
  content: string;
  exported_count: number;
}
