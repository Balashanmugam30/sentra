"use client";

import { memo, useMemo } from "react";

import { Card } from "@/components/ui";
import { useActiveIncident } from "@/hooks/use-active-incident";
import { useDemoStore } from "@/store/demo-store";
import { useUiStore } from "@/store/ui-store";

function HealthRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "neutral" | "success" | "warning" | "danger";
}) {
  const toneClass =
    tone === "success"
      ? "bg-[var(--color-success)]"
      : tone === "warning"
        ? "bg-[var(--color-warning)]"
        : tone === "danger"
          ? "bg-[var(--color-danger)]"
          : "bg-[color-mix(in_srgb,var(--color-foreground)_32%,transparent)]";

  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted">{label}</span>
      <span className="inline-flex items-center gap-2 text-foreground">
        <span className={`h-2.5 w-2.5 rounded-full ${toneClass}`} />
        {value}
      </span>
    </div>
  );
}

export const SystemHealth = memo(function SystemHealth() {
  const realtimeConnection = useUiStore((state) => state.realtimeConnection);
  const simulationStatus = useDemoStore((state) => state.simulationStatus);
  const faultsEnabled = useDemoStore((state) => state.faultsEnabled);
  const selectedFaults = useDemoStore((state) => state.selectedFaults);
  const activeIncident = useActiveIncident();

  const health = useMemo(() => {
    const simulationRunning = simulationStatus === "running" || simulationStatus === "paused";
    const sensorFault = faultsEnabled && simulationRunning && selectedFaults.includes("sensor_failure");
    const commsFault =
      faultsEnabled && simulationRunning && selectedFaults.includes("communication_failure");

    return {
      sensors: sensorFault
        ? { value: "Degraded", tone: "warning" as const }
        : { value: "Active", tone: "success" as const },
      network:
        realtimeConnection === "degraded" || commsFault
          ? { value: "Degraded", tone: "warning" as const }
          : realtimeConnection === "connected" || realtimeConnection === "simulated"
            ? { value: "Stable", tone: "success" as const }
            : { value: "Standby", tone: "neutral" as const },
      ai:
        simulationRunning || activeIncident
          ? { value: "Running", tone: "success" as const }
          : { value: "Monitoring", tone: "neutral" as const },
    };
  }, [activeIncident, faultsEnabled, realtimeConnection, selectedFaults, simulationStatus]);

  return (
    <Card className="w-full p-5">
      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">System Status</p>
        <div className="space-y-2.5">
          <HealthRow label="Sensors" tone={health.sensors.tone} value={health.sensors.value} />
          <HealthRow label="Network" tone={health.network.tone} value={health.network.value} />
          <HealthRow label="AI Engine" tone={health.ai.tone} value={health.ai.value} />
        </div>
      </div>
    </Card>
  );
});
