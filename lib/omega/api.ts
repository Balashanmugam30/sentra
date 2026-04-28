import { apiClient } from "@/lib/core/api-client";
import type { OmegaEnvelope, OmegaLive, OmegaMutationResponse } from "@/lib/omega/types";

export function getOmegaLive() {
  return apiClient.requestData<OmegaLive>("/omega/live", { cacheTtlMs: 8_000, priority: "normal" });
}

export function getOmegaPlanetary() {
  return apiClient.requestData<OmegaEnvelope>("/omega/planetary", { cacheTtlMs: 14_000, priority: "normal" });
}

export function getOmegaThreats() {
  return apiClient.requestData<OmegaEnvelope>("/omega/threats", { cacheTtlMs: 12_000, priority: "normal" });
}

export function getOmegaClimate() {
  return apiClient.requestData<OmegaEnvelope>("/omega/climate", { cacheTtlMs: 16_000, priority: "normal" });
}

export function getOmegaPandemic() {
  return apiClient.requestData<OmegaEnvelope>("/omega/pandemic", { cacheTtlMs: 16_000, priority: "normal" });
}

export function getOmegaEconomy() {
  return apiClient.requestData<OmegaEnvelope>("/omega/economy", { cacheTtlMs: 16_000, priority: "normal" });
}

export function getOmegaLogistics() {
  return apiClient.requestData<OmegaEnvelope>("/omega/logistics", { cacheTtlMs: 16_000, priority: "normal" });
}

export function getOmegaEnergy() {
  return apiClient.requestData<OmegaEnvelope>("/omega/energy", { cacheTtlMs: 16_000, priority: "normal" });
}

export function getOmegaWater() {
  return apiClient.requestData<OmegaEnvelope>("/omega/water", { cacheTtlMs: 16_000, priority: "normal" });
}

export function getOmegaMigration() {
  return apiClient.requestData<OmegaEnvelope>("/omega/migration", { cacheTtlMs: 16_000, priority: "normal" });
}

export function getOmegaFuture() {
  return apiClient.requestData<OmegaEnvelope>("/omega/future", { cacheTtlMs: 14_000, priority: "normal" });
}

export function getOmegaCivilization() {
  return apiClient.requestData<OmegaEnvelope>("/omega/civilization", { cacheTtlMs: 14_000, priority: "normal" });
}

export function getOmegaSatellite() {
  return apiClient.requestData<OmegaEnvelope>("/omega/satellite", { cacheTtlMs: 16_000, priority: "normal" });
}

export function getOmegaAiLive() {
  return apiClient.requestData<OmegaEnvelope>("/omega/ai/live", { cacheTtlMs: 10_000, priority: "normal" });
}

export function getOmegaAiObjectives() {
  return apiClient.requestData<OmegaEnvelope>("/omega/ai/objectives", { cacheTtlMs: 14_000, priority: "normal" });
}

export function getOmegaAiMemory() {
  return apiClient.requestData<OmegaEnvelope>("/omega/ai/memory", { cacheTtlMs: 18_000, priority: "normal" });
}

export function getOmegaAiTrust() {
  return apiClient.requestData<OmegaEnvelope>("/omega/ai/trust", { cacheTtlMs: 14_000, priority: "normal" });
}

export function getOmegaAiExplain() {
  return apiClient.requestData<OmegaEnvelope>("/omega/ai/explain", { cacheTtlMs: 18_000, priority: "normal" });
}

export function getOmegaAiEvolution() {
  return apiClient.requestData<OmegaEnvelope>("/omega/ai/evolution", { cacheTtlMs: 14_000, priority: "normal" });
}

export function getOmegaAiGovernance() {
  return apiClient.requestData<OmegaEnvelope>("/omega/ai/governance", { cacheTtlMs: 14_000, priority: "normal" });
}

export function runOmegaSimulation() {
  return apiClient.requestData<OmegaMutationResponse>("/omega/run-simulation", {
    body: { scenario: "compound_planetary_shock" },
    method: "POST",
    priority: "high",
  });
}

export function runOmegaImprovementCycle() {
  return apiClient.requestData<OmegaMutationResponse>("/omega/run-improvement-cycle", {
    body: { scenario: "recursive_improvement" },
    method: "POST",
    priority: "high",
  });
}

export function runOmegaSelfHeal() {
  return apiClient.requestData<OmegaMutationResponse>("/omega/run-self-heal", {
    body: { scenario: "omega_self_heal" },
    method: "POST",
    priority: "high",
  });
}

export function setOmegaObjective(objective: string) {
  return apiClient.requestData<OmegaMutationResponse>("/omega/set-objective", {
    body: { objective, reason: "dashboard objective command" },
    method: "POST",
    priority: "high",
  });
}

export function changeOmegaMode(mode: string) {
  return apiClient.requestData<OmegaMutationResponse>("/omega/change-mode", {
    body: { mode, reason: "human-governed mode change" },
    method: "POST",
    priority: "high",
  });
}

export function runOmegaPlanetaryDemo() {
  return apiClient.requestData<OmegaMutationResponse>("/omega/run-planetary-demo", {
    body: { scenario: "omega_planetary_demo" },
    method: "POST",
    priority: "high",
  });
}

