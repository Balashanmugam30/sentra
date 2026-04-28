"use client";

import { JudgeAnswerBoard } from "@/components/submission/judge-answer-board";
import { SubmissionKpis } from "@/components/submission/submission-kpis";
import { SubmissionShell } from "@/components/submission/submission-shell";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useSubmission } from "@/lib/submission/use-submission";

export default function SubmissionJudgesPage() {
  const { judges, loading, error, lastAction, refresh } = useSubmission();

  return (
    <ProtectedWorkspaceShell>
      <SubmissionShell
        eyebrow="Judge Answer Engine"
        title="Prepared answers for the questions that decide competitions"
        subtitle="Short, medium, and long responses tuned for uniqueness, defensibility, scale, revenue, team strength, and measurable impact."
        loading={loading}
        error={error}
        lastAction={lastAction}
        onRefresh={refresh}
      >
        <SubmissionKpis
          items={[
            { label: "Q&A score", value: `${judges.qna_score}/100`, tone: "cyan" },
            { label: "Prepared answers", value: judges.answers.length, tone: "emerald" },
            { label: "Answer modes", value: judges.modes.length, tone: "blue" },
            { label: "Recommended mode", value: judges.recommended_mode, tone: "amber" },
          ]}
        />
        <JudgeAnswerBoard judges={judges} />
      </SubmissionShell>
    </ProtectedWorkspaceShell>
  );
}
