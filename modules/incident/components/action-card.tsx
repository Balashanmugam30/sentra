"use client";

import { memo } from "react";

import { Card } from "@/components/ui";
import { useActiveIncident } from "@/hooks/use-active-incident";
import { useEvacuationState } from "@/hooks/use-evacuation-state";
import { useUiStore } from "@/store/ui-store";

const routeStatusLabels = {
  clear: "Routes clear",
  watch: "Routes under watch",
  constrained: "Movement constrained",
  rerouting: "Routes recalibrating",
} as const;

export const ActionCard = memo(function ActionCard() {
  const activeIncident = useActiveIncident();
  const evacuationState = useEvacuationState();
  const feedbackMessage = useUiStore((state) => state.feedbackMessage);

  return (
    <Card className="w-full p-5">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">Incident Status</p>
            <h2 className="mt-2 text-lg font-semibold text-foreground">
              {evacuationState
                ? `${evacuationState.progressPercent}% evacuation progress`
                : "No active evacuation sequence"}
            </h2>
          </div>
          <div className="rounded-full bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] px-3 py-1 text-xs font-medium text-[var(--color-primary)]">
            {activeIncident ? routeStatusLabels[evacuationState?.routeHealth ?? "clear"] : "Monitoring"}
          </div>
        </div>

        <div className="space-y-2">
          <div className="h-2 rounded-full bg-[color-mix(in_srgb,var(--color-foreground)_8%,transparent)]">
            <div
              className="h-full rounded-full bg-[var(--color-primary)] transition-[width] duration-500"
              style={{ width: `${evacuationState?.progressPercent ?? 0}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-sm text-muted">
            <span>{evacuationState?.activeAlerts ?? 0} active alerts</span>
            <span>{evacuationState?.lastAlertChannel ?? "silent channel"}</span>
          </div>
        </div>

        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-3">
          <p className="text-sm font-medium text-foreground">
            {feedbackMessage ?? "Awaiting validated route and alert updates from the decision engine."}
          </p>
        </div>
      </div>
    </Card>
  );
});
