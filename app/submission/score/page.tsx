"use client";

import { ScoreBoard } from "@/components/submission/score-board";
import { SubmissionKpis } from "@/components/submission/submission-kpis";
import { SubmissionPanel } from "@/components/submission/submission-panel";
import { SubmissionShell } from "@/components/submission/submission-shell";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useSubmission } from "@/lib/submission/use-submission";

export default function SubmissionScorePage() {
  const { score, loading, error, lastAction, refresh } = useSubmission();
  const lowest = score.categories.reduce((min, category) => Math.min(min, category.score), 100);

  return (
    <ProtectedWorkspaceShell>
      <SubmissionShell
        eyebrow="Live Score Engine"
        title="Judge, investor, grant, and enterprise readiness score"
        subtitle="Scores innovation, feasibility, impact, business model, design, technical depth, wow factor, completeness, and investor readiness."
        loading={loading}
        error={error}
        lastAction={lastAction}
        onRefresh={refresh}
      >
        <SubmissionKpis
          items={[
            { label: "Overall score", value: `${score.overall_score}/100`, tone: "cyan" },
            { label: "Categories", value: score.categories.length, tone: "emerald" },
            { label: "Lowest score", value: `${lowest}/100`, tone: "amber" },
            { label: "Winner status", value: "Ready", tone: "blue" },
          ]}
        />
        <ScoreBoard score={score} />
        <SubmissionPanel eyebrow="Competition Mode Recommendations" title="What the system emphasizes by audience">
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(score.mode_recommendations).map(([mode, recommendations]) => (
              <article className="rounded-3xl border border-white/10 bg-black/25 p-5" key={mode}>
                <h3 className="text-lg font-semibold capitalize text-white">{mode.replaceAll("_", " ")}</h3>
                <div className="mt-4 space-y-2">
                  {recommendations.map((recommendation) => (
                    <p className="text-sm leading-6 text-white/58" key={`${mode}-${recommendation}`}>
                      {recommendation}
                    </p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </SubmissionPanel>
      </SubmissionShell>
    </ProtectedWorkspaceShell>
  );
}
