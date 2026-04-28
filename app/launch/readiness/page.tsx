"use client";

import { LaunchKpis } from "@/components/launch/launch-kpis";
import { LaunchShell } from "@/components/launch/launch-shell";
import { ReadinessBoard } from "@/components/launch/readiness-board";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useLaunch } from "@/lib/launch/use-launch";

export default function LaunchReadinessPage() {
  const { readiness, loading, error, lastAction, refresh } = useLaunch();

  return (
    <ProtectedWorkspaceShell>
      <LaunchShell
        eyebrow="Launch Readiness Center"
        title="One launch score for product, demo, trust, investor, and submission readiness"
        subtitle="The final command center for build health, feature completeness, route coverage, compliance confidence, investor readiness, demo readiness, and submission confidence."
        loading={loading}
        error={error}
        lastAction={lastAction}
        onRefresh={refresh}
      >
        <LaunchKpis
          items={[
            { label: "Launch Score", value: readiness.launch_score, tone: "emerald" },
            { label: "Feature Complete", value: `${readiness.feature_completeness}%`, tone: "cyan" },
            { label: "Trust Ready", value: `${readiness.trust_readiness}%`, tone: "blue" },
            { label: "Demo Ready", value: `${readiness.demo_readiness}%`, tone: "emerald" },
          ]}
        />
        <ReadinessBoard readiness={readiness} />
      </LaunchShell>
    </ProtectedWorkspaceShell>
  );
}
