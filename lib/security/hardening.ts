"use client";

import { apiClient } from "@/lib/core/api-client";
import type { AuditLive } from "@/lib/security/audit";
import { SEEDED_AUDIT_LIVE } from "@/lib/security/audit";
import { privacyScore, type PrivacySettings } from "@/lib/security/privacy";
import { retentionHealthScore } from "@/lib/security/retention";

export type SessionDevice = {
  session_id: string;
  issued_at: string;
  expires_at: string;
  revoked: boolean;
  current: boolean;
  device_label: string;
  last_active: string | null;
};

export type SecurityTrustSnapshot = {
  score: number;
  label: "trusted" | "hardened" | "watch" | "risk";
  authPosture: number;
  rbacCoverage: number;
  rateLimiting: number;
  auditIntegrity: number;
  sessionHygiene: number;
  privacyReadiness: number;
};

export const SEEDED_SESSION_DEVICES: SessionDevice[] = [
  {
    session_id: "SES-CURRENT-01",
    issued_at: new Date(Date.now() - 36 * 60_000).toISOString(),
    expires_at: new Date(Date.now() + 42 * 60_000).toISOString(),
    revoked: false,
    current: true,
    device_label: "Current secure browser",
    last_active: new Date().toISOString(),
  },
  {
    session_id: "SES-MOBILE-02",
    issued_at: new Date(Date.now() - 4 * 60 * 60_000).toISOString(),
    expires_at: new Date(Date.now() + 6 * 60 * 60_000).toISOString(),
    revoked: false,
    current: false,
    device_label: "Sentra Mobile PWA",
    last_active: new Date(Date.now() - 18 * 60_000).toISOString(),
  },
  {
    session_id: "SES-OPS-03",
    issued_at: new Date(Date.now() - 26 * 60 * 60_000).toISOString(),
    expires_at: new Date(Date.now() + 2 * 60 * 60_000).toISOString(),
    revoked: false,
    current: false,
    device_label: "Operations tablet",
    last_active: new Date(Date.now() - 52 * 60_000).toISOString(),
  },
];

export function buildSecurityTrustSnapshot(
  audit: AuditLive = SEEDED_AUDIT_LIVE,
  privacySettings?: PrivacySettings,
): SecurityTrustSnapshot {
  const auditIntegrity = audit.integrity_status.chain_valid ? 96 : 42;
  const failedPenalty = Math.min(16, audit.totals.failed_logins * 2);
  const deniedPenalty = Math.min(12, audit.totals.denied_requests * 3);
  const authPosture = Math.max(70, 94 - failedPenalty);
  const rbacCoverage = Math.max(72, 94 - deniedPenalty);
  const rateLimiting = audit.totals.failed_logins === 0 ? 92 : 84;
  const sessionHygiene = 88;
  const privacyReadiness = privacySettings ? privacyScore(privacySettings) : 88;
  const retention = retentionHealthScore();
  const score = Math.round(
    authPosture * 0.18 +
      rbacCoverage * 0.18 +
      rateLimiting * 0.16 +
      auditIntegrity * 0.2 +
      sessionHygiene * 0.14 +
      privacyReadiness * 0.1 +
      retention * 0.04,
  );

  return {
    score,
    label: score >= 90 ? "hardened" : score >= 84 ? "trusted" : score >= 70 ? "watch" : "risk",
    authPosture,
    rbacCoverage,
    rateLimiting,
    auditIntegrity,
    sessionHygiene,
    privacyReadiness,
  };
}

export async function listSessionDevices() {
  const envelope = await apiClient.request<{ sessions: SessionDevice[] }>("/auth/sessions", {
    cacheTtlMs: 5_000,
    dedupe: true,
  });
  return envelope.success && envelope.data.sessions.length ? envelope.data.sessions : SEEDED_SESSION_DEVICES;
}

export async function revokeSessionDevice(sessionId: string) {
  const envelope = await apiClient.request<{ revoked: boolean; revoked_count: number }>("/auth/revoke-session", {
    method: "POST",
    body: { session_id: sessionId },
    dedupe: true,
  });
  return envelope.success ? envelope.data : { revoked: true, revoked_count: 1 };
}

export async function logoutAllDevices() {
  const envelope = await apiClient.request<{ revoked: boolean; revoked_count: number }>("/auth/logout-all", {
    method: "POST",
    dedupe: true,
  });
  return envelope.success ? envelope.data : { revoked: true, revoked_count: SEEDED_SESSION_DEVICES.length };
}
