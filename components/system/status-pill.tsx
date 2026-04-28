"use client";

import { memo, useMemo } from "react";

import { useSystemStatus } from "@/hooks/use-system-status";
import { cn } from "@/lib/utils";
import { getTimeToImpact } from "@/modules/simulation/time-engine";
import { useDemoStore } from "@/store/demo-store";

const statusClasses = {
  monitoring:
    "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_12%,var(--color-surface-strong))] text-[var(--color-success)]",
  alert:
    "border-[color-mix(in_srgb,var(--color-warning)_26%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_12%,var(--color-surface-strong))] text-[var(--color-warning)]",
  emergency:
    "border-[color-mix(in_srgb,var(--color-danger)_28%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_12%,var(--color-surface-strong))] text-[var(--color-danger)]",
} as const;

export const StatusPill = memo(function StatusPill() {
  const { status, label, realtimeConnection } = useSystemStatus();
  const activeScenario = useDemoStore((state) => state.activeScenario);
  const timelinePosition = useDemoStore((state) => state.timelinePosition);
  const nextImpact = useMemo(
    () => getTimeToImpact(activeScenario, timelinePosition),
    [activeScenario, timelinePosition],
  );

  return (
    <div
      className={cn(
        "inline-flex min-h-12 items-center gap-3 rounded-full border px-4 py-2 text-sm font-medium shadow-[var(--shadow-soft)] backdrop-blur-md transition-colors duration-300",
        statusClasses[status],
      )}
    >
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-current" />
      <span>{label}</span>
      <span className="text-xs font-medium uppercase tracking-[0.18em] opacity-70">
        {realtimeConnection === "connected"
          ? "Live"
          : realtimeConnection === "simulated"
            ? "Simulated"
            : "Standby"}
      </span>
      {nextImpact ? (
        <span className="rounded-full bg-[color-mix(in_srgb,currentColor_12%,transparent)] px-2.5 py-1 text-xs font-medium">
          Impact in {Math.ceil(nextImpact.remainingSec)}s
        </span>
      ) : null}
    </div>
  );
});
