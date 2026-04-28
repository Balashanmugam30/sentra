import type {
  IntegrationHubEnvelope,
  IntegrationHubLogs,
  IntegrationHubMutationResponse,
  IntegrationHubSummary,
  IntegrationTestRequest,
  IntegrationTestResponse,
  IntegrationsLiveResponse,
  RetryFailedResponse,
  WebhookConfigRequest,
  WebhookConfigResponse,
} from "@/lib/integrations/types";
import { apiClient } from "@/lib/core/api-client";

export function getIntegrationHubSummary() {
  return apiClient.requestData<IntegrationHubEnvelope<IntegrationHubSummary>>("/integrations/summary", {
    priority: "high",
    cacheTtlMs: 10_000,
  });
}

export function getIntegrationHubLogs() {
  return apiClient.requestData<IntegrationHubEnvelope<IntegrationHubLogs>>("/integrations/logs", {
    priority: "normal",
    cacheTtlMs: 6_000,
  });
}

export function connectIntegration(provider = "ServiceNow Enterprise Mesh") {
  return apiClient.requestData<IntegrationHubMutationResponse>("/integrations/connect", {
    method: "POST",
    priority: "high",
    body: { provider, reason: "Phase 22.X universal integration hub connection" },
  });
}

export function testHubConnector(connectorId: string) {
  return apiClient.requestData<IntegrationTestResponse>("/integrations/test", {
    method: "POST",
    priority: "high",
    body: { connector_id: connectorId, message: "Phase 22.X connector health test" },
  });
}

export async function getIntegrationsLive(): Promise<IntegrationsLiveResponse> {
  const response = await fetch("/api/integrations/live");

  if (!response.ok) {
    throw new Error(`Failed to fetch integrations live state: ${response.status}`);
  }

  return response.json() as Promise<IntegrationsLiveResponse>;
}

export async function testIntegration(
  payload: IntegrationTestRequest,
): Promise<IntegrationTestResponse> {
  const response = await fetch("/api/integrations/test", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to test integration: ${response.status}`);
  }

  return response.json() as Promise<IntegrationTestResponse>;
}

export async function retryFailedIntegrations(): Promise<RetryFailedResponse> {
  const response = await fetch("/api/integrations/retry-failed", {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`Failed to retry integrations: ${response.status}`);
  }

  return response.json() as Promise<RetryFailedResponse>;
}

export async function updateWebhookConfig(
  payload: WebhookConfigRequest,
): Promise<WebhookConfigResponse> {
  const response = await fetch("/api/integrations/webhook-config", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to update webhook config: ${response.status}`);
  }

  return response.json() as Promise<WebhookConfigResponse>;
}
