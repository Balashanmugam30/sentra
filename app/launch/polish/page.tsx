"use client";

import { ConfidenceMeter } from "@/components/polish/confidence-meter";
import { DesignSystemGrid } from "@/components/polish/design-system-grid";
import { KpiTile } from "@/components/polish/kpi-tile";
import { LaunchShell } from "@/components/polish/launch-shell";
import { PolishScoreboard } from "@/components/polish/polish-scoreboard";
import { PremiumCard } from "@/components/polish/premium-card";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { polishPerformance, polishPrinciples } from "@/lib/polish/runtime";
import { usePolish } from "@/lib/polish/use-polish";

export default function LaunchPolishPage() {
  const { data, loading, error } = usePolish();

  return (
    <ProtectedWorkspaceShell>
      <LaunchShell
        eyebrow="Product polish layer"
        title="Sentra Design System 2.0 and launch readiness"
        subtitle="A premium product finish layer for demo day: glass UI, command cards, animated stats, tactical tables, confidence meters, skeleton-first loading, and presentation-ready executive flows."
      >
        <div className="grid gap-4 md:grid-cols-4">
          <KpiTile label="Global Polish" value={data.global_polish_score} detail={loading ? "loading polish state" : "launch-ready"} />
          <KpiTile label="Design Modules" value={data.design_system.length} detail="reusable primitives" />
          <KpiTile label="Performance" value="Dedupe" detail="cache-aware requests" />
          <KpiTile label="Fallback Mode" value={error ? "Active" : "Ready"} detail="safe demo continuity" />
        </div>
        <PolishScoreboard areas={data.polish_areas} />
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <PremiumCard title="Design System 2.0" eyebrow="Reusable premium system" accent="cyan">
            <DesignSystemGrid modules={data.design_system} />
          </PremiumCard>
          <PremiumCard title="Launch principles" eyebrow="UX domination" accent="emerald">
            <div className="space-y-3">
              {polishPrinciples.map((principle) => (
                <p className="rounded-3xl border border-white/10 bg-black/25 p-4 text-sm leading-6 text-white/62" key={principle}>{principle}</p>
              ))}
            </div>
          </PremiumCard>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {data.performance_posture.map((item, index) => (
            <ConfidenceMeter label={item} score={[95, 91, 94, 93, 90][index] ?? 92} key={item} />
          ))}
        </div>
        <PremiumCard title="Performance upgrade posture" eyebrow="Fast and calm under demo pressure" accent="amber">
          <div className="grid gap-3 md:grid-cols-4">
            {polishPerformance.map((item) => (
              <div className="rounded-3xl border border-white/10 bg-black/25 p-4" key={item.label}>
                <p className="text-xs uppercase tracking-[0.18em] text-white/35">{item.label}</p>
                <p className="mt-2 font-mono text-lg text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </PremiumCard>
      </LaunchShell>
    </ProtectedWorkspaceShell>
  );
}

