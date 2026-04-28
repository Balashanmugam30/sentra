"use client";

import { apiClient } from "@/lib/core/api-client";

export type AuditEvent = {
  event_id: string;
  timestamp_utc: string;
  category: string;
  action: string;
  severity: "low" | "medium" | "high" | "critical" | string;
  actor_email: string | null;
  actor_role: string | null;
  source_ip: string | null;
  user_agent: string | null;
  target_module: string;
  status: "success" | "denied" | "error";
  reason: string | null;
  risk_score: number;
  tenant_id?: string | null;
  record_hash: string;
  previous_hash: string;
};

export type AuditAnomaly = {
  anomaly_id: string;
  title: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  related_event_ids: string[];
};

export type AuditLive = {
  generated_at: string;
  totals: {
    total_events_today: number;
    failed_logins: number;
    denied_requests: number;
    critical_actions: number;
  };
  recent_events: AuditEvent[];
  anomalies: AuditAnomaly[];
  integrity_status: {
    chain_valid: boolean;
    broken_records: string[];
    total_records: number;
  };
  summary_only: boolean;
};

export const SEEDED_AUDIT_LIVE: AuditLive = {
  generated_at: new Date().toISOString(),
  totals: {
    total_events_today: 110,
    failed_logins: 0,
    denied_requests: 0,
    critical_actions: 8,
  },
  recent_events: [
    {
      event_id: "AUD-DEMO-110",
      timestamp_utc: new Date().toISOString(),
      category: "auth",
      action: "login_success",
      severity: "low",
      actor_email: "admin@sentra.demo",
      actor_role: "admin",
      source_ip: "10.24.**.18",
      user_agent: "Sentra Secure Browser",
      target_module: "auth",
      status: "success",
      reason: "Authenticated session created",
      risk_score: 12,
      tenant_id: "TEN-BALA-UNI",
      previous_hash: "3c4f...92a1",
      record_hash: "8f11...d4ac",
    },
    {
      event_id: "AUD-DEMO-109",
      timestamp_utc: new Date(Date.now() - 7 * 60_000).toISOString(),
      category: "rbac",
      action: "role_assignment",
      severity: "medium",
      actor_email: "admin@sentra.demo",
      actor_role: "admin",
      source_ip: "10.24.**.18",
      user_agent: "Sentra Secure Browser",
      target_module: "rbac",
      status: "success",
      reason: "Security manager access reviewed",
      risk_score: 38,
      tenant_id: "TEN-BALA-UNI",
      previous_hash: "927a...ef41",
      record_hash: "3c4f...92a1",
    },
    {
      event_id: "AUD-DEMO-108",
      timestamp_utc: new Date(Date.now() - 13 * 60_000).toISOString(),
      category: "export",
      action: "export_generated",
      severity: "medium",
      actor_email: "analyst@sentra.demo",
      actor_role: "analyst",
      source_ip: "10.24.**.42",
      user_agent: "Sentra Secure Browser",
      target_module: "reports",
      status: "success",
      reason: "Masked incident export generated with consent banner",
      risk_score: 31,
      tenant_id: "TEN-BALA-UNI",
      previous_hash: "4d29...ac62",
      record_hash: "927a...ef41",
    },
  ],
  anomalies: [],
  integrity_status: {
    chain_valid: true,
    broken_records: [],
    total_records: 110,
  },
  summary_only: false,
};

export function maskIpAddress(value: string | null | undefined) {
  if (!value) {
    return "masked";
  }
  const parts = value.split(".");
  if (parts.length !== 4) {
    return value.length > 10 ? `${value.slice(0, 6)}...` : value;
  }
  return `${parts[0]}.${parts[1]}.**.${parts[3]}`;
}

export async function getAuditLive() {
  const envelope = await apiClient.request<AuditLive>("/audit/live", {
    cacheTtlMs: 10_000,
    dedupe: true,
  });
  return envelope.success ? envelope.data : SEEDED_AUDIT_LIVE;
}

export async function getAuditEvents(page = 1, pageSize = 25) {
  const envelope = await apiClient.request<{
    generated_at: string;
    page: number;
    page_size: number;
    total_records: number;
    events: AuditEvent[];
  }>(`/audit/events?page=${page}&page_size=${pageSize}`, {
    cacheTtlMs: 10_000,
    dedupe: true,
  });

  if (envelope.success) {
    return envelope.data;
  }

  return {
    generated_at: SEEDED_AUDIT_LIVE.generated_at,
    page,
    page_size: pageSize,
    total_records: SEEDED_AUDIT_LIVE.integrity_status.total_records,
    events: SEEDED_AUDIT_LIVE.recent_events,
  };
}

export async function pruneAuditRetention() {
  const envelope = await apiClient.request<{
    pruned_count: number;
    archived_count: number;
    remaining_records: number;
  }>("/audit/retention/prune", {
    method: "POST",
    dedupe: true,
  });

  if (envelope.success) {
    return envelope.data;
  }

  return {
    pruned_count: 0,
    archived_count: 0,
    remaining_records: SEEDED_AUDIT_LIVE.integrity_status.total_records,
  };
}
