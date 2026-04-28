"use client";

import { JudgeScorecard } from "@/components/demo/judge-scorecard";
import { KpiTile } from "@/components/polish/kpi-tile";
import { LaunchShell } from "@/components/polish/launch-shell";
import { PremiumCard } from "@/components/polish/premium-card";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useDemo } from "@/lib/demo/use-demo";

export default function DemoJudgePage() {
  const { judge, summary } = useDemo();

  return (
    <ProtectedWorkspaceShell>
      <LaunchShell
        eyebrow="Judge scoring mode"
        title="Why Sentra wins the room"
        subtitle="Auto-generated scoring narrative for innovation, technical complexity, real-world impact, scalability, business model, and pure wow factor."
      >
        <div className="grid gap-4 md:grid-cols-4">
          <KpiTile label="Overall Score" value={judge.overall_score} detail="judge readiness" />
          <KpiTile label="Systems Connected" value={summary.systems_connected.length} detail="single product story" />
          <KpiTile label="Polish Score" value={summary.polish_score} detail="launch surface" />
          <KpiTile label="Demo Runtime" value="5 min" detail="judge flow" />
        </div>
        <JudgeScorecard judge={judge} />
        <PremiumCard title="Technical highlights" eyebrow="What judges should remember" accent="emerald">
          <div className="grid gap-3 md:grid-cols-2">
            {judge.technical_highlights.map((item) => (
              <p className="rounded-3xl border border-white/10 bg-black/25 p-4 text-sm text-white/62" key={item}>{item}</p>
            ))}
          </div>
          <p className="mt-5 rounded-3xl border border-cyan-200/20 bg-cyan-200/10 p-4 text-sm leading-6 text-cyan-50">{judge.recommendation}</p>
        </PremiumCard>
      </LaunchShell>
    </ProtectedWorkspaceShell>
  );
}

