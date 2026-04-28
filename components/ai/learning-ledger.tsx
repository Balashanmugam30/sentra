import type { AICouncilLearning } from "@/lib/ai/types";

type LearningLedgerProps = {
  learning: AICouncilLearning;
};

export function LearningLedger({ learning }: LearningLedgerProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200/70">Learning ledger</p>
      <h2 className="mt-2 text-2xl font-black text-white">Episodes becoming strategy</h2>
      <div className="mt-5 grid gap-3">
        {learning.episodes.map((episode) => (
          <article key={episode.episode_id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">{episode.decision}</h3>
                <p className="mt-1 text-sm text-slate-300">{episode.outcome}</p>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${episode.accepted ? "border-emerald-300/25 bg-emerald-400/10 text-emerald-100" : "border-amber-300/25 bg-amber-400/10 text-amber-100"}`}>
                {episode.accepted ? "accepted" : "overridden"}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-cyan-50/80">{episode.lesson}</p>
            <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
              <span className="rounded-2xl bg-white/5 px-3 py-2 text-slate-300">Win rate <b className="text-white">{episode.strategy_win_rate}%</b></span>
              <span className="rounded-2xl bg-white/5 px-3 py-2 text-slate-300">Confidence <b className="text-white">{episode.confidence_before} to {episode.confidence_after}</b></span>
              <span className="rounded-2xl bg-white/5 px-3 py-2 text-slate-300">Delay cost <b className="text-white">{episode.delay_cost}</b></span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

