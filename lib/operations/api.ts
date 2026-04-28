import type {
  ApproveRequest,
  ApproveResponse,
  CancelRequest,
  CancelResponse,
  OperationsHistoryResponse,
  OperationsLiveResponse,
  RunTestRequest,
  RunTestResponse,
} from "@/lib/operations/types";
import { authenticatedFetch } from "@/lib/auth/fetch";

export async function getOperationsLive(): Promise<OperationsLiveResponse> {
  const response = await authenticatedFetch("/operations/live");

  if (!response.ok) {
    throw new Error(`Failed to fetch operations live state: ${response.status}`);
  }

  return response.json() as Promise<OperationsLiveResponse>;
}

export async function getOperationsHistory(): Promise<OperationsHistoryResponse> {
  const response = await authenticatedFetch("/operations/history");

  if (!response.ok) {
    throw new Error(`Failed to fetch operations history: ${response.status}`);
  }

  return response.json() as Promise<OperationsHistoryResponse>;
}

export async function runOperationsTest(
  payload: RunTestRequest,
): Promise<RunTestResponse> {
  const response = await authenticatedFetch("/operations/run-test", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to run operations test: ${response.status}`);
  }

  return response.json() as Promise<RunTestResponse>;
}

export async function approveOperationsStep(
  payload: ApproveRequest,
): Promise<ApproveResponse> {
  const response = await authenticatedFetch("/operations/approve", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to approve workflow step: ${response.status}`);
  }

  return response.json() as Promise<ApproveResponse>;
}

export async function cancelOperationWorkflow(
  payload: CancelRequest,
): Promise<CancelResponse> {
  const response = await authenticatedFetch("/operations/cancel", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to cancel workflow: ${response.status}`);
  }

  return response.json() as Promise<CancelResponse>;
}
