import { apiClient } from "@/lib/core/api-client";
import type { DevelopersEnvelope } from "@/lib/developers/types";

export function getDevelopersSummary() {
  return apiClient.requestData<DevelopersEnvelope>("/developers/summary", {
    priority: "high",
    cacheTtlMs: 10_000,
  });
}

export function createDeveloperKey() {
  return apiClient.requestData<{ ok: boolean; message: string; data: Record<string, unknown> }>("/developers/key/create", {
    method: "POST",
    priority: "high",
    body: { name: "Public API Sandbox Key", scopes: ["incidents:read", "alerts:write"], reason: "Phase 22.X public API key creation" },
  });
}
