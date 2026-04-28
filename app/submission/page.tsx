"use client";

import { ExportCenter } from "@/components/submission/export-center";
import { ImpactBoard } from "@/components/submission/impact-board";
import { ModeSwitcher } from "@/components/submission/mode-switcher";
import { ScoreBoard } from "@/components/submission/score-board";
import { SubmissionKpis } from "@/components/submission/submission-kpis";
import { SubmissionShell } from "@/components/submission/submission-shell";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useSubmission } from "@/lib/submission/use-submission";

export default function SubmissionCommandPage() {
  const { summary, impact, score, loading, error, busyAction, lastAction, refresh, generatePack, exportArtifact } = useSubmission();

  return (
    <ProtectedWorkspaceShell>
      <SubmissionShell
        eyebrow="Pitch + Submission Engine"
        title="Competition-winning submission command center"
        subtitle="One control room for decks, judge answers, documents, measurable proof, demo scripts, founder narrative, exports, and live scoring."
        loading={loading}
        error={error}
        lastAction={lastAction}
        onRefresh={refresh}
      >
        <SubmissionKpis
          items={[
            { label: "Readiness score", value: `${summary.readiness_score}/100`, tone: "cyan" },
            { label: "Winner score", value: `${score.overall_score}/100`, tone: "emerald" },
            { label: "Impact score", value: `${impact.impact_score}/100`, tone: "blue" },
            { label: "Missing assets", value: summary.pending_missing_assets.length, tone: "amber" },
          ]}
        />
        <ExportCenter
          summary={summary}
          busyAction={busyAction}
          onGenerate={() => void generatePack(summary.selected_mode, "submission_pack")}
          onExport={() => void exportArtifact("pdf", "board_report")}
        />
        <ModeSwitcher modes={summary.modes} selectedMode={summary.selected_mode} />
        <ImpactBoard impact={impact} />
        <ScoreBoard score={score} />
      </SubmissionShell>
    </ProtectedWorkspaceShell>
  );
}
