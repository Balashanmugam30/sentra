import { apiClient } from "@/lib/core/api-client";
import type {
  ChurnResponse,
  CopilotResponse,
  ExpansionResponse,
  HealthResponse,
  OnboardingResponse,
  RenewalsResponse,
  SuccessLiveResponse,
  SuccessMetricsResponse,
  SuccessMutationResponse,
  SupportResponse,
} from "@/lib/customer-success/types";

export function getSuccessLive() {
  return apiClient.requestData<SuccessLiveResponse>("/success/live", {
    priority: "normal",
    cacheTtlMs: 10_000,
  });
}

export function getSuccessHealth() {
  return apiClient.requestData<HealthResponse>("/success/health", {
    priority: "normal",
    cacheTtlMs: 10_000,
  });
}

export function getSuccessChurn() {
  return apiClient.requestData<ChurnResponse>("/success/churn", {
    priority: "normal",
    cacheTtlMs: 10_000,
  });
}

export function getSuccessRenewals() {
  return apiClient.requestData<RenewalsResponse>("/success/renewals", {
    priority: "normal",
    cacheTtlMs: 12_000,
  });
}

export function getSuccessExpansion() {
  return apiClient.requestData<ExpansionResponse>("/success/expansion", {
    priority: "normal",
    cacheTtlMs: 12_000,
  });
}

export function getSuccessOnboarding() {
  return apiClient.requestData<OnboardingResponse>("/success/onboarding", {
    priority: "low",
    cacheTtlMs: 15_000,
  });
}

export function getSuccessSupport() {
  return apiClient.requestData<SupportResponse>("/success/support", {
    priority: "low",
    cacheTtlMs: 15_000,
  });
}

export function getSuccessMetrics() {
  return apiClient.requestData<SuccessMetricsResponse>("/success/metrics", {
    priority: "normal",
    cacheTtlMs: 12_000,
  });
}

export function getSuccessCopilot() {
  return apiClient.requestData<CopilotResponse>("/success/copilot", {
    priority: "normal",
    cacheTtlMs: 10_000,
  });
}

export function testSuccessRisk(tenantId?: string, scenario = "silent_churn") {
  return apiClient.requestData<SuccessMutationResponse>("/success/test-risk", {
    method: "POST",
    body: { tenant_id: tenantId, scenario },
    priority: "high",
  });
}

export function saveSuccessAccount(tenantId?: string) {
  return apiClient.requestData<SuccessMutationResponse>("/success/save-account", {
    method: "POST",
    body: { tenant_id: tenantId },
    priority: "high",
  });
}

export function expandSuccessAccount(tenantId?: string) {
  return apiClient.requestData<SuccessMutationResponse>("/success/expand-account", {
    method: "POST",
    body: { tenant_id: tenantId },
    priority: "high",
  });
}

export function runSuccessQbr(tenantId?: string) {
  return apiClient.requestData<SuccessMutationResponse>("/success/run-qbr", {
    method: "POST",
    body: { tenant_id: tenantId },
    priority: "high",
  });
}

export function seedSuccessDemo() {
  return apiClient.requestData<SuccessMutationResponse>("/success/seed-demo", {
    method: "POST",
    priority: "high",
  });
}
