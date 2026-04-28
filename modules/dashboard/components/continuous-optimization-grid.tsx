"use client";

import { useAutonomy } from "@/lib/autonomy/use-autonomy";
import {
  AutonomyPanelChrome,
  AutonomyPill,
  autoBar,
  autoNumber,
} from "@/modules/dashboard/components/autonomy-panel-primitives";

export function ContinuousOptimizationGrid() {
  const { live } = useAutonomy();
  const metrics = live?.metrics;
  const optimizations = [
    ["Decision quality", autoNumber(metrics?.decision_supremacy, 94), "dominant"],
    ["Trust calibration", autoNumber(metrics?.trust_score, 88), "trusted"],
    ["Prediction accuracy", autoNumber(metrics?.prediction_accuracy_percent, 89), "learning"],
    ["Self-heal success", autoNumber(metrics?.self_heal_success_percent, 96), "resilient"],
    ["Human confidence", autoNumber(metrics?.human_confidence, 91), "validated"],
    ["Board confidence", autoNumber(metrics?.board_confidence, 86), "board-ready"],
  ] as const;

  return (
    <AutonomyPanelChrome title="Continuous Optimization Grid" eyebrow="Always-On Intelligence Tuning">
      <div className="grid gap-3 md:grid-cols-3">
        {optimizations.map(([label, value, state]) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-white">{label}</span>
              <AutonomyPill>{state}</AutonomyPill>
            </div>
            <div className="mt-4 h-2 rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-white/80 to-amber-200" style={{ width: autoBar(value) }} />
            </div>
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-cyan-100/70">{value}% optimized</p>
          </div>
        ))}
      </div>
    </AutonomyPanelChrome>
  );
}

