"use client";

import { useEffect, useState } from "react";

import {
  getExecutiveDefense,
  getForensics,
  getSocIncidents,
  getSocSummary,
  getThreatCenter,
  getZeroTrust,
  isolateDefenseKey,
  lockDefenseUser,
  revokeDefenseSession,
  stepUpDefenseAuth,
} from "@/lib/securitydefense/api";
import {
  fallbackExecutive,
  fallbackForensics,
  fallbackIncidents,
  fallbackSummary,
  fallbackThreats,
  fallbackZeroTrust,
} from "@/lib/securitydefense/runtime";
import type { SecurityDefenseState } from "@/lib/securitydefense/types";

const initialState: SecurityDefenseState = {
  summary: fallbackSummary,
  incidents: fallbackIncidents,
  threats: fallbackThreats,
  zeroTrust: fallbackZeroTrust,
  forensics: fallbackForensics,
  executive: fallbackExecutive,
  loading: true,
  error: null,
  busyAction: null,
  lastAction: null,
};

let sharedState = initialState;
let refreshInFlight: Promise<void> | null = null;
const subscribers = new Set<(state: SecurityDefenseState) => void>();

function notify() {
  subscribers.forEach((subscriber) => subscriber(sharedState));
}

export async function refreshSecurityDefense() {
  if (refreshInFlight) {
    return refreshInFlight;
  }
  sharedState = { ...sharedState, loading: true };
  notify();
  refreshInFlight = (async () => {
    try {
      const [summary, incidents, threats, zeroTrust, forensics, executive] = await Promise.all([
        getSocSummary(),
        getSocIncidents(),
        getThreatCenter(),
        getZeroTrust(),
        getForensics(),
        getExecutiveDefense(),
      ]);
      sharedState = {
        ...sharedState,
        summary: summary.data,
        incidents: incidents.items,
        threats: threats.data,
        zeroTrust: zeroTrust.data,
        forensics: forensics.data,
        executive: executive.data,
        loading: false,
        error: null,
      };
    } catch (error) {
      sharedState = {
        ...sharedState,
        loading: false,
        error: error instanceof Error ? error.message : "Threat defense is running in resilient local mode",
      };
    } finally {
      refreshInFlight = null;
      notify();
    }
  })();
  return refreshInFlight;
}

async function withDefenseAction(label: string, action: () => Promise<{ message?: string }>) {
  sharedState = { ...sharedState, busyAction: label, error: null };
  notify();
  try {
    const response = await action();
    sharedState = { ...sharedState, busyAction: null, lastAction: response.message ?? "Threat response action complete" };
    notify();
    await refreshSecurityDefense();
  } catch (error) {
    sharedState = {
      ...sharedState,
      busyAction: null,
      error: error instanceof Error ? error.message : "Threat response action could not be completed",
    };
    notify();
  }
}

export function useSecurityDefense() {
  const [state, setState] = useState(sharedState);

  useEffect(() => {
    subscribers.add(setState);
    if (sharedState.loading && !refreshInFlight) {
      void refreshSecurityDefense();
    }
    return () => {
      subscribers.delete(setState);
    };
  }, []);

  return {
    ...state,
    refresh: refreshSecurityDefense,
    lockUser: (userId?: string) => withDefenseAction("lock-user", () => lockDefenseUser(userId)),
    revokeSession: (sessionId?: string) => withDefenseAction("revoke-session", () => revokeDefenseSession(sessionId)),
    stepUpAuth: (userId?: string) => withDefenseAction("step-up-auth", () => stepUpDefenseAuth(userId)),
    isolateKey: (apiKeyId?: string) => withDefenseAction("isolate-key", () => isolateDefenseKey(apiKeyId)),
  };
}
