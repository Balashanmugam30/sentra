import { apiClient } from "@/lib/core/api-client";
import type {
  AcquisitionModel,
  AcquisitionTarget,
  BundleEngine,
  ChannelDomination,
  CustomerLockin,
  GlobalConquest,
  MarketConsolidation,
  MonopolyLive,
  MonopolyMutationResponse,
  MonopolyScore,
  NetworkFlywheel,
  ProcurementDefault,
  RegulatoryWatch,
  StrategicPartner,
} from "@/lib/monopoly-expansion/types";

type MonopolyEnvelope<T> = {
  generated_at: string;
  data: T;
};

export function getMonopolyLive() {
  return apiClient.requestData<MonopolyLive>("/monopoly/live", { cacheTtlMs: 10_000, priority: "normal" });
}

export function getMonopolyAcquisitions() {
  return apiClient.requestData<MonopolyEnvelope<{ targets: AcquisitionTarget[]; model: AcquisitionModel }>>(
    "/monopoly/acquisitions",
    { cacheTtlMs: 18_000, priority: "normal" },
  );
}

export function getMonopolyPartnerships() {
  return apiClient.requestData<MonopolyEnvelope<{ partners: StrategicPartner[]; channel: ChannelDomination }>>(
    "/monopoly/partnerships",
    { cacheTtlMs: 18_000, priority: "normal" },
  );
}

export function getMonopolyConquest() {
  return apiClient.requestData<MonopolyEnvelope<{ global: GlobalConquest; procurement: ProcurementDefault }>>(
    "/monopoly/conquest",
    { cacheTtlMs: 18_000, priority: "normal" },
  );
}

export function getMonopolyLockin() {
  return apiClient.requestData<MonopolyEnvelope<{ lockin: CustomerLockin; bundles: BundleEngine }>>(
    "/monopoly/lockin",
    { cacheTtlMs: 18_000, priority: "normal" },
  );
}

export function getMonopolyNetwork() {
  return apiClient.requestData<MonopolyEnvelope<{ network: NetworkFlywheel; consolidation: MarketConsolidation }>>(
    "/monopoly/network",
    { cacheTtlMs: 18_000, priority: "normal" },
  );
}

export function getMonopolyRegulatory() {
  return apiClient.requestData<MonopolyEnvelope<RegulatoryWatch>>("/monopoly/regulatory", {
    cacheTtlMs: 18_000,
    priority: "low",
  });
}

export function getMonopolyScore() {
  return apiClient.requestData<MonopolyEnvelope<MonopolyScore>>("/monopoly/score", {
    cacheTtlMs: 12_000,
    priority: "normal",
  });
}

export function runMonopolyAcquisitionModel(target = "OpsVision AI") {
  return apiClient.requestData<MonopolyMutationResponse>("/monopoly/run-acquisition-model", {
    body: { target },
    method: "POST",
    priority: "high",
  });
}

export function launchMonopolyBundle(bundle = "Full Enterprise Suite") {
  return apiClient.requestData<MonopolyMutationResponse>("/monopoly/launch-bundle", {
    body: { bundle },
    method: "POST",
    priority: "high",
  });
}

export function runMonopolyExpansionSim() {
  return apiClient.requestData<MonopolyMutationResponse>("/monopoly/run-expansion-sim", {
    body: { scenario: "default_global_choice" },
    method: "POST",
    priority: "high",
  });
}

export function generateMonopolyBoardStrategy() {
  return apiClient.requestData<MonopolyMutationResponse>("/monopoly/generate-board-strategy", {
    body: { scenario: "global_default_choice_strategy" },
    method: "POST",
    priority: "high",
  });
}

