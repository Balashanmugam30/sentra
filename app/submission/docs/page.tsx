"use client";

import { DocsBoard } from "@/components/submission/docs-board";
import { SubmissionKpis } from "@/components/submission/submission-kpis";
import { SubmissionShell } from "@/components/submission/submission-shell";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useSubmission } from "@/lib/submission/use-submission";

export default function SubmissionDocsPage() {
  const { docs, loading, error, busyAction, lastAction, refresh, exportArtifact } = useSubmission();
  const totalPages = docs.documents.reduce((sum, doc) => sum + doc.pages, 0);

  return (
    <ProtectedWorkspaceShell>
      <SubmissionShell
        eyebrow="Document Engine"
        title="One-click written collateral for procurement, grants, and media"
        subtitle="Executive summaries, technical docs, trust packets, case studies, API overviews, one-pagers, and procurement briefs."
        loading={loading}
        error={error}
        lastAction={lastAction}
        onRefresh={refresh}
      >
        <SubmissionKpis
          items={[
            { label: "Document score", value: `${docs.doc_score}/100`, tone: "cyan" },
            { label: "Documents", value: docs.documents.length, tone: "emerald" },
            { label: "Total pages", value: totalPages, tone: "blue" },
            { label: "Procurement", value: docs.procurement_ready ? "Ready" : "Draft", tone: "amber" },
          ]}
        />
        <DocsBoard docs={docs} busyAction={busyAction} onExport={() => void exportArtifact("docx", "document_pack")} />
      </SubmissionShell>
    </ProtectedWorkspaceShell>
  );
}
