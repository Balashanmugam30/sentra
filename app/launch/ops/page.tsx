"use client";

import { LaunchKpis } from "@/components/launch/launch-kpis";
import { LaunchShell } from "@/components/launch/launch-shell";
import { OpsBoard } from "@/components/launch/ops-board";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useLaunch } from "@/lib/launch/use-launch";

export default function LaunchOpsPage() {
  const { ops, loading, error, lastAction, refresh } = useLaunch();

  return (
    <ProtectedWorkspaceShell>
      <LaunchShell
        eyebrow="Observability UI"
        title="Launch operations health and reliability posture"
        subtitle="Live errors, uptime, background jobs, queue depth, retries, degraded services, alert history, cache posture, and websocket health."
        loading={loading}
        error={error}
        lastAction={lastAction}
        onRefresh={refresh}
      >
        <LaunchKpis
          items={[
            { label: "Ops Score", value: ops.ops_score, tone: "emerald" },
            { label: "Uptime", value: `${ops.uptime_percent}%`, tone: "cyan" },
            { label: "Queue Depth", value: ops.queue_depth, tone: "blue" },
            { label: "Retries Today", value: ops.retries_today, tone: "amber" },
          ]}
        />
        <OpsBoard ops={ops} />
      </LaunchShell>
    </ProtectedWorkspaceShell>
  );
}
