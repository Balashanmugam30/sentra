import { apiClient } from "@/lib/core/api-client";
import type {
  SecurityMutationResponse,
  SecurityOrg,
  SecurityRoleDefinition,
  SecuritySession,
  SecuritySummary,
  SecurityUser,
} from "@/lib/securitycenter/types";

export function getSecuritySummary() {
  return apiClient.requestData<{ data: SecuritySummary }>("/security/summary", { priority: "high", cacheTtlMs: 8_000 });
}

export function getSecurityUsers() {
  return apiClient.requestData<{ items: SecurityUser[] }>("/security/users", { priority: "high", cacheTtlMs: 8_000 });
}

export function inviteSecurityUser(email = "phase26.invite@sentra.demo", name = "Phase 26 Invite", role = "Viewer", orgId = "ORG-GRAND-MERIDIAN") {
  return apiClient.requestData<SecurityMutationResponse>("/security/user/invite", {
    method: "POST",
    body: { email, name, role, org_id: orgId, reason: "Phase 26 identity invite flow" },
    priority: "high",
  });
}

export function disableSecurityUser(userId: string) {
  return apiClient.requestData<SecurityMutationResponse>("/security/user/disable", {
    method: "POST",
    body: { user_id: userId, reason: "Identity admin disabled user" },
    priority: "high",
  });
}

export function changeSecurityUserRole(userId: string, role: string) {
  return apiClient.requestData<SecurityMutationResponse>("/security/user/role", {
    method: "POST",
    body: { user_id: userId, role, reason: "RBAC role adjustment" },
    priority: "high",
  });
}

export function resetSecurityUserMfa(userId: string) {
  return apiClient.requestData<SecurityMutationResponse>("/security/user/reset-mfa", {
    method: "POST",
    body: { user_id: userId, reason: "MFA reset requested by security admin" },
    priority: "high",
  });
}

export function getSecurityOrgs() {
  return apiClient.requestData<{ items: SecurityOrg[] }>("/security/orgs", { priority: "high", cacheTtlMs: 10_000 });
}

export function createSecurityOrg(name = "Phase 26 Secure Workspace") {
  return apiClient.requestData<SecurityMutationResponse>("/security/org/create", {
    method: "POST",
    body: { name, reason: "Phase 26 organization workspace creation" },
    priority: "high",
  });
}

export function switchSecurityOrg(orgId: string) {
  return apiClient.requestData<SecurityMutationResponse>("/security/org/switch", {
    method: "POST",
    body: { org_id: orgId, reason: "Identity workspace switch" },
    priority: "normal",
  });
}

export function getSecuritySessions() {
  return apiClient.requestData<{ items: SecuritySession[] }>("/security/sessions", { priority: "high", cacheTtlMs: 6_000 });
}

export function revokeSecuritySession(sessionId: string) {
  return apiClient.requestData<SecurityMutationResponse>("/security/session/revoke", {
    method: "POST",
    body: { session_id: sessionId, reason: "Security admin revoked live session" },
    priority: "critical",
  });
}

export function getSecurityRoles() {
  return apiClient.requestData<{ items: SecurityRoleDefinition[] }>("/security/roles", { priority: "normal", cacheTtlMs: 20_000 });
}
