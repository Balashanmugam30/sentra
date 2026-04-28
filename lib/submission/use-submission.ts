"use client";

import { useEffect, useState } from "react";

import {
  exportSubmissionArtifact,
  generateSubmissionPack,
  getSubmissionArchitecture,
  getSubmissionDeck,
  getSubmissionDemoScript,
  getSubmissionDocs,
  getSubmissionImpact,
  getSubmissionJudges,
  getSubmissionScore,
  getSubmissionSummary,
  getSubmissionTeam,
} from "@/lib/submission/api";
import {
  fallbackDemoScripts,
  fallbackSubmissionArchitecture,
  fallbackSubmissionDeck,
  fallbackSubmissionDocs,
  fallbackSubmissionImpact,
  fallbackSubmissionJudges,
  fallbackSubmissionScore,
  fallbackSubmissionSummary,
  fallbackTeamStory,
} from "@/lib/submission/runtime";
import type {
  SubmissionArchitecture,
  SubmissionDeck,
  SubmissionDemoScriptState,
  SubmissionDocs,
  SubmissionImpact,
  SubmissionJudges,
  SubmissionScore,
  SubmissionSummary,
  SubmissionTeamState,
} from "@/lib/submission/types";

type SubmissionState = {
  summary: SubmissionSummary;
  deck: SubmissionDeck;
  docs: SubmissionDocs;
  judges: SubmissionJudges;
  impact: SubmissionImpact;
  score: SubmissionScore;
  architecture: SubmissionArchitecture;
  demoScripts: SubmissionDemoScriptState;
  team: SubmissionTeamState;
  loading: boolean;
  error: string | null;
  busyAction: string | null;
  lastAction: string | null;
};

const initialState: SubmissionState = {
  summary: fallbackSubmissionSummary,
  deck: fallbackSubmissionDeck,
  docs: fallbackSubmissionDocs,
  judges: fallbackSubmissionJudges,
  impact: fallbackSubmissionImpact,
  score: fallbackSubmissionScore,
  architecture: fallbackSubmissionArchitecture,
  demoScripts: fallbackDemoScripts,
  team: fallbackTeamStory,
  loading: true,
  error: null,
  busyAction: null,
  lastAction: null,
};

let sharedState = initialState;
let refreshInFlight: Promise<void> | null = null;
const subscribers = new Set<(state: SubmissionState) => void>();

function notify() {
  subscribers.forEach((subscriber) => subscriber(sharedState));
}

export async function refreshSubmission() {
  if (refreshInFlight) {
    return refreshInFlight;
  }
  sharedState = { ...sharedState, loading: true };
  notify();
  refreshInFlight = (async () => {
    try {
      const [summary, deck, docs, judges, impact, score, architecture, demoScripts, team] = await Promise.all([
        getSubmissionSummary(),
        getSubmissionDeck(),
        getSubmissionDocs(),
        getSubmissionJudges(),
        getSubmissionImpact(),
        getSubmissionScore(),
        getSubmissionArchitecture(),
        getSubmissionDemoScript(),
        getSubmissionTeam(),
      ]);
      sharedState = {
        ...sharedState,
        summary: summary.data,
        deck: deck.data,
        docs: docs.data,
        judges: judges.data,
        impact: impact.data,
        score: score.data,
        architecture: architecture.data,
        demoScripts: demoScripts.data,
        team: team.data,
        loading: false,
        error: null,
      };
    } catch (error) {
      sharedState = {
        ...sharedState,
        loading: false,
        error: error instanceof Error ? error.message : "Submission engine is running in deterministic fallback mode",
      };
    } finally {
      refreshInFlight = null;
      notify();
    }
  })();
  return refreshInFlight;
}

async function withSubmissionAction(label: string, action: () => Promise<{ message?: string }>) {
  sharedState = { ...sharedState, busyAction: label, error: null };
  notify();
  try {
    const response = await action();
    sharedState = { ...sharedState, busyAction: null, lastAction: response.message ?? "Submission action complete" };
    notify();
    await refreshSubmission();
  } catch (error) {
    sharedState = {
      ...sharedState,
      busyAction: null,
      error: error instanceof Error ? error.message : "Submission action could not be completed",
    };
    notify();
  }
}

export function useSubmission() {
  const [state, setState] = useState(sharedState);

  useEffect(() => {
    subscribers.add(setState);
    if (sharedState.loading && !refreshInFlight) {
      void refreshSubmission();
    }
    return () => {
      subscribers.delete(setState);
    };
  }, []);

  return {
    ...state,
    refresh: refreshSubmission,
    generatePack: (mode?: string, artifact?: string) => withSubmissionAction("generate", () => generateSubmissionPack(mode, artifact)),
    exportArtifact: (format?: string, artifact?: string) => withSubmissionAction("export", () => exportSubmissionArtifact(format, artifact)),
  };
}
