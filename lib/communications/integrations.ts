import type {
  CommunicationsIntegrationsResponse,
  RetryFailedResponse,
  TestWebhookRequest,
  TestWebhookResponse,
} from "@/lib/communications/types";

export async function getCommunicationsIntegrations(): Promise<CommunicationsIntegrationsResponse> {
  const response = await fetch("/api/communications/integrations");

  if (!response.ok) {
    throw new Error(`Failed to fetch integrations center: ${response.status}`);
  }

  return response.json() as Promise<CommunicationsIntegrationsResponse>;
}

export async function testWebhook(payload: TestWebhookRequest): Promise<TestWebhookResponse> {
  const response = await fetch("/api/communications/test-webhook", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to test webhook: ${response.status}`);
  }

  return response.json() as Promise<TestWebhookResponse>;
}

export async function retryFailedDeliveries(): Promise<RetryFailedResponse> {
  const response = await fetch("/api/communications/retry-failed", {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`Failed to retry deliveries: ${response.status}`);
  }

  return response.json() as Promise<RetryFailedResponse>;
}

