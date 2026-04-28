import { apiClient } from "@/lib/core/api-client";
import type {
  ApiUsage,
  CertificationTrack,
  DeveloperMetrics,
  EcosystemApp,
  EcosystemLive,
  EcosystemMutationResponse,
  EcosystemPartner,
  EcosystemRecommendation,
  IntegrationHealth,
  NetworkEffects,
  WebhookHealth,
  WhiteLabelSdk,
} from "@/lib/ecosystem/types";

export function getEcosystemLive() {
  return apiClient.requestData<EcosystemLive>("/ecosystem/live", { priority: "normal", cacheTtlMs: 10_000 });
}

export function getEcosystemMarketplace() {
  return apiClient.requestData<{ apps: EcosystemApp[]; summary: Record<string, unknown> }>(
    "/ecosystem/marketplace",
    { priority: "low", cacheTtlMs: 18_000 },
  );
}

export function getEcosystemIntegrations() {
  return apiClient.requestData<{ integrations: IntegrationHealth[] }>("/ecosystem/integrations", {
    priority: "normal",
    cacheTtlMs: 12_000,
  });
}

export function getEcosystemDevelopers() {
  return apiClient.requestData<{ developers: DeveloperMetrics; white_label_sdk: WhiteLabelSdk }>(
    "/ecosystem/developers",
    { priority: "low", cacheTtlMs: 18_000 },
  );
}

export function getEcosystemApiUsage() {
  return apiClient.requestData<{ usage: ApiUsage }>("/ecosystem/api-usage", {
    priority: "normal",
    cacheTtlMs: 12_000,
  });
}

export function getEcosystemWebhooks() {
  return apiClient.requestData<{ webhooks: WebhookHealth }>("/ecosystem/webhooks", {
    priority: "normal",
    cacheTtlMs: 12_000,
  });
}

export function getEcosystemPartners() {
  return apiClient.requestData<{ partners: EcosystemPartner[] }>("/ecosystem/partners", {
    priority: "low",
    cacheTtlMs: 18_000,
  });
}

export function getEcosystemCertifications() {
  return apiClient.requestData<{ certifications: CertificationTrack[] }>("/ecosystem/certifications", {
    priority: "low",
    cacheTtlMs: 18_000,
  });
}

export function getEcosystemNetworkEffects() {
  return apiClient.requestData<{ network_effects: NetworkEffects }>("/ecosystem/network-effects", {
    priority: "normal",
    cacheTtlMs: 12_000,
  });
}

export function getEcosystemExpansionAi() {
  return apiClient.requestData<{ recommendations: EcosystemRecommendation[] }>("/ecosystem/expansion-ai", {
    priority: "normal",
    cacheTtlMs: 12_000,
  });
}

export function createEcosystemApiKey() {
  return apiClient.requestData<EcosystemMutationResponse>("/ecosystem/create-api-key", {
    method: "POST",
    body: { label: "Partner ecosystem launch key" },
    priority: "high",
  });
}

export function installEcosystemApp(appId = "servicenow") {
  return apiClient.requestData<EcosystemMutationResponse>("/ecosystem/install-app", {
    method: "POST",
    body: { app_id: appId },
    priority: "high",
  });
}

export function launchEcosystemPartner() {
  return apiClient.requestData<EcosystemMutationResponse>("/ecosystem/launch-partner", {
    method: "POST",
    body: { partner_type: "government_si" },
    priority: "high",
  });
}

export function runEcosystemSimulation() {
  return apiClient.requestData<EcosystemMutationResponse>("/ecosystem/run-ecosystem-sim", {
    method: "POST",
    body: { scenario: "partner_app_store_flywheel" },
    priority: "high",
  });
}

export function issueEcosystemCertification() {
  return apiClient.requestData<EcosystemMutationResponse>("/ecosystem/issue-certification", {
    method: "POST",
    body: { track: "engineer" },
    priority: "high",
  });
}
