import { apiClient } from "@/lib/core/api-client";
import type { SiteAuthority, SiteEnvelope, SiteGlobal, SiteInvestors, SiteLeadResponse, SiteStatus, SiteSummary } from "@/lib/site/types";

const publicOptions = { auth: "none" as const, priority: "normal" as const, cacheTtlMs: 30_000 };

export function getSiteSummary() {
  return apiClient.requestData<SiteEnvelope<SiteSummary>>("/site/summary", publicOptions);
}

export function getSiteGlobal() {
  return apiClient.requestData<SiteEnvelope<SiteGlobal>>("/site/global", publicOptions);
}

export function getSiteAuthority() {
  return apiClient.requestData<SiteEnvelope<SiteAuthority>>("/site/authority", publicOptions);
}

export function getSiteStatus() {
  return apiClient.requestData<SiteEnvelope<SiteStatus>>("/site/status", publicOptions);
}

export function getSiteInvestors() {
  return apiClient.requestData<SiteEnvelope<SiteInvestors>>("/site/investors", publicOptions);
}

export function requestSiteDemo(payload: Record<string, string>) {
  return apiClient.requestData<SiteLeadResponse>("/site/request-demo", {
    method: "POST",
    auth: "none",
    priority: "high",
    body: payload,
  });
}

export function joinSiteWaitlist(payload: Record<string, string>) {
  return apiClient.requestData<SiteLeadResponse>("/site/waitlist", {
    method: "POST",
    auth: "none",
    priority: "high",
    body: payload,
  });
}
