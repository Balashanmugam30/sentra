import { apiClient } from "@/lib/core/api-client";
import type {
  PlatformApiKeysState,
  PlatformAppsState,
  PlatformDocsState,
  PlatformLogsState,
  PlatformMutationResponse,
  PlatformOpsLive,
  PlatformRateLimitState,
  PlatformSandboxState,
  PlatformSdksState,
  PlatformSummary,
  PlatformUsageState,
  PlatformWebhooksState,
} from "@/lib/platform/types";

function getOpsData<T = Record<string, unknown>>(path: string, cacheTtlMs = 8_000) {
  return apiClient.requestData<T>(path, {
    priority: "normal",
    cacheTtlMs,
  });
}

export function getPlatformOpsLive() {
  return getOpsData<PlatformOpsLive>("/ops/live", 8_000);
}

export function getPlatformOpsErrors() {
  return getOpsData("/ops/errors", 8_000);
}

export function getPlatformOpsPerformance() {
  return getOpsData("/ops/performance", 8_000);
}

export function getPlatformOpsDeployment() {
  return getOpsData("/ops/deployment", 12_000);
}

export function getPlatformOpsDataIntegrity() {
  return getOpsData("/ops/data/integrity", 12_000);
}

export function getPlatformOpsBillingReconciliation() {
  return getOpsData("/ops/billing/reconciliation", 12_000);
}

export function flushPlatformCache() {
  return apiClient.requestData<Record<string, unknown>>("/ops/admin/cache-flush", {
    method: "POST",
    priority: "high",
  });
}

export function createPlatformBackup() {
  return apiClient.requestData<Record<string, unknown>>("/ops/admin/backup", {
    method: "POST",
    priority: "high",
  });
}

type Envelope<T> = { data: T };

export function getPlatformSummary() {
  return apiClient.requestData<Envelope<PlatformSummary>>("/platform/summary", { priority: "high", cacheTtlMs: 10_000 });
}

export function getPlatformApiKeys() {
  return apiClient.requestData<Envelope<PlatformApiKeysState>>("/platform/apikeys", { priority: "high", cacheTtlMs: 10_000 });
}

export function createPlatformApiKey(name = "Operations API key", environment = "sandbox", scopes = ["incidents:read", "alerts:write"]) {
  return apiClient.requestData<PlatformMutationResponse>("/platform/apikey/create", {
    method: "POST",
    priority: "high",
    body: { name, environment, scopes, reason: "Developer platform key creation" },
  });
}

export function revokePlatformApiKey(keyId: string) {
  return apiClient.requestData<PlatformMutationResponse>("/platform/apikey/revoke", {
    method: "POST",
    priority: "high",
    body: { key_id: keyId, reason: "Developer platform key revocation" },
  });
}

export function rotatePlatformApiKey(keyId: string) {
  return apiClient.requestData<PlatformMutationResponse>("/platform/apikey/rotate", {
    method: "POST",
    priority: "high",
    body: { key_id: keyId, reason: "Developer platform key rotation" },
  });
}

export function getPlatformApps() {
  return apiClient.requestData<Envelope<PlatformAppsState>>("/platform/apps", { priority: "normal", cacheTtlMs: 10_000 });
}

export function createPlatformApp(name = "Sandbox OAuth App") {
  return apiClient.requestData<PlatformMutationResponse>("/platform/apps/create", {
    method: "POST",
    priority: "high",
    body: {
      name,
      environment: "sandbox",
      scopes: ["incidents:read", "webhooks:test"],
      redirect_urls: ["https://example.demo/oauth/callback"],
      reason: "Developer platform OAuth app creation",
    },
  });
}

export function updatePlatformApp(appId: string, scopes = ["incidents:read", "alerts:write"]) {
  return apiClient.requestData<PlatformMutationResponse>("/platform/apps/update", {
    method: "POST",
    priority: "high",
    body: { app_id: appId, scopes, reason: "Developer platform OAuth scope update" },
  });
}

export function revokePlatformApp(appId: string) {
  return apiClient.requestData<PlatformMutationResponse>("/platform/apps/revoke", {
    method: "POST",
    priority: "high",
    body: { app_id: appId, reason: "Developer platform OAuth app revocation" },
  });
}

export function getPlatformWebhooks() {
  return apiClient.requestData<Envelope<PlatformWebhooksState>>("/platform/webhooks", { priority: "high", cacheTtlMs: 10_000 });
}

export function createPlatformWebhook(name = "Sandbox event webhook") {
  return apiClient.requestData<PlatformMutationResponse>("/platform/webhook/create", {
    method: "POST",
    priority: "high",
    body: {
      name,
      endpoint_url: "https://example.demo/sentra/webhook",
      events: ["incident.created", "alert.sent"],
      reason: "Developer platform webhook creation",
    },
  });
}

export function testPlatformWebhook(webhookId: string) {
  return apiClient.requestData<PlatformMutationResponse>("/platform/webhook/test", {
    method: "POST",
    priority: "high",
    body: { webhook_id: webhookId, reason: "Developer platform webhook test" },
  });
}

export function retryPlatformWebhook(webhookId: string) {
  return apiClient.requestData<PlatformMutationResponse>("/platform/webhook/retry", {
    method: "POST",
    priority: "high",
    body: { webhook_id: webhookId, reason: "Developer platform webhook retry" },
  });
}

export function disablePlatformWebhook(webhookId: string) {
  return apiClient.requestData<PlatformMutationResponse>("/platform/webhook/disable", {
    method: "POST",
    priority: "high",
    body: { webhook_id: webhookId, reason: "Developer platform webhook disable" },
  });
}

export function getPlatformUsage() {
  return apiClient.requestData<Envelope<PlatformUsageState>>("/platform/usage", { priority: "high", cacheTtlMs: 10_000 });
}

export function getPlatformRateLimits() {
  return apiClient.requestData<Envelope<PlatformRateLimitState>>("/platform/ratelimits", { priority: "normal", cacheTtlMs: 10_000 });
}

export function getPlatformLogs() {
  return apiClient.requestData<Envelope<PlatformLogsState>>("/platform/logs", { priority: "normal", cacheTtlMs: 10_000 });
}

export function getPlatformSdks() {
  return apiClient.requestData<Envelope<PlatformSdksState>>("/platform/sdks", { priority: "normal", cacheTtlMs: 30_000 });
}

export function getPlatformDocs() {
  return apiClient.requestData<Envelope<PlatformDocsState>>("/platform/docs", { priority: "normal", cacheTtlMs: 30_000 });
}

export function getPlatformSandbox() {
  return apiClient.requestData<Envelope<PlatformSandboxState>>("/platform/sandbox", { priority: "normal", cacheTtlMs: 15_000 });
}

