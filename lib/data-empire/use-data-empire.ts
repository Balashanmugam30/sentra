"use client";

import { useEffect, useState } from "react";

import {
  getDataEmpireForecast,
  getDataEmpireGraph,
  getDataEmpireInsights,
  getDataEmpireLive,
  getDataEmpireMoat,
  getDataEmpirePrivacy,
  getDataEmpireSignals,
  getDataEmpireValue,
  launchDataEmpireProduct,
  runDataEmpireAnomalyScan,
  runDataEmpireForecast,
  runDataEmpireIngestion,
  runDataEmpireLearning,
} from "@/lib/data-empire/api";
import type {
  Anomaly,
  DataEmpireLive,
  DataProduct,
  DataSource,
  DataValue,
  EntityGraph,
  ForecastPoint,
  KnowledgeCompounding,
  Moat,
  PipelineHealth,
  PredictiveDataset,
  PrivacyPosture,
  ProprietaryInsight,
  SignalScore,
  SignalSummary,
} from "@/lib/data-empire/types";

type DataEmpireState = {
  anomalies: Anomaly[];
  busyAction: string | null;
  datasets: PredictiveDataset[];
  error: string | null;
  forecasts: ForecastPoint[];
  graph: EntityGraph | null;
  insights: ProprietaryInsight[];
  knowledge: KnowledgeCompounding | null;
  live: DataEmpireLive | null;
  loading: boolean;
  moat: Moat | null;
  pipelines: PipelineHealth[];
  privacy: PrivacyPosture | null;
  products: DataProduct[];
  signals: SignalScore[];
  sources: DataSource[];
  summary: SignalSummary | null;
  value: DataValue | null;
};

const initialState: DataEmpireState = {
  anomalies: [],
  busyAction: null,
  datasets: [],
  error: null,
  forecasts: [],
  graph: null,
  insights: [],
  knowledge: null,
  live: null,
  loading: true,
  moat: null,
  pipelines: [],
  privacy: null,
  products: [],
  signals: [],
  sources: [],
  summary: null,
  value: null,
};

let sharedState = initialState;
let refreshInFlight: Promise<void> | null = null;
const subscribers = new Set<(state: DataEmpireState) => void>();

function notify() {
  subscribers.forEach((subscriber) => subscriber(sharedState));
}

export async function refreshDataEmpire() {
  if (refreshInFlight) {
    return refreshInFlight;
  }
  sharedState = { ...sharedState, loading: true };
  notify();
  refreshInFlight = (async () => {
    try {
      const [live, signals, graph, insights, forecast, value, moat, privacy] = await Promise.all([
        getDataEmpireLive(),
        getDataEmpireSignals(),
        getDataEmpireGraph(),
        getDataEmpireInsights(),
        getDataEmpireForecast(),
        getDataEmpireValue(),
        getDataEmpireMoat(),
        getDataEmpirePrivacy(),
      ]);

      sharedState = {
        ...sharedState,
        anomalies: value.anomalies,
        datasets: value.datasets,
        error: null,
        forecasts: forecast.forecasts,
        graph,
        insights: insights.insights,
        knowledge: value.knowledge,
        live,
        loading: false,
        moat: moat.moat,
        pipelines: signals.pipelines,
        privacy: privacy.privacy,
        products: value.products,
        signals: signals.signals,
        sources: signals.sources,
        summary: signals.summary,
        value: value.value,
      };
    } catch (error) {
      sharedState = {
        ...sharedState,
        error: error instanceof Error ? error.message : "Data Empire intelligence is reconnecting",
        loading: false,
      };
    } finally {
      refreshInFlight = null;
      notify();
    }
  })();
  return refreshInFlight;
}

async function withDataEmpireAction(label: string, action: () => Promise<unknown>) {
  sharedState = { ...sharedState, busyAction: label, error: null };
  notify();
  try {
    await action();
    sharedState = { ...sharedState, busyAction: null };
    notify();
    await refreshDataEmpire();
  } catch (error) {
    sharedState = {
      ...sharedState,
      busyAction: null,
      error: error instanceof Error ? error.message : "Data Empire action failed",
    };
    notify();
  }
}

export function useDataEmpire() {
  const [state, setState] = useState(sharedState);

  useEffect(() => {
    subscribers.add(setState);
    void refreshDataEmpire();
    return () => {
      subscribers.delete(setState);
    };
  }, []);

  return {
    ...state,
    launchDataProduct: (productId = "risk-signals-api") =>
      withDataEmpireAction(`launch-${productId}`, () => launchDataEmpireProduct(productId)),
    refresh: refreshDataEmpire,
    runAnomalyScan: () => withDataEmpireAction("anomaly-scan", runDataEmpireAnomalyScan),
    runForecast: () => withDataEmpireAction("forecast", runDataEmpireForecast),
    runIngestion: () => withDataEmpireAction("ingestion", runDataEmpireIngestion),
    runLearning: () => withDataEmpireAction("learning", runDataEmpireLearning),
  };
}
