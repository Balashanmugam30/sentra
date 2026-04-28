"use client";

import { useState } from "react";

import { postScenarioSimulation } from "@/lib/simulation/scenario";
import type { ScenarioRequest, ScenarioResponse } from "@/lib/simulation/types";

type UseScenarioResult = {
  data: ScenarioResponse | null;
  loading: boolean;
  error: string | null;
  simulate: (payload: ScenarioRequest) => Promise<void>;
};

export function useScenario(): UseScenarioResult {
  const [data, setData] = useState<ScenarioResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const simulate = async (payload: ScenarioRequest) => {
    try {
      setLoading(true);
      const nextData = await postScenarioSimulation(payload);
      setData(nextData);
      setError(null);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to simulate scenario",
      );
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, simulate };
}
