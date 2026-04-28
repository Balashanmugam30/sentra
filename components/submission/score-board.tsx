import { SubmissionPanel } from "@/components/submission/submission-panel";
import type { SubmissionScore } from "@/lib/submission/types";

export function ScoreBoard({ score }: { score: SubmissionScore }) {
  return (
    <SubmissionPanel eyebrow="Live Score Engine" title="Competition, investor, and grant readiness score" subtitle={score.winner_summary}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {score.categories.map((category) => (
          <article className="rounded-3xl border border-white/10 bg-black/25 p-5" key={category.category}>
            <div className="flex items-start justify-between gap-4">
              <h3 className="capitalize text-lg font-semibold text-white">{category.category.replaceAll("_", " ")}</h3>
              <span className="rounded-full border border-cyan-200/20 bg-cyan-200/10 px-3 py-1 text-xs text-cyan-100">{category.score}</span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-200 to-emerald-200" style={{ width: `${category.score}%` }} />
            </div>
            <p className="mt-4 text-sm leading-6 text-white/55">{category.reason}</p>
          </article>
        ))}
      </div>
    </SubmissionPanel>
  );
}
