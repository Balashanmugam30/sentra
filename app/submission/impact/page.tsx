"use client";

import { ImpactBoard } from "@/components/submission/impact-board";
import { SubmissionKpis } from "@/components/submission/submission-kpis";
import { SubmissionShell } from "@/components/submission/submission-shell";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useSubmission } from "@/lib/submission/use-submission";

export default function SubmissionImpactPage() {
  const { impact, loading, error, lastAction, refresh } = useSubmission();

  return (
    <ProtectedWorkspaceShell>
      <SubmissionShell
        eyebrow="Impact Proof Center"
        title="Measurable proof for judges, investors, and grant committees"
        subtitle="Outcome evidence for response time, casualty risk, downtime, savings, population protected, and government-scale value."
        loading={loading}
        error={error}
        lastAction={lastAction}
        onRefresh={refresh}
      >
        <SubmissionKpis
          items={[
            { label: "Impact score", value: `${impact.impact_score}/100`, tone: "cyan" },
            { label: "Population protected", value: impact.population_protected.toLocaleString(), tone: "emerald" },
            { label: "Metrics", value: impact.metrics.length, tone: "blue" },
            { label: "Scale potential", value: impact.government_scale_potential, tone: "amber" },
          ]}
        />
        <ImpactBoard impact={impact} />
      </SubmissionShell>
    </ProtectedWorkspaceShell>
  );
}
