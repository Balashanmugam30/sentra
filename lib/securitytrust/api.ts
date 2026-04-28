import { apiClient } from "@/lib/core/api-client";
import type {
  ComplianceSummary,
  EvidenceState,
  PolicyState,
  PrivacyState,
  TrustExecutive,
  TrustMutationResponse,
  VendorRiskState,
} from "@/lib/securitytrust/types";

export function getComplianceSummary() {
  return apiClient.requestData<{ data: ComplianceSummary }>("/security/compliance/summary", { priority: "high", cacheTtlMs: 12_000 });
}

export function getPrivacyState() {
  return apiClient.requestData<{ data: PrivacyState }>("/security/privacy", { priority: "high", cacheTtlMs: 12_000 });
}

export function getPolicyState() {
  return apiClient.requestData<{ data: PolicyState }>("/security/policies", { priority: "normal", cacheTtlMs: 12_000 });
}

export function approveTrustPolicy(policyId = "POL-ACCESS-REVIEW", decision = "approved") {
  return apiClient.requestData<TrustMutationResponse>("/security/policy/approve", {
    method: "POST",
    body: { policy_id: policyId, decision, reason: "Phase 26.C policy trust room decision" },
    priority: "high",
  });
}

export function getVendorRiskState() {
  return apiClient.requestData<{ data: VendorRiskState }>("/security/vendor-risk", { priority: "normal", cacheTtlMs: 12_000 });
}

export function getEvidenceState() {
  return apiClient.requestData<{ data: EvidenceState }>("/security/evidence", { priority: "normal", cacheTtlMs: 15_000 });
}

export function getTrustExecutive() {
  return apiClient.requestData<{ data: TrustExecutive }>("/security/trust-executive", { priority: "high", cacheTtlMs: 15_000 });
}
