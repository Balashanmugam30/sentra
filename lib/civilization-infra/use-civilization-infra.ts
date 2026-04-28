"use client";

import { useEffect, useState } from "react";

import {
  generateCivilizationNationalBrief,
  getCivilizationCities,
  getCivilizationDisasters,
  getCivilizationGrid,
  getCivilizationHealthcare,
  getCivilizationLive,
  getCivilizationScore,
  getCivilizationTransport,
  getCivilizationUtilities,
  runCivilizationContinuitySim,
  runCivilizationDisasterModel,
} from "@/lib/civilization-infra/api";
import type {
  CivilizationLive,
  CivilizationScore,
  ContinuityBackbone,
  DisasterPrediction,
  EducationGrid,
  FoodSecurity,
  HealthcareNetwork,
  MegaCityOps,
  NationalGrid,
  TransportCommand,
  UtilityResilience,
  WaterCommand,
} from "@/lib/civilization-infra/types";

type CivilizationState = {
  busyAction: string | null;
  cities: MegaCityOps | null;
  continuity: ContinuityBackbone | null;
  disasters: DisasterPrediction | null;
  education: EducationGrid | null;
  error: string | null;
  food: FoodSecurity | null;
  grid: NationalGrid | null;
  healthcare: HealthcareNetwork | null;
  live: CivilizationLive | null;
  loading: boolean;
  score: CivilizationScore | null;
  transport: TransportCommand | null;
  utilities: UtilityResilience | null;
  water: WaterCommand | null;
};

const initialState: CivilizationState = {
  busyAction: null,
  cities: null,
  continuity: null,
  disasters: null,
  education: null,
  error: null,
  food: null,
  grid: null,
  healthcare: null,
  live: null,
  loading: true,
  score: null,
  transport: null,
  utilities: null,
  water: null,
};

let sharedState = initialState;
let refreshInFlight: Promise<void> | null = null;
const subscribers = new Set<(state: CivilizationState) => void>();

function notify() {
  subscribers.forEach((subscriber) => subscriber(sharedState));
}

export async function refreshCivilizationInfra() {
  if (refreshInFlight) {
    return refreshInFlight;
  }
  sharedState = { ...sharedState, loading: true };
  notify();
  refreshInFlight = (async () => {
    try {
      const [live, grid, cities, utilities, transport, healthcare, disasters, score] = await Promise.all([
        getCivilizationLive(),
        getCivilizationGrid(),
        getCivilizationCities(),
        getCivilizationUtilities(),
        getCivilizationTransport(),
        getCivilizationHealthcare(),
        getCivilizationDisasters(),
        getCivilizationScore(),
      ]);
      sharedState = {
        ...sharedState,
        cities: cities.data.cities,
        continuity: grid.data.continuity,
        disasters: disasters.data,
        education: cities.data.education,
        error: null,
        food: utilities.data.food,
        grid: grid.data.grid,
        healthcare: healthcare.data,
        live,
        loading: false,
        score: score.data,
        transport: transport.data,
        utilities: utilities.data.utilities,
        water: utilities.data.water,
      };
    } catch (error) {
      sharedState = {
        ...sharedState,
        error: error instanceof Error ? error.message : "Civilization Infrastructure OS is reconnecting",
        loading: false,
      };
    } finally {
      refreshInFlight = null;
      notify();
    }
  })();
  return refreshInFlight;
}

async function withCivilizationAction(label: string, action: () => Promise<unknown>) {
  sharedState = { ...sharedState, busyAction: label, error: null };
  notify();
  try {
    await action();
    sharedState = { ...sharedState, busyAction: null };
    notify();
    await refreshCivilizationInfra();
  } catch (error) {
    sharedState = {
      ...sharedState,
      busyAction: null,
      error: error instanceof Error ? error.message : "Civilization action failed",
    };
    notify();
  }
}

export function useCivilizationInfra() {
  const [state, setState] = useState(sharedState);

  useEffect(() => {
    subscribers.add(setState);
    void refreshCivilizationInfra();
    return () => {
      subscribers.delete(setState);
    };
  }, []);

  return {
    ...state,
    generateNationalBrief: () => withCivilizationAction("national-brief", generateCivilizationNationalBrief),
    refresh: refreshCivilizationInfra,
    runContinuitySimulation: () => withCivilizationAction("continuity-sim", runCivilizationContinuitySim),
    runDisasterModel: () => withCivilizationAction("disaster-model", runCivilizationDisasterModel),
  };
}

