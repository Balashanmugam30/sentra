import { authenticatedFetch } from "@/lib/auth/fetch";
import type {
  AuditEventsResponse,
  AuditExportResponse,
  AuditLiveResponse,
  AuditSearchPayload,
} from "@/lib/audit/types";

const AUDIT_API_BASE = "/audit";

async function parseResponse<T>(response: Response, fallback: string): Promise<T> {
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { detail?: string } | null;
    throw new Error(payload?.detail ?? `${fallback}: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function getAuditLive(): Promise<AuditLiveResponse> {
  const response = await authenticatedFetch(`${AUDIT_API_BASE}/live`);
  return parseResponse(response, "Failed to fetch audit live state");
}

export async function getAuditEvents(page = 1, pageSize = 25): Promise<AuditEventsResponse> {
  const response = await authenticatedFetch(
    `${AUDIT_API_BASE}/events?page=${page}&page_size=${pageSize}`,
  );
  return parseResponse(response, "Failed to fetch audit events");
}

export async function postAuditSearch(
  payload: AuditSearchPayload,
): Promise<AuditEventsResponse> {
  const response = await authenticatedFetch(`${AUDIT_API_BASE}/search`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return parseResponse(response, "Failed to search audit events");
}

export async function getAuditExport(format: "json" | "csv"): Promise<AuditExportResponse> {
  const response = await authenticatedFetch(`${AUDIT_API_BASE}/export?format=${format}`);
  return parseResponse(response, "Failed to export audit events");
}
