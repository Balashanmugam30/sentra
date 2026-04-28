"use client";

import { LaunchKpis } from "@/components/launch/launch-kpis";
import { LaunchShell } from "@/components/launch/launch-shell";
import { QualityBoard } from "@/components/launch/quality-board";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useLaunch } from "@/lib/launch/use-launch";

export default function LaunchQualityPage() {
  const { quality, loading, error, busyAction, lastAction, refresh, scan } = useLaunch();

  return (
    <ProtectedWorkspaceShell>
      <LaunchShell
        eyebrow="Zero Bug Hardening"
        title="Quality control before the spotlight"
        subtitle="Broken routes, empty states, failed APIs, console errors, stale polling, auth loops, type mismatches, and mobile layout risks in one deterministic launch QA center."
        loading={loading}
        error={error}
        lastAction={lastAction}
        onRefresh={refresh}
      >
        <LaunchKpis
          items={[
            { label: "Quality Score", value: quality.quality_score, tone: "emerald" },
            { label: "Routes Scanned", value: quality.scanner.routes_scanned, tone: "cyan" },
            { label: "Broken Routes", value: quality.scanner.broken_routes, tone: "emerald" },
            { label: "Watch Items", value: quality.open_items, tone: "amber" },
          ]}
        />
        <QualityBoard quality={quality} busyAction={busyAction} onScan={() => void scan("all")} />
      </LaunchShell>
    </ProtectedWorkspaceShell>
  );
}
