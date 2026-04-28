import { apiClient } from "@/lib/core/api-client";
import type {
  Benchmark,
  CategoryLive,
  CategoryMutationResponse,
  CategoryScore,
  Competitor,
  Killshot,
  LeaderboardRow,
  MarketShare,
  Narrative,
  TrustData,
  WinLoss,
} from "@/lib/category-domination/types";

type CategoryEnvelope<T> = {
  generated_at: string;
  data: T;
};

export function getCategoryLive() {
  return apiClient.requestData<CategoryLive>("/category/live", { cacheTtlMs: 10_000, priority: "normal" });
}

export function getCategoryMarketShare() {
  return apiClient.requestData<CategoryEnvelope<MarketShare>>("/category/market-share", {
    cacheTtlMs: 18_000,
    priority: "normal",
  });
}

export function getCategoryCompetitors() {
  return apiClient.requestData<CategoryEnvelope<{ competitors: Competitor[]; killshots: Killshot[]; win_loss: WinLoss }>>(
    "/category/competitors",
    { cacheTtlMs: 18_000, priority: "normal" },
  );
}

export function getCategoryLeaderboard() {
  return apiClient.requestData<CategoryEnvelope<{ leaderboard: LeaderboardRow[]; sentra_rank: number }>>(
    "/category/leaderboard",
    { cacheTtlMs: 18_000, priority: "low" },
  );
}

export function getCategoryTrust() {
  return apiClient.requestData<CategoryEnvelope<TrustData>>("/category/trust", {
    cacheTtlMs: 18_000,
    priority: "normal",
  });
}

export function getCategoryBenchmark() {
  return apiClient.requestData<CategoryEnvelope<Benchmark>>("/category/benchmark", {
    cacheTtlMs: 18_000,
    priority: "normal",
  });
}

export function getCategoryNarrative() {
  return apiClient.requestData<CategoryEnvelope<Narrative>>("/category/narrative", {
    cacheTtlMs: 18_000,
    priority: "low",
  });
}

export function getCategoryScore() {
  return apiClient.requestData<CategoryEnvelope<CategoryScore>>("/category/score", {
    cacheTtlMs: 12_000,
    priority: "normal",
  });
}

export function runCategoryPrCampaign() {
  return apiClient.requestData<CategoryMutationResponse>("/category/run-pr-campaign", {
    body: { campaign: "category_benchmark_launch" },
    method: "POST",
    priority: "high",
  });
}

export function runCategoryCompetitiveAnalysis() {
  return apiClient.requestData<CategoryMutationResponse>("/category/run-competitive-analysis", {
    body: { scenario: "enterprise_replacement_motion" },
    method: "POST",
    priority: "high",
  });
}

export function generateCategoryBoardStory() {
  return apiClient.requestData<CategoryMutationResponse>("/category/generate-board-story", {
    body: { scenario: "market_leader_board_pack" },
    method: "POST",
    priority: "high",
  });
}

export function runCategoryMarketSimulation() {
  return apiClient.requestData<CategoryMutationResponse>("/category/run-market-simulation", {
    body: { scenario: "category_leader_acceleration" },
    method: "POST",
    priority: "high",
  });
}

