"use client";

import { useEffect, useState } from "react";

import {
  createDevKey,
  getDevApps,
  getDevDocs,
  getDevKeys,
  getDevSdk,
  getDevUsage,
  getDevWebhooks,
  getEmbedWidgets,
  testDevWebhook,
} from "@/lib/developer/api";
import type {
  ApiKeysResponse,
  DeveloperDocsResponse,
  DeveloperSdkResponse,
  DeveloperUsageResponse,
  EmbedWidgetsResponse,
  OAuthAppsResponse,
  WebhooksResponse,
} from "@/lib/developer/types";

type DeveloperState = {
  keys: ApiKeysResponse | null;
  webhooks: WebhooksResponse | null;
  apps: OAuthAppsResponse | null;
  usage: DeveloperUsageResponse | null;
  docs: DeveloperDocsResponse | null;
  sdk: DeveloperSdkResponse | null;
  widgets: EmbedWidgetsResponse | null;
  loading: boolean;
  error: string | null;
  busyAction: string | null;
};

const initialState: DeveloperState = {
  keys: null,
  webhooks: null,
  apps: null,
  usage: null,
  docs: null,
  sdk: null,
  widgets: null,
  loading: true,
  error: null,
  busyAction: null,
};

let sharedState = initialState;
let refreshInFlight: Promise<void> | null = null;
const subscribers = new Set<(state: DeveloperState) => void>();

function notify() {
  subscribers.forEach((subscriber) => subscriber(sharedState));
}

export async function refreshDeveloper() {
  if (refreshInFlight) {
    return refreshInFlight;
  }
  sharedState = { ...sharedState, loading: true };
  notify();
  refreshInFlight = (async () => {
    try {
      const [keys, webhooks, apps, usage, docs, sdk, widgets] = await Promise.all([
        getDevKeys(),
        getDevWebhooks(),
        getDevApps(),
        getDevUsage(),
        getDevDocs(),
        getDevSdk(),
        getEmbedWidgets(),
      ]);
      sharedState = { ...sharedState, keys, webhooks, apps, usage, docs, sdk, widgets, loading: false, error: null };
    } catch (error) {
      sharedState = {
        ...sharedState,
        loading: false,
        error: error instanceof Error ? error.message : "Developer platform is reconnecting",
      };
    } finally {
      refreshInFlight = null;
      notify();
    }
  })();
  return refreshInFlight;
}

async function withDeveloperAction(label: string, action: () => Promise<unknown>) {
  sharedState = { ...sharedState, busyAction: label, error: null };
  notify();
  try {
    await action();
    sharedState = { ...sharedState, busyAction: null };
    notify();
    await refreshDeveloper();
  } catch (error) {
    sharedState = {
      ...sharedState,
      busyAction: null,
      error: error instanceof Error ? error.message : "Developer action failed",
    };
    notify();
  }
}

export function useDeveloper() {
  const [state, setState] = useState(sharedState);

  useEffect(() => {
    subscribers.add(setState);
    void refreshDeveloper();
    return () => {
      subscribers.delete(setState);
    };
  }, []);

  return {
    ...state,
    refresh: refreshDeveloper,
    createKey: () => withDeveloperAction("create-key", () => createDevKey()),
    testWebhook: (webhookId?: string) => withDeveloperAction("test-webhook", () => testDevWebhook(webhookId)),
  };
}

