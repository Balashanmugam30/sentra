"use client";

import { useEffect, useState } from "react";

import {
  generateMonopolyBoardStrategy,
  getMonopolyAcquisitions,
  getMonopolyConquest,
  getMonopolyLive,
  getMonopolyLockin,
  getMonopolyNetwork,
  getMonopolyPartnerships,
  getMonopolyRegulatory,
  getMonopolyScore,
  launchMonopolyBundle,
  runMonopolyAcquisitionModel,
  runMonopolyExpansionSim,
} from "@/lib/monopoly-expansion/api";
import type {
  AcquisitionModel,
  AcquisitionTarget,
  BundleEngine,
  ChannelDomination,
  CustomerLockin,
  GlobalConquest,
  MarketConsolidation,
  MonopolyLive,
  MonopolyScore,
  NetworkFlywheel,
  ProcurementDefault,
  RegulatoryWatch,
  StrategicPartner,
} from "@/lib/monopoly-expansion/types";

type MonopolyState = {
  acquisitionModel: AcquisitionModel | null;
  acquisitionTargets: AcquisitionTarget[];
  bundles: BundleEngine | null;
  busyAction: string | null;
  channel: ChannelDomination | null;
  consolidation: MarketConsolidation | null;
  conquest: GlobalConquest | null;
  error: string | null;
  live: MonopolyLive | null;
  loading: boolean;
  lockin: CustomerLockin | null;
  network: NetworkFlywheel | null;
  partners: StrategicPartner[];
  procurement: ProcurementDefault | null;
  regulatory: RegulatoryWatch | null;
  score: MonopolyScore | null;
};

const initialState: MonopolyState = {
  acquisitionModel: null,
  acquisitionTargets: [],
  bundles: null,
  busyAction: null,
  channel: null,
  consolidation: null,
  conquest: null,
  error: null,
  live: null,
  loading: true,
  lockin: null,
  network: null,
  partners: [],
  procurement: null,
  regulatory: null,
  score: null,
};

let sharedState = initialState;
let refreshInFlight: Promise<void> | null = null;
const subscribers = new Set<(state: MonopolyState) => void>();

function notify() {
  subscribers.forEach((subscriber) => subscriber(sharedState));
}

export async function refreshMonopolyExpansion() {
  if (refreshInFlight) {
    return refreshInFlight;
  }
  sharedState = { ...sharedState, loading: true };
  notify();
  refreshInFlight = (async () => {
    try {
      const [live, acquisitions, partnerships, conquest, lockin, network, regulatory, score] = await Promise.all([
        getMonopolyLive(),
        getMonopolyAcquisitions(),
        getMonopolyPartnerships(),
        getMonopolyConquest(),
        getMonopolyLockin(),
        getMonopolyNetwork(),
        getMonopolyRegulatory(),
        getMonopolyScore(),
      ]);
      sharedState = {
        ...sharedState,
        acquisitionModel: acquisitions.data.model,
        acquisitionTargets: acquisitions.data.targets,
        bundles: lockin.data.bundles,
        channel: partnerships.data.channel,
        consolidation: network.data.consolidation,
        conquest: conquest.data.global,
        error: null,
        live,
        loading: false,
        lockin: lockin.data.lockin,
        network: network.data.network,
        partners: partnerships.data.partners,
        procurement: conquest.data.procurement,
        regulatory: regulatory.data,
        score: score.data,
      };
    } catch (error) {
      sharedState = {
        ...sharedState,
        error: error instanceof Error ? error.message : "Monopoly Expansion OS is reconnecting",
        loading: false,
      };
    } finally {
      refreshInFlight = null;
      notify();
    }
  })();
  return refreshInFlight;
}

async function withMonopolyAction(label: string, action: () => Promise<unknown>) {
  sharedState = { ...sharedState, busyAction: label, error: null };
  notify();
  try {
    await action();
    sharedState = { ...sharedState, busyAction: null };
    notify();
    await refreshMonopolyExpansion();
  } catch (error) {
    sharedState = {
      ...sharedState,
      busyAction: null,
      error: error instanceof Error ? error.message : "Monopoly action failed",
    };
    notify();
  }
}

export function useMonopolyExpansion() {
  const [state, setState] = useState(sharedState);

  useEffect(() => {
    subscribers.add(setState);
    void refreshMonopolyExpansion();
    return () => {
      subscribers.delete(setState);
    };
  }, []);

  return {
    ...state,
    generateBoardStrategy: () => withMonopolyAction("board-strategy", generateMonopolyBoardStrategy),
    launchBundle: () => withMonopolyAction("bundle", () => launchMonopolyBundle(state.bundles?.recommended_bundle ?? "Full Enterprise Suite")),
    refresh: refreshMonopolyExpansion,
    runAcquisitionModel: (target = "OpsVision AI") => withMonopolyAction("acquisition", () => runMonopolyAcquisitionModel(target)),
    runExpansionSimulation: () => withMonopolyAction("simulation", runMonopolyExpansionSim),
  };
}

