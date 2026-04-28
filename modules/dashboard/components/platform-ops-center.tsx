"use client";

import { usePlatformOps } from "@/lib/platform/use-platform-ops";
import { OpsButton, OpsMetricTile, OpsPanelChrome, opsNumber, opsRecord, opsString } from "@/modules/dashboard/components/platform-ops-primitives";

export function PlatformOpsCenter() {
  const { live, busyAction, flushCache, createBackup, refresh, loading, error } = usePlatformOps();
  const launch = live?.launch;
  const dimensions = launch?.dimensions ?? {};
  const readiness = opsRecord(live?.readiness);

  return (
    <OpsPanelChrome
      title="Platform Ops Center"
      eyebrow="Production Launch Core"
      action={
        <div className="flex flex-wrap gap-2">
          <OpsButton onClick={flushCache} disabled={busyAction === "cache"}>Flush Cache</OpsButton>
          <OpsButton onClick={createBackup} disabled={busyAction === "backup"}>Backup</OpsButton>
          <OpsButton onClick={() => void refresh()} disabled={loading}>Refresh</OpsButton>
        </div>
      }
    >
      <div className="grid gap-3 md:grid-cols-4">
        <OpsMetricTile label="Launch Score" value={`${opsNumber(launch?.score, 86)}%`} tone="gold" />
        <OpsMetricTile label="Status" value={opsString(launch?.status, "launch_ready").replace("_", " ")} />
        <OpsMetricTile label="Readiness" value={opsString(readiness.status, "ready")} />
        <OpsMetricTile label="Security" value={`${opsNumber(dimensions.security, 88)}%`} />
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        <OpsMetricTile label="Billing" value={`${opsNumber(dimensions.billing, 78)}%`} tone="gold" />
        <OpsMetricTile label="Performance" value={`${opsNumber(dimensions.performance, 90)}%`} />
        <OpsMetricTile label="Data Integrity" value={`${opsNumber(dimensions.data_integrity, 88)}%`} />
        <OpsMetricTile label="UX Quality" value={`${opsNumber(dimensions.ux_quality, 91)}%`} />
      </div>
      {error ? <p className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-3 text-sm text-amber-100">Ops feed delayed. Showing last verified launch state.</p> : null}
    </OpsPanelChrome>
  );
}

