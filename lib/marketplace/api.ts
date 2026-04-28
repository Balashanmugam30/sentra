import { apiClient } from "@/lib/core/api-client";
import type {
  InstalledIntegrationsResponse,
  MarketplaceAppsResponse,
  MarketplaceAutomationsState,
  MarketplaceCategoriesResponse,
  MarketplaceMetrics,
  MarketplaceMutationResponse,
  MarketplacePartnersState,
  MarketplaceRecommendationsResponse,
  MarketplaceRevenueState,
  MarketplaceReviewsState,
  MarketplaceSecurityState,
  MarketplaceSummary,
  MarketplaceVendorsState,
} from "@/lib/marketplace/types";

type Envelope<T> = { data: T };

export function getMarketplaceSummary() {
  return apiClient.requestData<Envelope<MarketplaceSummary>>("/marketplace/summary", { priority: "normal", cacheTtlMs: 10_000 });
}

export function getMarketplaceApps() {
  return apiClient.requestData<MarketplaceAppsResponse>("/marketplace/apps", {
    priority: "low",
    cacheTtlMs: 60_000,
  });
}

export function getMarketplaceCategories() {
  return apiClient.requestData<MarketplaceCategoriesResponse>("/marketplace/categories", {
    priority: "low",
    cacheTtlMs: 60_000,
  });
}

export function getMarketplaceFeatured() {
  return apiClient.requestData<MarketplaceAppsResponse>("/marketplace/featured", {
    priority: "low",
    cacheTtlMs: 60_000,
  });
}

export function searchMarketplaceApps(q: string) {
  return apiClient.requestData<MarketplaceAppsResponse>(`/marketplace/search?q=${encodeURIComponent(q)}`, {
    priority: "low",
    cacheTtlMs: 12_000,
  });
}

export function getInstalledIntegrations() {
  return apiClient.requestData<InstalledIntegrationsResponse>("/marketplace/installed", {
    priority: "normal",
    cacheTtlMs: 8_000,
  });
}

export function getMarketplaceRecommendations() {
  return apiClient.requestData<MarketplaceRecommendationsResponse>("/marketplace/recommendations", {
    priority: "normal",
    cacheTtlMs: 12_000,
  });
}

export function getMarketplaceMetrics() {
  return apiClient.requestData<MarketplaceMetrics>("/marketplace/metrics", {
    priority: "normal",
    cacheTtlMs: 10_000,
  });
}

export function getMarketplaceVendors() {
  return apiClient.requestData<Envelope<MarketplaceVendorsState>>("/marketplace/vendors", { priority: "normal", cacheTtlMs: 12_000 });
}

export function getMarketplacePartners() {
  return apiClient.requestData<Envelope<MarketplacePartnersState>>("/marketplace/partners", { priority: "normal", cacheTtlMs: 12_000 });
}

export function getMarketplaceRevenue() {
  return apiClient.requestData<Envelope<MarketplaceRevenueState>>("/marketplace/revenue", { priority: "normal", cacheTtlMs: 12_000 });
}

export function getMarketplaceReviews() {
  return apiClient.requestData<Envelope<MarketplaceReviewsState>>("/marketplace/reviews", { priority: "normal", cacheTtlMs: 12_000 });
}

export function getMarketplaceSecurity() {
  return apiClient.requestData<Envelope<MarketplaceSecurityState>>("/marketplace/security", { priority: "normal", cacheTtlMs: 12_000 });
}

export function getMarketplaceAutomations() {
  return apiClient.requestData<Envelope<MarketplaceAutomationsState>>("/marketplace/automations", { priority: "normal", cacheTtlMs: 12_000 });
}

export function installMarketplaceApp(appId: string) {
  return apiClient.requestData<MarketplaceMutationResponse>("/marketplace/install", {
    method: "POST",
    body: { app_id: appId },
    priority: "high",
  });
}

export function uninstallMarketplaceApp(appId: string) {
  return apiClient.requestData<MarketplaceMutationResponse>("/marketplace/uninstall", {
    method: "POST",
    body: { app_id: appId },
    priority: "high",
  });
}

export function startMarketplaceTrial(appId: string) {
  return apiClient.requestData<MarketplaceMutationResponse>("/marketplace/start-trial", {
    method: "POST",
    body: { app_id: appId },
    priority: "high",
  });
}

export function testMarketplaceConnection(appId: string) {
  return apiClient.requestData<MarketplaceMutationResponse>("/marketplace/test-connection", {
    method: "POST",
    body: { app_id: appId },
    priority: "high",
  });
}

export function enableMarketplaceApp(appId: string) {
  return apiClient.requestData<MarketplaceMutationResponse>("/marketplace/enable", {
    method: "POST",
    body: { app_id: appId },
    priority: "high",
  });
}

export function disableMarketplaceApp(appId: string) {
  return apiClient.requestData<MarketplaceMutationResponse>("/marketplace/disable", {
    method: "POST",
    body: { app_id: appId },
    priority: "high",
  });
}

export function rateMarketplaceApp(appId: string, rating = 5) {
  return apiClient.requestData<MarketplaceMutationResponse>("/marketplace/rate", {
    method: "POST",
    body: { app_id: appId, rating, title: "Enterprise validated", body: "Marketplace integration reviewed during demo operations." },
    priority: "high",
  });
}

export function applyMarketplaceVendor(name = "New Verified Vendor") {
  return apiClient.requestData<MarketplaceMutationResponse>("/marketplace/vendor/apply", {
    method: "POST",
    body: { vendor_name: name },
    priority: "high",
  });
}

export function approveMarketplaceSecurity(appId: string) {
  return apiClient.requestData<MarketplaceMutationResponse>("/marketplace/security/approve", {
    method: "POST",
    body: { app_id: appId },
    priority: "high",
  });
}

export function simulateMarketplaceRevenue() {
  return apiClient.requestData<MarketplaceMutationResponse>("/marketplace/revenue/simulate", {
    method: "POST",
    body: { reason: "Marketplace revenue simulation from executive dashboard" },
    priority: "high",
  });
}

