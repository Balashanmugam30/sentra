import { apiClient } from "@/lib/core/api-client";
import type {
  ApiKeysResponse,
  DeveloperDocsResponse,
  DeveloperMutationResponse,
  DeveloperSdkResponse,
  DeveloperUsageResponse,
  EmbedWidgetsResponse,
  OAuthAppsResponse,
  WebhooksResponse,
} from "@/lib/developer/types";

export function getDevKeys() {
  return apiClient.requestData<ApiKeysResponse>("/dev/keys", { priority: "normal", cacheTtlMs: 10_000 });
}

export function createDevKey(label = "Sentra API Key") {
  return apiClient.requestData<DeveloperMutationResponse>("/dev/keys/create", {
    method: "POST",
    body: { label },
    priority: "high",
  });
}

export function getDevWebhooks() {
  return apiClient.requestData<WebhooksResponse>("/dev/webhooks", { priority: "normal", cacheTtlMs: 10_000 });
}

export function testDevWebhook(webhookId?: string) {
  return apiClient.requestData<DeveloperMutationResponse>("/dev/webhooks/test", {
    method: "POST",
    body: { webhook_id: webhookId, event: "alert.critical" },
    priority: "high",
  });
}

export function getDevApps() {
  return apiClient.requestData<OAuthAppsResponse>("/dev/apps", { priority: "low", cacheTtlMs: 12_000 });
}

export function getDevUsage() {
  return apiClient.requestData<DeveloperUsageResponse>("/dev/usage", {
    priority: "normal",
    cacheTtlMs: 10_000,
  });
}

export function getDevDocs() {
  return apiClient.requestData<DeveloperDocsResponse>("/dev/docs", { priority: "low", cacheTtlMs: 60_000 });
}

export function getDevSdk() {
  return apiClient.requestData<DeveloperSdkResponse>("/dev/sdk", { priority: "low", cacheTtlMs: 60_000 });
}

export function getEmbedWidgets() {
  return apiClient.requestData<EmbedWidgetsResponse>("/embed/widgets", {
    priority: "low",
    cacheTtlMs: 12_000,
  });
}

