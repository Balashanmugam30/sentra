"use client";

import { useEffect, useState } from "react";

import { getPolishState, type PolishState } from "@/lib/polish/api";
import { designSystemModules } from "@/lib/polish/runtime";

const fallbackPolish: PolishState = {
  global_polish_score: 94,
  design_system: designSystemModules,
  performance_posture: ["request dedupe", "lazy route chunks", "suspense-ready pages", "fallback hydration", "polling discipline"],
  polish_areas: [
    { area_id: "POL-VISUAL", name: "Visual language", score: 96, items: ["glass command cards", "animated gradients", "premium shadows", "severity badges"] },
    { area_id: "POL-UX", name: "Operator UX", score: 94, items: ["loading skeletons", "empty states", "sticky actions", "keyboard shortcuts"] },
    { area_id: "POL-PERF", name: "Performance posture", score: 91, items: ["request dedupe", "route chunking", "polling discipline"] },
    { area_id: "POL-EXEC", name: "Executive mode", score: 95, items: ["board summaries", "presenter mode", "exports"] },
  ],
};

export function usePolish() {
  const [state, setState] = useState<{ data: PolishState; loading: boolean; error: string | null }>({ data: fallbackPolish, loading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    getPolishState()
      .then((response) => {
        if (!cancelled) {
          setState({ data: response.data, loading: false, error: null });
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setState({ data: fallbackPolish, loading: false, error: error instanceof Error ? error.message : "Polish data fallback active" });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

