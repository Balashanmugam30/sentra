"use client";

import { DesignAuditGrid } from "@/components/launch/design-audit/design-audit-grid";
import { ExecutiveMode } from "@/components/launch/executive-mode";
import { LaunchKpis } from "@/components/launch/launch-kpis";
import { LaunchShell } from "@/components/launch/launch-shell";
import { PreferencesPanel } from "@/components/launch/preferences-panel";
import { ReadinessBoard } from "@/components/launch/readiness-board";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useLaunch } from "@/lib/launch/use-launch";

export default function LaunchPage() {
  const { summary, readiness, executive, loading, error, lastAction, refresh } = useLaunch();

  return (
    <ProtectedWorkspaceShell>
      <LaunchShell
        eyebrow="Launch Excellence"
        title="Sentra is ready to feel like a flagship product"
        subtitle="A polished launch center for UI consistency, readiness, executive clarity, personalization, and buyer-ready confidence across the full Sentra operating system."
        loading={loading}
        error={error}
        lastAction={lastAction}
        onRefresh={refresh}
      >
        <LaunchKpis
          items={[
            { label: "Launch Score", value: summary.launch_score, tone: "emerald" },
            { label: "Design Score", value: summary.design_score, tone: "cyan" },
            { label: "Performance", value: summary.performance_score, tone: "blue" },
            { label: "Quality", value: summary.quality_score, tone: "amber" },
          ]}
        />
        <DesignAuditGrid audits={summary.design_audits} />
        <ReadinessBoard readiness={readiness} />
        <ExecutiveMode executive={executive} />
        <PreferencesPanel preferences={summary.preferences} />
      </LaunchShell>
    </ProtectedWorkspaceShell>
  );
}
