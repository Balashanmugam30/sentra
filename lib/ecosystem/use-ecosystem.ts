"use client";

import { useEffect, useState } from "react";

import {
  createEcosystemApiKey,
  getEcosystemApiUsage,
  getEcosystemCertifications,
  getEcosystemDevelopers,
  getEcosystemExpansionAi,
  getEcosystemIntegrations,
  getEcosystemLive,
  getEcosystemMarketplace,
  getEcosystemNetworkEffects,
  getEcosystemPartners,
  getEcosystemWebhooks,
  installEcosystemApp,
  issueEcosystemCertification,
  launchEcosystemPartner,
  runEcosystemSimulation,
} from "@/lib/ecosystem/api";
import type {
  ApiUsage,
  CertificationTrack,
  DeveloperMetrics,
  EcosystemApp,
  EcosystemLive,
  EcosystemPartner,
  EcosystemRecommendation,
  IntegrationHealth,
  NetworkEffects,
  WebhookHealth,
  WhiteLabelSdk,
} from "@/lib/ecosystem/types";

type EcosystemState = {
  apiUsage: ApiUsage | null;
  apps: EcosystemApp[];
  busyAction: string | null;
  certifications: CertificationTrack[];
  developers: DeveloperMetrics | null;
  error: string | null;
  integrations: IntegrationHealth[];
  live: EcosystemLive | null;
  loading: boolean;
  networkEffects: NetworkEffects | null;
  partners: EcosystemPartner[];
  recommendations: EcosystemRecommendation[];
  webhooks: WebhookHealth | null;
  whiteLabelSdk: WhiteLabelSdk | null;
};

const initialState: EcosystemState = {
  apiUsage: null,
  apps: [],
  busyAction: null,
  certifications: [],
  developers: null,
  error: null,
  integrations: [],
  live: null,
  loading: true,
  networkEffects: null,
  partners: [],
  recommendations: [],
  webhooks: null,
  whiteLabelSdk: null,
};

let sharedState = initialState;
let refreshInFlight: Promise<void> | null = null;
const subscribers = new Set<(state: EcosystemState) => void>();

function notify() {
  subscribers.forEach((subscriber) => subscriber(sharedState));
}

export async function refreshEcosystem() {
  if (refreshInFlight) {
    return refreshInFlight;
  }
  sharedState = { ...sharedState, loading: true };
  notify();
  refreshInFlight = (async () => {
    try {
      const [live, marketplace, integrations, developers, apiUsage, webhooks, partners, certifications, networkEffects, expansionAi] =
        await Promise.all([
          getEcosystemLive(),
          getEcosystemMarketplace(),
          getEcosystemIntegrations(),
          getEcosystemDevelopers(),
          getEcosystemApiUsage(),
          getEcosystemWebhooks(),
          getEcosystemPartners(),
          getEcosystemCertifications(),
          getEcosystemNetworkEffects(),
          getEcosystemExpansionAi(),
        ]);
      sharedState = {
        ...sharedState,
        apiUsage: apiUsage.usage,
        apps: marketplace.apps,
        certifications: certifications.certifications,
        developers: developers.developers,
        error: null,
        integrations: integrations.integrations,
        live,
        loading: false,
        networkEffects: networkEffects.network_effects,
        partners: partners.partners,
        recommendations: expansionAi.recommendations,
        webhooks: webhooks.webhooks,
        whiteLabelSdk: developers.white_label_sdk,
      };
    } catch (error) {
      sharedState = {
        ...sharedState,
        error: error instanceof Error ? error.message : "Ecosystem engine is reconnecting",
        loading: false,
      };
    } finally {
      refreshInFlight = null;
      notify();
    }
  })();
  return refreshInFlight;
}

async function withEcosystemAction(label: string, action: () => Promise<unknown>) {
  sharedState = { ...sharedState, busyAction: label, error: null };
  notify();
  try {
    await action();
    sharedState = { ...sharedState, busyAction: null };
    notify();
    await refreshEcosystem();
  } catch (error) {
    sharedState = {
      ...sharedState,
      busyAction: null,
      error: error instanceof Error ? error.message : "Ecosystem action failed",
    };
    notify();
  }
}

export function useEcosystem() {
  const [state, setState] = useState(sharedState);

  useEffect(() => {
    subscribers.add(setState);
    void refreshEcosystem();
    return () => {
      subscribers.delete(setState);
    };
  }, []);

  return {
    ...state,
    createApiKey: () => withEcosystemAction("api-key", createEcosystemApiKey),
    installApp: (appId = "servicenow") => withEcosystemAction(`install-${appId}`, () => installEcosystemApp(appId)),
    issueCertification: () => withEcosystemAction("certification", issueEcosystemCertification),
    launchPartner: () => withEcosystemAction("partner", launchEcosystemPartner),
    refresh: refreshEcosystem,
    runSimulation: () => withEcosystemAction("simulation", runEcosystemSimulation),
  };
}
