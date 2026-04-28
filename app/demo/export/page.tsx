"use client";

import { ExportCenter } from "@/components/demo/export-center";
import { KpiTile } from "@/components/polish/kpi-tile";
import { LaunchShell } from "@/components/polish/launch-shell";
import { PremiumCard } from "@/components/polish/premium-card";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useDemo } from "@/lib/demo/use-demo";

export default function DemoExportPage() {
  const { exports, summary } = useDemo();

  return (
    <ProtectedWorkspaceShell>
      <LaunchShell
        eyebrow="Launch export engine"
        title="Board, investor, incident, and media packs"
        subtitle="Generate deterministic launch-ready artifacts for boardrooms, judges, investors, operators, and media coverage."
      >
        <div className="grid gap-4 md:grid-cols-4">
          <KpiTile label="Exports Ready" value={exports.exports.length} detail="board + investor + ops" />
          <KpiTile label="Board Report" value={exports.board_report_ready ? "Ready" : "Pending"} />
          <KpiTile label="Investor One Pager" value={exports.investor_one_pager_ready ? "Ready" : "Pending"} />
          <KpiTile label="Judge Score" value={summary.judge_score} />
        </div>
        <ExportCenter exports={exports} />
        <PremiumCard title="Screenshot pack plan" eyebrow="Media-ready storytelling" accent="cyan">
          <div className="grid gap-3 md:grid-cols-3">
            {["Live twin climax", "AI council debate", "Recovery board summary"].map((shot) => (
              <div className="rounded-3xl border border-white/10 bg-black/25 p-4" key={shot}>
                <p className="font-semibold text-white">{shot}</p>
                <p className="mt-2 text-sm text-white/45">Prepared for pitch decks, press kits, and investor follow-up.</p>
              </div>
            ))}
          </div>
        </PremiumCard>
      </LaunchShell>
    </ProtectedWorkspaceShell>
  );
}

