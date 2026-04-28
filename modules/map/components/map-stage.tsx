"use client";

import { memo } from "react";

import { useActiveIncident } from "@/hooks/use-active-incident";
import { useEvacuationState } from "@/hooks/use-evacuation-state";
import { useSystemStatus } from "@/hooks/use-system-status";

const statusLabel = {
  monitoring: "Monitoring",
  alert: "Alert",
  emergency: "Emergency",
} as const;

export const MapStage = memo(function MapStage() {
  const activeIncident = useActiveIncident();
  const evacuationState = useEvacuationState();
  const { status } = useSystemStatus();

  return (
    <section className="flex min-h-[420px] w-full flex-1 overflow-hidden rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)]">
      <div className="flex w-full flex-col justify-between p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">Map Surface</p>
            <h2 className="mt-2 text-base font-medium text-foreground">Live Map / Incident View</h2>
          </div>
          <span className="rounded-full border border-[var(--color-border)] px-3 py-1 text-xs text-muted">
            {statusLabel[status]}
          </span>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="max-w-md text-center">
            <p className="text-[26px] font-medium tracking-[-0.02em] text-foreground">Live Map / Incident View</p>
            <p className="mt-3 text-sm leading-6 text-muted">
              {activeIncident?.summary ??
                "Connected building telemetry will appear here once an active incident or drill is in progress."}
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">Incident State</p>
            <p className="mt-2 text-sm font-medium text-foreground">{activeIncident?.status ?? "Standby"}</p>
          </div>
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">Zone Coverage</p>
            <p className="mt-2 text-sm font-medium text-foreground">
              {activeIncident?.alerts.length ?? 0} active alert channels
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">Evacuation Progress</p>
            <p className="mt-2 text-sm font-medium text-foreground">
              {evacuationState ? `${evacuationState.progressPercent}% in progress` : "No active evacuation"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
});
