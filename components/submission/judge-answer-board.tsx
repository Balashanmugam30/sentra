import { SubmissionPanel } from "@/components/submission/submission-panel";
import type { SubmissionJudges } from "@/lib/submission/types";

export function JudgeAnswerBoard({ judges }: { judges: SubmissionJudges }) {
  return (
    <SubmissionPanel eyebrow="Judge Answer Engine" title="Short, medium, and long answers for high-pressure Q&A" subtitle={judges.recommended_mode}>
      <div className="grid gap-4">
        {judges.answers.map((answer) => (
          <article className="rounded-3xl border border-white/10 bg-black/25 p-5" key={answer.answer_id}>
            <h3 className="text-xl font-semibold text-white">{answer.question}</h3>
            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              <Answer label="Short" value={answer.short} />
              <Answer label="Medium" value={answer.medium} />
              <Answer label="Long" value={answer.long} />
            </div>
          </article>
        ))}
      </div>
    </SubmissionPanel>
  );
}

function Answer({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-100/45">{label}</p>
      <p className="mt-2 text-sm leading-6 text-white/60">{value}</p>
    </div>
  );
}
