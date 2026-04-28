"use client";

import { useEffect, useState } from "react";

import { getDataHubGraph, getDataHubPipelines, getDataHubSummary, runDataPipeline } from "@/lib/data/api";
import { fallbackDataGraph, fallbackDataPipelines, fallbackDataSummary } from "@/lib/data/runtime";
import type { DataHubGraph, DataHubPipelines, DataHubSummary } from "@/lib/data/types";

type DataHubState = {
  summary: DataHubSummary;
  pipelines: DataHubPipelines;
  graph: DataHubGraph;
  loading: boolean;
  error: string | null;
  busyAction: string | null;
  lastAction: string | null;
};

const initialState: DataHubState = {
  summary: fallbackDataSummary,
  pipelines: fallbackDataPipelines,
  graph: fallbackDataGraph,
  loading: true,
  error: null,
  busyAction: null,
  lastAction: null,
};

let sharedState = initialState;
let refreshInFlight: Promise<void> | null = null;
const subscribers = new Set<(state: DataHubState) => void>();

function notify() {
  subscribers.forEach((subscriber) => subscriber(sharedState));
}

export async function refreshDataHub() {
  if (refreshInFlight) {
    return refreshInFlight;
  }
  sharedState = { ...sharedState, loading: true };
  notify();
  refreshInFlight = (async () => {
    try {
      const [summary, pipelines, graph] = await Promise.all([getDataHubSummary(), getDataHubPipelines(), getDataHubGraph()]);
      sharedState = {
        ...sharedState,
        summary: summary.data,
        pipelines: pipelines.data,
        graph: graph.data,
        loading: false,
        error: null,
      };
    } catch (error) {
      sharedState = {
        ...sharedState,
        loading: false,
        error: error instanceof Error ? error.message : "Data platform is running in resilient local mode",
      };
    } finally {
      refreshInFlight = null;
      notify();
    }
  })();
  return refreshInFlight;
}

async function withDataAction(label: string, action: () => Promise<{ message?: string }>) {
  sharedState = { ...sharedState, busyAction: label, error: null };
  notify();
  try {
    const response = await action();
    sharedState = { ...sharedState, busyAction: null, lastAction: response.message ?? "Data action complete" };
    notify();
    await refreshDataHub();
  } catch (error) {
    sharedState = {
      ...sharedState,
      busyAction: null,
      error: error instanceof Error ? error.message : "Data action could not be completed",
    };
    notify();
  }
}

export function useDataHub() {
  const [state, setState] = useState(sharedState);

  useEffect(() => {
    subscribers.add(setState);
    if (sharedState.loading && !refreshInFlight) {
      void refreshDataHub();
    }
    return () => {
      subscribers.delete(setState);
    };
  }, []);

  return {
    ...state,
    refresh: refreshDataHub,
    runPipeline: (pipelineId?: string) => withDataAction("run-pipeline", () => runDataPipeline(pipelineId)),
  };
}
