"use client";

import { memo } from "react";

import { Badge, Card } from "@/components/ui";
import { useDemoStore } from "@/store/demo-store";

export const ScenarioIndicator = memo(function ScenarioIndicator() {
  const isDemoMode = useDemoStore((state) => state.isDemoMode);
  const currentPhase = useDemoStore((state) => state.currentPhase);
  const currentStepLabel = useDemoStore((state) => state.currentStepLabel);
  const activeActors = useDemoStore((state) => state.activeActors);
  const simulationStatus = useDemoStore((state) => state.simulationStatus);

  if (!isDemoMode || !currentPhase) {
    return null;
  }

  return (
    <Card className="min-w-[18rem] border-[color-mix(in_srgb,var(--color-border)_86%,transparent)] bg-[color-mix(in_srgb,var(--color-surface)_94%,transparent)] px-4 py-3 backdrop-blur-md">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted">Active Phase</p>
          <p className="text-sm font-semibold text-foreground">{currentPhase}</p>
          <p className="text-xs leading-5 text-muted">{currentStepLabel ?? "Simulation orchestration active."}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge tone={simulationStatus === "running" ? "primary" : "warning"}>
            {simulationStatus === "running" ? "Running" : simulationStatus}
          </Badge>
          <span className="text-xs text-muted">{activeActors.length} responders active</span>
        </div>
      </div>
    </Card>
  );
});
