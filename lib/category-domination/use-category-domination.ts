"use client";

import { useEffect, useState } from "react";

import {
  generateCategoryBoardStory,
  getCategoryBenchmark,
  getCategoryCompetitors,
  getCategoryLeaderboard,
  getCategoryLive,
  getCategoryMarketShare,
  getCategoryNarrative,
  getCategoryScore,
  getCategoryTrust,
  runCategoryCompetitiveAnalysis,
  runCategoryMarketSimulation,
  runCategoryPrCampaign,
} from "@/lib/category-domination/api";
import type {
  Benchmark,
  CategoryLive,
  CategoryScore,
  Competitor,
  Killshot,
  LeaderboardRow,
  MarketShare,
  Narrative,
  TrustData,
  WinLoss,
} from "@/lib/category-domination/types";

type CategoryState = {
  benchmark: Benchmark | null;
  busyAction: string | null;
  competitors: Competitor[];
  error: string | null;
  killshots: Killshot[];
  leaderboard: LeaderboardRow[];
  live: CategoryLive | null;
  loading: boolean;
  marketShare: MarketShare | null;
  narrative: Narrative | null;
  score: CategoryScore | null;
  sentraRank: number;
  trust: TrustData | null;
  winLoss: WinLoss | null;
};

const initialState: CategoryState = {
  benchmark: null,
  busyAction: null,
  competitors: [],
  error: null,
  killshots: [],
  leaderboard: [],
  live: null,
  loading: true,
  marketShare: null,
  narrative: null,
  score: null,
  sentraRank: 1,
  trust: null,
  winLoss: null,
};

let sharedState = initialState;
let refreshInFlight: Promise<void> | null = null;
const subscribers = new Set<(state: CategoryState) => void>();

function notify() {
  subscribers.forEach((subscriber) => subscriber(sharedState));
}

export async function refreshCategoryDomination() {
  if (refreshInFlight) {
    return refreshInFlight;
  }
  sharedState = { ...sharedState, loading: true };
  notify();
  refreshInFlight = (async () => {
    try {
      const [live, marketShare, competitors, leaderboard, trust, benchmark, narrative, score] = await Promise.all([
        getCategoryLive(),
        getCategoryMarketShare(),
        getCategoryCompetitors(),
        getCategoryLeaderboard(),
        getCategoryTrust(),
        getCategoryBenchmark(),
        getCategoryNarrative(),
        getCategoryScore(),
      ]);

      sharedState = {
        ...sharedState,
        benchmark: benchmark.data,
        competitors: competitors.data.competitors,
        error: null,
        killshots: competitors.data.killshots,
        leaderboard: leaderboard.data.leaderboard,
        live,
        loading: false,
        marketShare: marketShare.data,
        narrative: narrative.data,
        score: score.data,
        sentraRank: leaderboard.data.sentra_rank,
        trust: trust.data,
        winLoss: competitors.data.win_loss,
      };
    } catch (error) {
      sharedState = {
        ...sharedState,
        error: error instanceof Error ? error.message : "Category Domination OS is reconnecting",
        loading: false,
      };
    } finally {
      refreshInFlight = null;
      notify();
    }
  })();
  return refreshInFlight;
}

async function withCategoryAction(label: string, action: () => Promise<unknown>) {
  sharedState = { ...sharedState, busyAction: label, error: null };
  notify();
  try {
    await action();
    sharedState = { ...sharedState, busyAction: null };
    notify();
    await refreshCategoryDomination();
  } catch (error) {
    sharedState = {
      ...sharedState,
      busyAction: null,
      error: error instanceof Error ? error.message : "Category action failed",
    };
    notify();
  }
}

export function useCategoryDomination() {
  const [state, setState] = useState(sharedState);

  useEffect(() => {
    subscribers.add(setState);
    void refreshCategoryDomination();
    return () => {
      subscribers.delete(setState);
    };
  }, []);

  return {
    ...state,
    generateBoardStory: () => withCategoryAction("board-story", generateCategoryBoardStory),
    refresh: refreshCategoryDomination,
    runCompetitiveAnalysis: () => withCategoryAction("competitive-analysis", runCategoryCompetitiveAnalysis),
    runMarketSimulation: () => withCategoryAction("market-simulation", runCategoryMarketSimulation),
    runPrCampaign: () => withCategoryAction("pr-campaign", runCategoryPrCampaign),
  };
}

