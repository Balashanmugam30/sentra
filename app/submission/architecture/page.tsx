"use client";

import { ArchitectureBoard } from "@/components/submission/architecture-board";
import { SubmissionKpis } from "@/components/submission/submission-kpis";
import { SubmissionShell } from "@/components/submission/submission-shell";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useSubmission } from "@/lib/submission/use-submission";

export default function SubmissionArchitecturePage() {
  const { architecture, loading, error, lastAction, refresh } = useSubmission();

  return (
    <ProtectedWorkspaceShell>
      <SubmissionShell
        eyebrow="Architecture Showcase"
        title="Exportable system diagrams for technical confidence"
        subtitle="Clear proof of the AI agent flow, IoT pipeline, digital twin, security stack, data platform, and multi-tenant cloud."
        loading={loading}
        error={error}
        lastAction={lastAction}
        onRefresh={refresh}
      >
        <SubmissionKpis
          items={[
            { label: "Architecture score", value: `${architecture.architecture_score}/100`, tone: "cyan" },
            { label: "Diagrams", value: architecture.diagrams.length, tone: "emerald" },
            { label: "Export formats", value: architecture.export_formats.length, tone: "blue" },
            { label: "Layer depth", value: architecture.diagrams.reduce((sum, diagram) => sum + diagram.layers.length, 0), tone: "amber" },
          ]}
        />
        <ArchitectureBoard architecture={architecture} />
      </SubmissionShell>
    </ProtectedWorkspaceShell>
  );
}
