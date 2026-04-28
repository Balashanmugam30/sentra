"use client";

import { useEffect, useState } from "react";

import { apiClient } from "@/lib/core/api-client";
import {
  createOrganization,
  deactivateOrgUser,
  getOrgMe,
  getOrgPlans,
  getOrgSettings,
  getOrgUsage,
  getOrgUsers,
  inviteOrgUser,
  switchWorkspace,
  updateOrgBranding,
  updateOrgSettings,
  updateOrgUserRole,
} from "@/lib/tenant/api";
import type {
  BrandingPayloadUpdate,
  CreateOrgPayload,
  DeactivateUserPayload,
  InviteUserPayload,
  OrgMeResponse,
  OrgPlansResponse,
  OrgSettingsUpdatePayload,
  OrgSettingsResponse,
  OrgUsersResponse,
  UpdateUserRolePayload,
  UsageMeter,
} from "@/lib/tenant/types";

type TenantState = {
  org: OrgMeResponse | null;
  users: OrgUsersResponse | null;
  usage: UsageMeter | null;
  settings: OrgSettingsResponse | null;
  plans: OrgPlansResponse | null;
  loading: boolean;
  error: string | null;
  busyAction: string | null;
  lastAction: string | null;
};

const initialState: TenantState = {
  org: null,
  users: null,
  usage: null,
  settings: null,
  plans: null,
  loading: true,
  error: null,
  busyAction: null,
  lastAction: null,
};

let sharedState = initialState;
let refreshInFlight: Promise<void> | null = null;
const subscribers = new Set<(state: TenantState) => void>();

function notify() {
  subscribers.forEach((subscriber) => subscriber(sharedState));
}

async function refreshTenant() {
  if (refreshInFlight) {
    return refreshInFlight;
  }
  sharedState = { ...sharedState, loading: true };
  notify();
  refreshInFlight = (async () => {
    try {
      const [org, users, usage, settings, plans] = await Promise.all([
        getOrgMe(),
        getOrgUsers().catch(() => null),
        getOrgUsage(),
        getOrgSettings(),
        getOrgPlans(),
      ]);
      sharedState = {
        ...sharedState,
        org,
        users,
        usage,
        settings,
        plans,
        loading: false,
        error: null,
      };
    } catch (error) {
      sharedState = {
        ...sharedState,
        loading: false,
        error: error instanceof Error ? error.message : "Workspace context is reconnecting",
      };
    } finally {
      refreshInFlight = null;
      notify();
    }
  })();
  return refreshInFlight;
}

async function withTenantAction(label: string, action: () => Promise<unknown>) {
  sharedState = { ...sharedState, busyAction: label, error: null };
  notify();
  try {
    await action();
    if (label.startsWith("switch-")) {
      await apiClient.ensureSession(true);
    }
    sharedState = { ...sharedState, busyAction: null, lastAction: label };
    notify();
    await refreshTenant();
  } catch (error) {
    sharedState = {
      ...sharedState,
      busyAction: null,
      error: error instanceof Error ? error.message : "Workspace action failed",
    };
    notify();
  }
}

export function useTenant() {
  const [state, setState] = useState(sharedState);

  useEffect(() => {
    subscribers.add(setState);
    void refreshTenant();
    return () => {
      subscribers.delete(setState);
    };
  }, []);

  return {
    ...state,
    refresh: refreshTenant,
    createOrganization: (payload: CreateOrgPayload) =>
      withTenantAction("create-organization", () => createOrganization(payload)),
    switchWorkspace: (tenantId: string) => withTenantAction(`switch-${tenantId}`, () => switchWorkspace(tenantId)),
    inviteUser: (payload: InviteUserPayload) => withTenantAction("invite-user", () => inviteOrgUser(payload)),
    updateUserRole: (payload: UpdateUserRolePayload) =>
      withTenantAction(`role-${payload.user_id}`, () => updateOrgUserRole(payload)),
    deactivateUser: (payload: DeactivateUserPayload) =>
      withTenantAction(`deactivate-${payload.user_id}`, () => deactivateOrgUser(payload)),
    updateSettings: (payload: OrgSettingsUpdatePayload) =>
      withTenantAction("update-settings", () => updateOrgSettings(payload)),
    updateBranding: (payload: BrandingPayloadUpdate) =>
      withTenantAction("update-branding", () => updateOrgBranding(payload)),
  };
}
