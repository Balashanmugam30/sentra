"use client";

import { useCallback, useEffect, useState } from "react";

import {
  compareExecutiveScenarios,
  getScenarioPresets,
} from "@/lib/analytics/scenario-lab";
import type {
  AnalyticsScenarioLabResponse,
  ScenarioPresetItem,
} from "@/lib/analytics/types";

type UseScenarioLabResult = {
  presets: ScenarioPresetItem[];
  result: AnalyticsScenarioLabResponse | null;
  optionA: string;
  optionB: string;
  loading: boolean;
  comparing: boolean;
  error: string | null;
  setOptionA: (value: string) => void;
  setOptionB: (value: string) => void;
  compare: () => Promise<void>;
};

export function useScenarioLab(): UseScenarioLabResult {
  const [presets, setPresets] = useState<ScenarioPresetItem[]>([]);
  const [result, setResult] = useState<AnalyticsScenarioLabResponse | null>(null);
  const [optionA, setOptionA] = useState("evacuate_now");
  const [optionB, setOptionB] = useState("delay_10");
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const compare = useCallback(async () => {
    try {
      setComparing(true);
      const comparison = await compareExecutiveScenarios({
        option_a: optionA,
        option_b: optionB,
      });
      setResult(comparison);
      setError(null);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to compare executive scenarios",
      );
    } finally {
      setComparing(false);
    }
  }, [optionA, optionB]);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        setLoading(true);
        const presetList = await getScenarioPresets();
        if (!isMounted) {
          return;
        }
        setPresets(presetList);
        setError(null);
      } catch (loadError) {
        if (!isMounted) {
          return;
        }
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load scenario presets",
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!loading && presets.length > 0 && result === null) {
      void compare();
    }
  }, [compare, loading, presets.length, result]);

  return {
    presets,
    result,
    optionA,
    optionB,
    loading,
    comparing,
    error,
    setOptionA,
    setOptionB,
    compare,
  };
}
