import { apiClient } from "@/lib/core/api-client";
import type { GovernmentLiveResponse, GovernmentMutationResponse } from "@/lib/government/types";

function getGovernmentData(path: string, cacheTtlMs = 14_000) {
  return apiClient.requestData<{ data: Record<string, unknown> }>(path, {
    priority: "normal",
    cacheTtlMs,
  });
}

export function getGovernmentLive() {
  return apiClient.requestData<GovernmentLiveResponse>("/government/live", {
    priority: "normal",
    cacheTtlMs: 8_000,
  });
}

export function getGovernmentReadiness() {
  return getGovernmentData("/government/readiness");
}

export function getGovernmentDisaster() {
  return getGovernmentData("/government/disaster");
}

export function getGovernmentDefense() {
  return getGovernmentData("/government/defense");
}

export function getGovernmentBorders() {
  return getGovernmentData("/government/borders");
}

export function getGovernmentInfrastructure() {
  return getGovernmentData("/government/infrastructure");
}

export function getGovernmentContinuity() {
  return getGovernmentData("/government/continuity");
}

export function getGovernmentWarGame() {
  return getGovernmentData("/government/wargame", 20_000);
}

export function getGovernmentCopilot() {
  return getGovernmentData("/government/copilot");
}

function postGovernmentAction(path: string, body: Record<string, unknown> = {}) {
  return apiClient.requestData<GovernmentMutationResponse>(path, {
    method: "POST",
    body,
    priority: "high",
  });
}

export function runGovernmentSimulation(scenario = "Cyclone") {
  return postGovernmentAction("/government/run-simulation", { scenario });
}

export function activateGovernmentEmergency(region = "South Region") {
  return postGovernmentAction("/government/activate-emergency", { region });
}

export function deployGovernmentUnits(agency = "Military", units = 12, region = "South Region") {
  return postGovernmentAction("/government/deploy-units", { agency, units, region });
}

export function generateGovernmentReport() {
  return postGovernmentAction("/government/generate-report");
}
