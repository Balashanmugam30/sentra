"use client";

import { useEffect, useState } from "react";

import {
  archiveMLModel,
  getMLDatasets,
  getMLExperiments,
  getMLFeatures,
  getMLJobs,
  getMLModels,
  getMLSummary,
  promoteMLModel,
  runMLTraining,
  uploadMLDataset,
} from "@/lib/ml/api";
import { fallbackDatasets, fallbackExperiments, fallbackFeatures, fallbackJobs, fallbackModels, fallbackSummary } from "@/lib/ml/training";
import type { MLDataset, MLExperiment, MLFeature, MLJob, MLModel, MLSummary } from "@/lib/ml/types";

type MLState = {
  summary: MLSummary;
  datasets: MLDataset[];
  features: MLFeature[];
  jobs: MLJob[];
  experiments: MLExperiment[];
  models: MLModel[];
  loading: boolean;
  error: string | null;
  busyAction: string | null;
  lastAction: string | null;
};

const initialState: MLState = {
  summary: fallbackSummary,
  datasets: fallbackDatasets,
  features: fallbackFeatures,
  jobs: fallbackJobs,
  experiments: fallbackExperiments,
  models: fallbackModels,
  loading: true,
  error: null,
  busyAction: null,
  lastAction: null,
};

let sharedState = initialState;
let refreshInFlight: Promise<void> | null = null;
const subscribers = new Set<(state: MLState) => void>();

function notify() {
  subscribers.forEach((subscriber) => subscriber(sharedState));
}

export async function refreshML() {
  if (refreshInFlight) {
    return refreshInFlight;
  }

  sharedState = { ...sharedState, loading: true };
  notify();
  refreshInFlight = (async () => {
    try {
      const [summary, datasets, features, jobs, experiments, models] = await Promise.all([getMLSummary(), getMLDatasets(), getMLFeatures(), getMLJobs(), getMLExperiments(), getMLModels()]);
      sharedState = {
        ...sharedState,
        summary: summary.data,
        datasets: datasets.items,
        features: features.items,
        jobs: jobs.items,
        experiments: experiments.items,
        models: models.items,
        loading: false,
        error: null,
      };
    } catch (error) {
      sharedState = {
        ...sharedState,
        loading: false,
        error: error instanceof Error ? error.message : "ML foundation is running in resilient local mode",
      };
    } finally {
      refreshInFlight = null;
      notify();
    }
  })();
  return refreshInFlight;
}

async function withMLAction(label: string, action: () => Promise<{ message?: string }>) {
  sharedState = { ...sharedState, busyAction: label, error: null };
  notify();
  try {
    const response = await action();
    sharedState = { ...sharedState, busyAction: null, lastAction: response.message ?? "ML action complete" };
    notify();
    await refreshML();
  } catch (error) {
    sharedState = {
      ...sharedState,
      busyAction: null,
      error: error instanceof Error ? error.message : "ML action could not be completed",
    };
    notify();
  }
}

export function useML() {
  const [state, setState] = useState(sharedState);

  useEffect(() => {
    subscribers.add(setState);
    if (sharedState.loading && !refreshInFlight) {
      void refreshML();
    }
    return () => {
      subscribers.delete(setState);
    };
  }, []);

  return {
    ...state,
    refresh: refreshML,
    train: () => withMLAction("train", () => runMLTraining()),
    uploadDataset: () => withMLAction("upload", () => uploadMLDataset()),
    promoteModel: (modelId?: string) => withMLAction("promote", () => promoteMLModel(modelId)),
    archiveModel: (modelId?: string) => withMLAction("archive", () => archiveMLModel(modelId)),
  };
}
