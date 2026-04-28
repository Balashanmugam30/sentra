import { apiClient } from "@/lib/core/api-client";
import type {
  BrandingPayloadUpdate,
  CreateOrgPayload,
  DeactivateUserPayload,
  InviteUserPayload,
  OrgMeResponse,
  OrgMutationResponse,
  OrgPlansResponse,
  OrgSettingsUpdatePayload,
  OrgSettingsResponse,
  OrgUsersResponse,
  UpdateUserRolePayload,
  UsageMeter,
} from "@/lib/tenant/types";

export function getOrgMe() {
  return apiClient.requestData<OrgMeResponse>("/org/me", {
    priority: "critical",
    cacheTtlMs: 8_000,
  });
}

export function getOrgUsers() {
  return apiClient.requestData<OrgUsersResponse>("/org/users", {
    priority: "normal",
    cacheTtlMs: 10_000,
  });
}

export function getOrgUsage() {
  return apiClient.requestData<UsageMeter>("/org/usage", {
    priority: "normal",
    cacheTtlMs: 8_000,
  });
}

export function getOrgSettings() {
  return apiClient.requestData<OrgSettingsResponse>("/org/settings", {
    priority: "normal",
    cacheTtlMs: 12_000,
  });
}

export function getOrgPlans() {
  return apiClient.requestData<OrgPlansResponse>("/org/plans", {
    priority: "low",
    cacheTtlMs: 20_000,
  });
}

export function createOrganization(payload: CreateOrgPayload) {
  return apiClient.requestData<OrgMutationResponse>("/org/create", {
    method: "POST",
    body: payload,
    priority: "high",
  });
}

export function inviteOrgUser(payload: InviteUserPayload) {
  return apiClient.requestData<OrgMutationResponse>("/org/invite-user", {
    method: "POST",
    body: payload,
    priority: "high",
  });
}

export function updateOrgUserRole(payload: UpdateUserRolePayload) {
  return apiClient.requestData<OrgMutationResponse>("/org/user-role", {
    method: "PATCH",
    body: payload,
    priority: "high",
  });
}

export function updateOrgSettings(payload: OrgSettingsUpdatePayload) {
  return apiClient.requestData<OrgMutationResponse>("/org/settings", {
    method: "PATCH",
    body: payload,
    priority: "high",
  });
}

export function deactivateOrgUser(payload: DeactivateUserPayload) {
  return apiClient.requestData<OrgMutationResponse>("/org/deactivate-user", {
    method: "POST",
    body: payload,
    priority: "high",
  });
}

export function switchWorkspace(tenantId: string) {
  return apiClient.requestData<OrgMutationResponse>("/org/switch-workspace", {
    method: "POST",
    body: { tenant_id: tenantId },
    priority: "critical",
  });
}

export function updateOrgBranding(payload: BrandingPayloadUpdate) {
  return apiClient.requestData<OrgMutationResponse>("/org/branding", {
    method: "POST",
    body: payload,
    priority: "high",
  });
}
