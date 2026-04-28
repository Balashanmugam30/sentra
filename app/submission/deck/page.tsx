"use client";

import { DeckBoard } from "@/components/submission/deck-board";
import { SubmissionKpis } from "@/components/submission/submission-kpis";
import { SubmissionShell } from "@/components/submission/submission-shell";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useSubmission } from "@/lib/submission/use-submission";

export default function SubmissionDeckPage() {
  const { deck, loading, error, busyAction, lastAction, refresh, exportArtifact } = useSubmission();

  return (
    <ProtectedWorkspaceShell>
      <SubmissionShell
        eyebrow="Auto Pitch Deck Engine"
        title="Investor, hackathon, and government deck generator"
        subtitle="Premium editable deck content with slide-by-slide headlines, proof points, visuals, and export-ready packaging."
        loading={loading}
        error={error}
        lastAction={lastAction}
        onRefresh={refresh}
      >
        <SubmissionKpis
          items={[
            { label: "Deck quality", value: `${deck.deck_quality_score}/100`, tone: "cyan" },
            { label: "Slides generated", value: deck.slides.length, tone: "emerald" },
            { label: "Templates", value: deck.templates.length, tone: "blue" },
            { label: "Export formats", value: deck.export_formats.length, tone: "amber" },
          ]}
        />
        <DeckBoard deck={deck} busyAction={busyAction} onExport={() => void exportArtifact("pdf", "pitch_deck")} />
      </SubmissionShell>
    </ProtectedWorkspaceShell>
  );
}
