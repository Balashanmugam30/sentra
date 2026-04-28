import { apiClient } from "@/lib/core/api-client";
import type {
  CertificationsState,
  ChannelEnvelope,
  ChannelMutationResponse,
  ChannelPartnersState,
  ChannelPipelineState,
  ChannelResellersState,
  ChannelRevenueState,
  ChannelSummary,
  CountriesState,
  OemState,
  PricingState,
  WhiteLabelState,
} from "@/lib/channel/types";

export function getChannelSummary() {
  return apiClient.requestData<ChannelEnvelope<ChannelSummary>>("/channel/summary", { priority: "normal", cacheTtlMs: 10_000 });
}

export function getChannelPartners() {
  return apiClient.requestData<ChannelEnvelope<ChannelPartnersState>>("/channel/partners", { priority: "normal", cacheTtlMs: 10_000 });
}

export function getChannelResellers() {
  return apiClient.requestData<ChannelEnvelope<ChannelResellersState>>("/channel/resellers", { priority: "normal", cacheTtlMs: 10_000 });
}

export function getChannelWhitelabel() {
  return apiClient.requestData<ChannelEnvelope<WhiteLabelState>>("/channel/whitelabel", { priority: "normal", cacheTtlMs: 10_000 });
}

export function getChannelOem() {
  return apiClient.requestData<ChannelEnvelope<OemState>>("/channel/oem", { priority: "normal", cacheTtlMs: 10_000 });
}

export function getChannelCountries() {
  return apiClient.requestData<ChannelEnvelope<CountriesState>>("/channel/countries", { priority: "normal", cacheTtlMs: 10_000 });
}

export function getChannelRevenue() {
  return apiClient.requestData<ChannelEnvelope<ChannelRevenueState>>("/channel/revenue", { priority: "normal", cacheTtlMs: 10_000 });
}

export function getChannelPipeline() {
  return apiClient.requestData<ChannelEnvelope<ChannelPipelineState>>("/channel/pipeline", { priority: "normal", cacheTtlMs: 10_000 });
}

export function getChannelCertifications() {
  return apiClient.requestData<ChannelEnvelope<CertificationsState>>("/channel/certifications", { priority: "normal", cacheTtlMs: 10_000 });
}

export function getChannelPricing() {
  return apiClient.requestData<ChannelEnvelope<PricingState>>("/channel/pricing", { priority: "normal", cacheTtlMs: 10_000 });
}

export function launchChannelCountry(country = "UAE") {
  return apiClient.requestData<ChannelMutationResponse>("/channel/launch-country", {
    method: "POST",
    body: { country, reason: "Country launch activated from expansion command" },
    priority: "high",
  });
}

export function createChannelBrand(name = "Sentra Partner Command") {
  return apiClient.requestData<ChannelMutationResponse>("/channel/create-brand", {
    method: "POST",
    body: { name, reason: "White-label brand created from channel OS" },
    priority: "high",
  });
}

export function upgradeChannelPartner(partnerId: string, tier = "Diamond") {
  return apiClient.requestData<ChannelMutationResponse>("/channel/partner/upgrade-tier", {
    method: "POST",
    body: { partner_id: partnerId, tier, reason: "Strategic channel tier upgrade" },
    priority: "high",
  });
}

export function payChannelCommission(commissionId: string) {
  return apiClient.requestData<ChannelMutationResponse>("/channel/commission/pay", {
    method: "POST",
    body: { commission_id: commissionId, reason: "Partner commission payout approved" },
    priority: "high",
  });
}

export function updateChannelPipeline(pipelineId: string) {
  return apiClient.requestData<ChannelMutationResponse>("/channel/pipeline/update", {
    method: "POST",
    body: {
      pipeline_id: pipelineId,
      payload: { stage: "executive commit", probability: 78 },
      reason: "Regional opportunity advanced",
    },
    priority: "high",
  });
}

