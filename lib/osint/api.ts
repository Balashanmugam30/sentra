import { apiClient } from "@/lib/core/api-client";
import type {
  OsintHistoryResponse,
  OsintLiveResponse,
  OsintNewsResponse,
  OsintRumorResponse,
  OsintScenario,
  OsintTestScenarioResponse,
} from "@/lib/osint/types";

export async function getOsintLive(): Promise<OsintLiveResponse> {
  return apiClient.requestData<OsintLiveResponse>("/osint/live", {
    cacheTtlMs: 8_000,
    priority: "normal",
    timeoutMs: 6_000,
  });
}

export async function getOsintNews(options: { background?: boolean } = {}): Promise<OsintNewsResponse> {
  return apiClient.requestData<OsintNewsResponse>("/osint/news", {
    background: options.background,
    cacheTtlMs: 30_000,
    priority: options.background ? "background" : "normal",
    timeoutMs: options.background ? 14_000 : 8_000,
  });
}

export async function getOsintRumors(options: { background?: boolean } = {}): Promise<OsintRumorResponse> {
  return apiClient.requestData<OsintRumorResponse>("/osint/rumors", {
    background: options.background,
    cacheTtlMs: 30_000,
    priority: options.background ? "background" : "normal",
    timeoutMs: options.background ? 14_000 : 8_000,
  });
}

export async function getOsintHistory(
  options: { background?: boolean } = {},
): Promise<OsintHistoryResponse> {
  return apiClient.requestData<OsintHistoryResponse>("/osint/history", {
    background: options.background,
    cacheTtlMs: 45_000,
    priority: options.background ? "background" : "low",
    timeoutMs: options.background ? 14_000 : 10_000,
  });
}

export async function postOsintScenario(
  scenario: OsintScenario,
): Promise<OsintTestScenarioResponse> {
  return apiClient.requestData<OsintTestScenarioResponse>("/osint/test-scenario", {
    method: "POST",
    body: { scenario },
  });
}

export async function postOsintFocus(keyword: string): Promise<OsintLiveResponse> {
  return apiClient.requestData<OsintLiveResponse>("/osint/focus", {
    method: "POST",
    body: { keyword },
  });
}
