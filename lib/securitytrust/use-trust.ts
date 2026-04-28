"use client";

import { useEffect, useState } from "react";

import {
  approveTrustPolicy,
  getComplianceSummary,
  getEvidenceState,
  getPolicyState,
  getPrivacyState,
  getTrustExecutive,
  getVendorRiskState,
} from "@/lib/securitytrust/api";
import {
  fallbackCompliance,
  fallbackEvidence,
  fallbackExecutive,
  fallbackPolicies,
  fallbackPrivacy,
  fallbackVendorRisk,
} from "@/lib/securitytrust/runtime";
import type { SecurityTrustState } from "@/lib/securitytrust/types";

const initialState: SecurityTrustState = {
  compliance: fallbackCompliance,
  privacy: fallbackPrivacy,
  policies: fallbackPolicies,
  vendorRisk: fallbackVendorRisk,
  evidence: fallbackEvidence,
  executive: fallbackExecutive,
  loading: true,
  error: null,
  busyAction: null,
  lastAction: null,
};

let sharedState = initialState;
let refreshInFlight: Promise<void> | null = null;
const subscribers = new Set<(state: SecurityTrustState) => void>();

function notify() {
  subscribers.forEach((subscriber) => subscriber(sharedState));
}

export async function refreshSecurityTrust() {
  if (refreshInFlight) {
    return refreshInFlight;
  }
  sharedState = { ...sharedState, loading: true };
  notify();
  refreshInFlight = (async () => {
    try {
      const [compliance, privacy, policies, vendorRisk, evidence, executive] = await Promise.all([
        getComplianceSummary(),
        getPrivacyState(),
        getPolicyState(),
        getVendorRiskState(),
        getEvidenceState(),
        getTrustExecutive(),
      ]);
      sharedState = {
        ...sharedState,
        compliance: compliance.data,
        privacy: privacy.data,
        policies: policies.data,
        vendorRisk: vendorRisk.data,
        evidence: evidence.data,
        executive: executive.data,
        loading: false,
        error: null,
      };
    } catch (error) {
      sharedState = {
        ...sharedState,
        loading: false,
        error: error instanceof Error ? error.message : "Compliance trust room is running in resilient local mode",
      };
    } finally {
      refreshInFlight = null;
      notify();
    }
  })();
  return refreshInFlight;
}

async function withTrustAction(label: string, action: () => Promise<{ message?: string }>) {
  sharedState = { ...sharedState, busyAction: label, error: null };
  notify();
  try {
    const response = await action();
    sharedState = { ...sharedState, busyAction: null, lastAction: response.message ?? "Trust action complete" };
    notify();
    await refreshSecurityTrust();
  } catch (error) {
    sharedState = {
      ...sharedState,
      busyAction: null,
      error: error instanceof Error ? error.message : "Trust action could not be completed",
    };
    notify();
  }
}

export function useSecurityTrust() {
  const [state, setState] = useState(sharedState);

  useEffect(() => {
    subscribers.add(setState);
    if (sharedState.loading && !refreshInFlight) {
      void refreshSecurityTrust();
    }
    return () => {
      subscribers.delete(setState);
    };
  }, []);

  return {
    ...state,
    refresh: refreshSecurityTrust,
    approvePolicy: (policyId?: string, decision?: string) =>
      withTrustAction("approve-policy", () => approveTrustPolicy(policyId, decision)),
  };
}
