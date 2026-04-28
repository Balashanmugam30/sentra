"use client";

import { useEffect, useState } from "react";

import { createDeveloperKey, getDevelopersSummary } from "@/lib/developers/api";
import { fallbackDevelopersSummary } from "@/lib/developers/runtime";
import type { DevelopersSummary } from "@/lib/developers/types";

type DevelopersState = {
  summary: DevelopersSummary;
  loading: boolean;
  error: string | null;
  busyAction: string | null;
  lastAction: string | null;
};

let sharedState: DevelopersState = {
  summary: fallbackDevelopersSummary,
  loading: true,
  error: null,
  busyAction: null,
  lastAction: null,
};

let refreshInFlight: Promise<void> | null = null;
const subscribers = new Set<(state: DevelopersState) => void>();

function notify() {
  subscribers.forEach((subscriber) => subscriber(sharedState));
}

export async function refreshDevelopers() {
  if (refreshInFlight) {
    return refreshInFlight;
  }
  sharedState = { ...sharedState, loading: true };
  notify();
  refreshInFlight = (async () => {
    try {
      const response = await getDevelopersSummary();
      sharedState = { ...sharedState, summary: response.data, loading: false, error: null };
    } catch (error) {
      sharedState = {
        ...sharedState,
        loading: false,
        error: error instanceof Error ? error.message : "Developer API platform is running in local fallback mode",
      };
    } finally {
      refreshInFlight = null;
      notify();
    }
  })();
  return refreshInFlight;
}

export function useDevelopers() {
  const [state, setState] = useState(sharedState);

  useEffect(() => {
    subscribers.add(setState);
    if (sharedState.loading && !refreshInFlight) {
      void refreshDevelopers();
    }
    return () => {
      subscribers.delete(setState);
    };
  }, []);

  return {
    ...state,
    refresh: refreshDevelopers,
    createKey: async () => {
      sharedState = { ...sharedState, busyAction: "create-key", error: null };
      notify();
      try {
        const response = await createDeveloperKey();
        sharedState = { ...sharedState, busyAction: null, lastAction: response.message };
        notify();
        await refreshDevelopers();
      } catch (error) {
        sharedState = {
          ...sharedState,
          busyAction: null,
          error: error instanceof Error ? error.message : "Developer key could not be created",
        };
        notify();
      }
    },
  };
}
