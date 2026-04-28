import { apiClient } from "@/lib/core/api-client";
import type { WorldDataResponse, WorldLiveResponse, WorldMutationResponse } from "@/lib/world/types";

function getWorldData(path: string, cacheTtlMs = 16_000) {
  return apiClient.requestData<WorldDataResponse>(path, {
    priority: "low",
    cacheTtlMs,
  });
}

export function getWorldLive() {
  return apiClient.requestData<WorldLiveResponse>("/world/live", {
    priority: "normal",
    cacheTtlMs: 8_000,
  });
}

export function getWorldThreats() {
  return getWorldData("/world/threats", 12_000);
}

export function getWorldCountries() {
  return getWorldData("/world/countries", 30_000);
}

export function getWorldEconomy() {
  return getWorldData("/world/economy", 16_000);
}

export function getWorldSupplyChain() {
  return getWorldData("/world/supply-chain", 16_000);
}

export function getWorldClimate() {
  return getWorldData("/world/climate", 18_000);
}

export function getWorldPandemic() {
  return getWorldData("/world/pandemic", 18_000);
}

export function getWorldSpace() {
  return getWorldData("/world/space", 20_000);
}

export function getWorldDiplomacy() {
  return getWorldData("/world/diplomacy", 18_000);
}

export function getWorldContinuity() {
  return getWorldData("/world/continuity", 16_000);
}

export function getWorldSupremacy() {
  return getWorldData("/world/supremacy", 16_000);
}

function postWorldAction(path: string, body: Record<string, unknown> = {}) {
  return apiClient.requestData<WorldMutationResponse>(path, {
    method: "POST",
    body,
    priority: "high",
  });
}

export function runWorldGlobalSimulation(scenario = "multi-vector civilization shock") {
  return postWorldAction("/world/run-global-simulation", { scenario });
}

export function runWorldDemo() {
  return postWorldAction("/world/run-demo");
}

export function resetWorldGrid() {
  return postWorldAction("/world/reset");
}

