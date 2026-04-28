import { apiClient } from "@/lib/core/api-client";
import type {
  PartnerCertificationsResponse,
  PartnerMutationResponse,
  PartnerNetworkResponse,
  PartnerReferralsResponse,
  PartnerRevenueResponse,
  PartnersLiveResponse,
} from "@/lib/partners/types";

export function getPartnersLive() {
  return apiClient.requestData<PartnersLiveResponse>("/partners/live", {
    priority: "normal",
    cacheTtlMs: 12_000,
  });
}

export function getPartnerNetwork() {
  return apiClient.requestData<PartnerNetworkResponse>("/partners/network", {
    priority: "low",
    cacheTtlMs: 20_000,
  });
}

export function getPartnerReferrals() {
  return apiClient.requestData<PartnerReferralsResponse>("/partners/referrals", {
    priority: "normal",
    cacheTtlMs: 12_000,
  });
}

export function getPartnerRevenue() {
  return apiClient.requestData<PartnerRevenueResponse>("/partners/revenue", {
    priority: "normal",
    cacheTtlMs: 15_000,
  });
}

export function getPartnerCertifications() {
  return apiClient.requestData<PartnerCertificationsResponse>("/partners/certifications", {
    priority: "low",
    cacheTtlMs: 20_000,
  });
}

export function createPartner(name: string) {
  return apiClient.requestData<PartnerMutationResponse>("/partners/create", {
    method: "POST",
    body: { name },
    priority: "high",
  });
}

export function approvePartner(partnerId: string) {
  return apiClient.requestData<PartnerMutationResponse>("/partners/approve", {
    method: "POST",
    body: { partner_id: partnerId },
    priority: "high",
  });
}

export function payoutPartner(partnerId: string) {
  return apiClient.requestData<PartnerMutationResponse>("/partners/commission/payout", {
    method: "POST",
    body: { partner_id: partnerId },
    priority: "high",
  });
}

