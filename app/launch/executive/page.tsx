"use client";

import { ExecutiveMode } from "@/components/launch/executive-mode";
import { LaunchKpis } from "@/components/launch/launch-kpis";
import { LaunchPanel } from "@/components/launch/launch-panel";
import { LaunchShell } from "@/components/launch/launch-shell";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useLaunch } from "@/lib/launch/use-launch";

export default function LaunchExecutivePage() {
  const { executive, loading, error, lastAction, refresh } = useLaunch();

  return (
    <ProtectedWorkspaceShell>
      <LaunchShell
        eyebrow="Executive Mode 2.0"
        title="Boardroom clarity in one screen"
        subtitle="Readiness, ARR, trust, global health, top threats, next actions, board summary, and export CTA with technical clutter removed."
        loading={loading}
        error={error}
        lastAction={lastAction}
        onRefresh={refresh}
      >
        <LaunchKpis
          items={[
            { label: "Readiness", value: executive.readiness_score, tone: "emerald" },
            { label: "ARR", value: `$${executive.arr.toLocaleString()}`, tone: "cyan" },
            { label: "Trust Score", value: executive.trust_score, tone: "blue" },
            { label: "Global Health", value: executive.global_health, tone: "emerald" },
          ]}
        />
        <ExecutiveMode executive={executive} />
        <LaunchPanel eyebrow="Top Threats" title="Executive risk view">
          <div className="grid gap-3 md:grid-cols-3">
            {executive.top_threats.map((threat) => (
              <article className="rounded-2xl border border-white/10 bg-black/25 p-4" key={threat.title}>
                <p className="font-semibold text-white">{threat.title}</p>
                <p className="mt-2 text-sm text-white/55">{threat.severity} | owner: {threat.owner}</p>
              </article>
            ))}
          </div>
        </LaunchPanel>
      </LaunchShell>
    </ProtectedWorkspaceShell>
  );
}
