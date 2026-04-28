import type {
  GovernanceActionResponse,
  GovernanceApproveRequest,
  GovernanceAuditResponse,
  GovernanceLiveResponse,
  GovernanceOverrideRequest,
  GovernancePauseRequest,
  GovernanceReassignRequest,
  GovernanceRejectRequest,
  GovernanceResumeRequest,
} from "@/lib/governance/types";
import { authenticatedFetch } from "@/lib/auth/fetch";

async function parseResponse<T>(response: Response, fallback: string): Promise<T> {
  if (!response.ok) {
    throw new Error(`${fallback}: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function getGovernanceLive(): Promise<GovernanceLiveResponse> {
  const response = await authenticatedFetch("/governance/live");
  return parseResponse<GovernanceLiveResponse>(response, "Failed to fetch governance live state");
}

export async function getGovernanceAudit(): Promise<GovernanceAuditResponse> {
  const response = await authenticatedFetch("/governance/audit");
  return parseResponse<GovernanceAuditResponse>(response, "Failed to fetch governance audit ledger");
}

async function postGovernanceAction<TRequest>(
  path: string,
  payload: TRequest,
  fallback: string,
): Promise<GovernanceActionResponse> {
  const response = await authenticatedFetch(`/governance/${path}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return parseResponse<GovernanceActionResponse>(response, fallback);
}

export async function approveGovernanceRequest(
  payload: GovernanceApproveRequest,
): Promise<GovernanceActionResponse> {
  return postGovernanceAction("approve", payload, "Failed to approve governance request");
}

export async function rejectGovernanceRequest(
  payload: GovernanceRejectRequest,
): Promise<GovernanceActionResponse> {
  return postGovernanceAction("reject", payload, "Failed to reject governance request");
}

export async function pauseGovernanceWorkflow(
  payload: GovernancePauseRequest,
): Promise<GovernanceActionResponse> {
  return postGovernanceAction("pause", payload, "Failed to pause workflow");
}

export async function resumeGovernanceWorkflow(
  payload: GovernanceResumeRequest,
): Promise<GovernanceActionResponse> {
  return postGovernanceAction("resume", payload, "Failed to resume workflow");
}

export async function overrideGovernanceWorkflow(
  payload: GovernanceOverrideRequest,
): Promise<GovernanceActionResponse> {
  return postGovernanceAction("override", payload, "Failed to override workflow");
}

export async function reassignGovernanceApproval(
  payload: GovernanceReassignRequest,
): Promise<GovernanceActionResponse> {
  return postGovernanceAction("reassign", payload, "Failed to reassign approval");
}
