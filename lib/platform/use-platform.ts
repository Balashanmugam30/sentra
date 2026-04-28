"use client";

import { useEffect, useState } from "react";

import {
  createPlatformApiKey,
  createPlatformApp,
  createPlatformWebhook,
  disablePlatformWebhook,
  getPlatformApiKeys,
  getPlatformApps,
  getPlatformDocs,
  getPlatformLogs,
  getPlatformRateLimits,
  getPlatformSandbox,
  getPlatformSdks,
  getPlatformSummary,
  getPlatformUsage,
  getPlatformWebhooks,
  retryPlatformWebhook,
  revokePlatformApiKey,
  revokePlatformApp,
  rotatePlatformApiKey,
  testPlatformWebhook,
  updatePlatformApp,
} from "@/lib/platform/api";
import {
  fallbackApiKeys,
  fallbackApps,
  fallbackDocs,
  fallbackLogs,
  fallbackRateLimits,
  fallbackSandbox,
  fallbackSdks,
  fallbackSummary,
  fallbackUsage,
  fallbackWebhooks,
} from "@/lib/platform/runtime";
import type { PlatformState } from "@/lib/platform/types";

const initialState: PlatformState = {
  summary: fallbackSummary,
  apiKeys: fallbackApiKeys,
  apps: fallbackApps,
  webhooks: fallbackWebhooks,
  usage: fallbackUsage,
  rateLimits: fallbackRateLimits,
  logs: fallbackLogs,
  sdks: fallbackSdks,
  docs: fallbackDocs,
  sandbox: fallbackSandbox,
  loading: true,
  error: null,
  busyAction: null,
  lastAction: null,
};

let sharedState = initialState;
let refreshInFlight: Promise<void> | null = null;
const subscribers = new Set<(state: PlatformState) => void>();

function notify() {
  subscribers.forEach((subscriber) => subscriber(sharedState));
}

export async function refreshPlatform() {
  if (refreshInFlight) {
    return refreshInFlight;
  }
  sharedState = { ...sharedState, loading: true };
  notify();
  refreshInFlight = (async () => {
    try {
      const [summary, apiKeys, apps, webhooks, usage, rateLimits, logs, sdks, docs, sandbox] = await Promise.all([
        getPlatformSummary(),
        getPlatformApiKeys(),
        getPlatformApps(),
        getPlatformWebhooks(),
        getPlatformUsage(),
        getPlatformRateLimits(),
        getPlatformLogs(),
        getPlatformSdks(),
        getPlatformDocs(),
        getPlatformSandbox(),
      ]);
      sharedState = {
        ...sharedState,
        summary: summary.data,
        apiKeys: apiKeys.data,
        apps: apps.data,
        webhooks: webhooks.data,
        usage: usage.data,
        rateLimits: rateLimits.data,
        logs: logs.data,
        sdks: sdks.data,
        docs: docs.data,
        sandbox: sandbox.data,
        loading: false,
        error: null,
      };
    } catch (error) {
      sharedState = {
        ...sharedState,
        loading: false,
        error: error instanceof Error ? error.message : "Developer platform is running in resilient local mode",
      };
    } finally {
      refreshInFlight = null;
      notify();
    }
  })();
  return refreshInFlight;
}

async function withPlatformAction(label: string, action: () => Promise<{ message?: string }>) {
  sharedState = { ...sharedState, busyAction: label, error: null };
  notify();
  try {
    const response = await action();
    sharedState = { ...sharedState, busyAction: null, lastAction: response.message ?? "Platform action complete" };
    notify();
    await refreshPlatform();
  } catch (error) {
    sharedState = {
      ...sharedState,
      busyAction: null,
      error: error instanceof Error ? error.message : "Platform action could not be completed",
    };
    notify();
  }
}

export function usePlatform() {
  const [state, setState] = useState(sharedState);

  useEffect(() => {
    subscribers.add(setState);
    if (sharedState.loading && !refreshInFlight) {
      void refreshPlatform();
    }
    return () => {
      subscribers.delete(setState);
    };
  }, []);

  return {
    ...state,
    refresh: refreshPlatform,
    createKey: (name?: string, environment?: string, scopes?: string[]) =>
      withPlatformAction("create-key", () => createPlatformApiKey(name, environment, scopes)),
    revokeKey: (keyId: string) => withPlatformAction("revoke-key", () => revokePlatformApiKey(keyId)),
    rotateKey: (keyId: string) => withPlatformAction("rotate-key", () => rotatePlatformApiKey(keyId)),
    createApp: (name?: string) => withPlatformAction("create-app", () => createPlatformApp(name)),
    updateApp: (appId: string, scopes?: string[]) => withPlatformAction("update-app", () => updatePlatformApp(appId, scopes)),
    revokeApp: (appId: string) => withPlatformAction("revoke-app", () => revokePlatformApp(appId)),
    createWebhook: (name?: string) => withPlatformAction("create-webhook", () => createPlatformWebhook(name)),
    testWebhook: (webhookId: string) => withPlatformAction("test-webhook", () => testPlatformWebhook(webhookId)),
    retryWebhook: (webhookId: string) => withPlatformAction("retry-webhook", () => retryPlatformWebhook(webhookId)),
    disableWebhook: (webhookId: string) => withPlatformAction("disable-webhook", () => disablePlatformWebhook(webhookId)),
  };
}

