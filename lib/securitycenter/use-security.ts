"use client";

import { useEffect, useState } from "react";

import {
  changeSecurityUserRole,
  createSecurityOrg,
  disableSecurityUser,
  getSecurityOrgs,
  getSecurityRoles,
  getSecuritySessions,
  getSecuritySummary,
  getSecurityUsers,
  inviteSecurityUser,
  resetSecurityUserMfa,
  revokeSecuritySession,
  switchSecurityOrg,
} from "@/lib/securitycenter/api";
import {
  fallbackOrgs,
  fallbackRoles,
  fallbackSessions,
  fallbackSummary,
  fallbackUsers,
} from "@/lib/securitycenter/runtime";
import type { SecurityCenterState } from "@/lib/securitycenter/types";

const initialState: SecurityCenterState = {
  summary: fallbackSummary,
  users: fallbackUsers,
  orgs: fallbackOrgs,
  sessions: fallbackSessions,
  roles: fallbackRoles,
  loading: true,
  error: null,
  busyAction: null,
  lastAction: null,
};

let sharedState = initialState;
let refreshInFlight: Promise<void> | null = null;
const subscribers = new Set<(state: SecurityCenterState) => void>();

function notify() {
  subscribers.forEach((subscriber) => subscriber(sharedState));
}

export async function refreshSecurityCenter() {
  if (refreshInFlight) {
    return refreshInFlight;
  }
  sharedState = { ...sharedState, loading: true };
  notify();
  refreshInFlight = (async () => {
    try {
      const [summary, users, orgs, sessions, roles] = await Promise.all([
        getSecuritySummary(),
        getSecurityUsers(),
        getSecurityOrgs(),
        getSecuritySessions(),
        getSecurityRoles(),
      ]);
      sharedState = {
        ...sharedState,
        summary: summary.data,
        users: users.items,
        orgs: orgs.items,
        sessions: sessions.items,
        roles: roles.items,
        loading: false,
        error: null,
      };
    } catch (error) {
      sharedState = {
        ...sharedState,
        loading: false,
        error: error instanceof Error ? error.message : "Identity center is running in resilient local mode",
      };
    } finally {
      refreshInFlight = null;
      notify();
    }
  })();
  return refreshInFlight;
}

async function withSecurityAction(label: string, action: () => Promise<{ message?: string }>) {
  sharedState = { ...sharedState, busyAction: label, error: null };
  notify();
  try {
    const response = await action();
    sharedState = {
      ...sharedState,
      busyAction: null,
      lastAction: response.message ?? "Identity security action complete",
    };
    notify();
    await refreshSecurityCenter();
  } catch (error) {
    sharedState = {
      ...sharedState,
      busyAction: null,
      error: error instanceof Error ? error.message : "Identity security action could not be completed",
    };
    notify();
  }
}

export function useSecurityCenter() {
  const [state, setState] = useState(sharedState);

  useEffect(() => {
    subscribers.add(setState);
    if (sharedState.loading && !refreshInFlight) {
      void refreshSecurityCenter();
    }
    return () => {
      subscribers.delete(setState);
    };
  }, []);

  return {
    ...state,
    refresh: refreshSecurityCenter,
    inviteUser: (email?: string, name?: string, role?: string, orgId?: string) =>
      withSecurityAction("invite-user", () => inviteSecurityUser(email, name, role, orgId)),
    disableUser: (userId: string) => withSecurityAction("disable-user", () => disableSecurityUser(userId)),
    changeRole: (userId: string, role: string) => withSecurityAction("change-role", () => changeSecurityUserRole(userId, role)),
    resetMfa: (userId: string) => withSecurityAction("reset-mfa", () => resetSecurityUserMfa(userId)),
    createOrg: (name?: string) => withSecurityAction("create-org", () => createSecurityOrg(name)),
    switchOrg: (orgId: string) => withSecurityAction("switch-org", () => switchSecurityOrg(orgId)),
    revokeSession: (sessionId: string) => withSecurityAction("revoke-session", () => revokeSecuritySession(sessionId)),
  };
}
