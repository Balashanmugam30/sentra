"use client";

import { useEffect, useState } from "react";

import {
  applyMarketplaceVendor,
  approveMarketplaceSecurity,
  disableMarketplaceApp,
  enableMarketplaceApp,
  getInstalledIntegrations,
  getMarketplaceApps,
  getMarketplaceAutomations,
  getMarketplaceCategories,
  getMarketplaceFeatured,
  getMarketplaceMetrics,
  getMarketplacePartners,
  getMarketplaceRecommendations,
  getMarketplaceRevenue,
  getMarketplaceReviews,
  getMarketplaceSecurity,
  getMarketplaceSummary,
  getMarketplaceVendors,
  installMarketplaceApp,
  rateMarketplaceApp,
  searchMarketplaceApps,
  simulateMarketplaceRevenue,
  startMarketplaceTrial,
  testMarketplaceConnection,
  uninstallMarketplaceApp,
} from "@/lib/marketplace/api";
import {
  fallbackApps,
  fallbackAutomations,
  fallbackCategories,
  fallbackFeatured,
  fallbackInstalled,
  fallbackMetrics,
  fallbackPartners,
  fallbackRecommendations,
  fallbackRevenue,
  fallbackReviews,
  fallbackSecurity,
  fallbackSummary,
  fallbackVendors,
} from "@/lib/marketplace/runtime";
import type { MarketplaceState } from "@/lib/marketplace/types";

const initialState: MarketplaceState = {
  apps: fallbackApps,
  categories: fallbackCategories,
  featured: fallbackFeatured,
  installed: fallbackInstalled,
  recommendations: fallbackRecommendations,
  metrics: fallbackMetrics,
  summary: fallbackSummary,
  vendors: fallbackVendors,
  partners: fallbackPartners,
  revenue: fallbackRevenue,
  reviews: fallbackReviews,
  security: fallbackSecurity,
  automations: fallbackAutomations,
  loading: true,
  error: null,
  busyAction: null,
  lastAction: null,
};

let sharedState = initialState;
let refreshInFlight: Promise<void> | null = null;
const subscribers = new Set<(state: MarketplaceState) => void>();

function notify() {
  subscribers.forEach((subscriber) => subscriber(sharedState));
}

export async function refreshMarketplace() {
  if (refreshInFlight) {
    return refreshInFlight;
  }
  sharedState = { ...sharedState, loading: true };
  notify();
  refreshInFlight = (async () => {
    try {
      const [apps, categories, featured, installed, recommendations, metrics, summary, vendors, partners, revenue, reviews, security, automations] = await Promise.all([
        getMarketplaceApps(),
        getMarketplaceCategories(),
        getMarketplaceFeatured(),
        getInstalledIntegrations(),
        getMarketplaceRecommendations(),
        getMarketplaceMetrics(),
        getMarketplaceSummary(),
        getMarketplaceVendors(),
        getMarketplacePartners(),
        getMarketplaceRevenue(),
        getMarketplaceReviews(),
        getMarketplaceSecurity(),
        getMarketplaceAutomations(),
      ]);
      sharedState = {
        ...sharedState,
        apps,
        categories,
        featured,
        installed,
        recommendations,
        metrics,
        summary: summary.data,
        vendors: vendors.data,
        partners: partners.data,
        revenue: revenue.data,
        reviews: reviews.data,
        security: security.data,
        automations: automations.data,
        loading: false,
        error: null,
      };
    } catch (error) {
      sharedState = {
        ...sharedState,
        loading: false,
        error: error instanceof Error ? error.message : "Marketplace is running in resilient local mode",
      };
    } finally {
      refreshInFlight = null;
      notify();
    }
  })();
  return refreshInFlight;
}

async function withMarketplaceAction(label: string, action: () => Promise<{ message?: string }>) {
  sharedState = { ...sharedState, busyAction: label, error: null };
  notify();
  try {
    const response = await action();
    sharedState = { ...sharedState, busyAction: null, lastAction: response.message ?? label };
    notify();
    await refreshMarketplace();
  } catch (error) {
    sharedState = {
      ...sharedState,
      busyAction: null,
      error: error instanceof Error ? error.message : "Marketplace action failed",
    };
    notify();
  }
}

export function useMarketplace() {
  const [state, setState] = useState(sharedState);

  useEffect(() => {
    subscribers.add(setState);
    if (sharedState.loading && !refreshInFlight) {
      void refreshMarketplace();
    }
    return () => {
      subscribers.delete(setState);
    };
  }, []);

  return {
    ...state,
    refresh: refreshMarketplace,
    search: searchMarketplaceApps,
    install: (appId: string) => withMarketplaceAction(`install-${appId}`, () => installMarketplaceApp(appId)),
    uninstall: (appId: string) => withMarketplaceAction(`uninstall-${appId}`, () => uninstallMarketplaceApp(appId)),
    startTrial: (appId: string) => withMarketplaceAction(`trial-${appId}`, () => startMarketplaceTrial(appId)),
    testConnection: (appId: string) =>
      withMarketplaceAction(`test-${appId}`, () => testMarketplaceConnection(appId)),
    enable: (appId: string) => withMarketplaceAction(`enable-${appId}`, () => enableMarketplaceApp(appId)),
    disable: (appId: string) => withMarketplaceAction(`disable-${appId}`, () => disableMarketplaceApp(appId)),
    rate: (appId: string) => withMarketplaceAction(`rate-${appId}`, () => rateMarketplaceApp(appId)),
    applyVendor: (name?: string) => withMarketplaceAction("vendor-apply", () => applyMarketplaceVendor(name)),
    approveSecurity: (appId: string) => withMarketplaceAction(`security-${appId}`, () => approveMarketplaceSecurity(appId)),
    simulateRevenue: () => withMarketplaceAction("revenue-simulate", simulateMarketplaceRevenue),
  };
}

