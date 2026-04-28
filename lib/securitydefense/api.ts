import { apiClient } from "@/lib/core/api-client";
import type {
  DefenseIncident,
  DefenseMutationResponse,
  ExecutiveDefense,
  ForensicsState,
  SocSummary,
  ThreatCenter,
  ZeroTrustState,
} from "@/lib/securitydefense/types";

export function getSocSummary() {
  return apiClient.requestData<{ data: SocSummary }>("/security/soc/summary", { priority: "critical", cacheTtlMs: 5_000 });
}

export function getSocIncidents() {
  return apiClient.requestData<{ items: DefenseIncident[] }>("/security/soc/incidents", { priority: "high", cacheTtlMs: 6_000 });
}

export function getThreatCenter() {
  return apiClient.requestData<{ data: ThreatCenter }>("/security/threats", { priority: "high", cacheTtlMs: 6_000 });
}

export function getZeroTrust() {
  return apiClient.requestData<{ data: ZeroTrustState }>("/security/zero-trust", { priority: "high", cacheTtlMs: 6_000 });
}

export function getForensics() {
  return apiClient.requestData<{ data: ForensicsState }>("/security/forensics", { priority: "normal", cacheTtlMs: 10_000 });
}

export function getExecutiveDefense() {
  return apiClient.requestData<{ data: ExecutiveDefense }>("/security/executive", { priority: "high", cacheTtlMs: 10_000 });
}

export function lockDefenseUser(userId = "USR-NIGHT-OPERATOR") {
  return apiClient.requestData<DefenseMutationResponse>("/security/respond/lock-user", {
    method: "POST",
    body: { user_id: userId, reason: "Zero trust automated containment" },
    priority: "critical",
  });
}

export function revokeDefenseSession(sessionId = "SES-NIGHT-OP-01") {
  return apiClient.requestData<DefenseMutationResponse>("/security/respond/revoke-session", {
    method: "POST",
    body: { session_id: sessionId, reason: "SOC token/session anomaly response" },
    priority: "critical",
  });
}

export function stepUpDefenseAuth(userId = "USR-SECURITY-ADMIN") {
  return apiClient.requestData<DefenseMutationResponse>("/security/respond/step-up-auth", {
    method: "POST",
    body: { user_id: userId, reason: "Privileged action step-up authentication" },
    priority: "critical",
  });
}

export function isolateDefenseKey(apiKeyId = "API-AUTOMATION-SPIKE") {
  return apiClient.requestData<DefenseMutationResponse>("/security/respond/isolate-key", {
    method: "POST",
    body: { api_key_id: apiKeyId, reason: "API abuse isolation" },
    priority: "critical",
  });
}
