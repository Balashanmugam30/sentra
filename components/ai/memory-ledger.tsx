import type { LearningMemoryEpisode } from "@/lib/ai/types";

type MemoryLedgerProps = {
  episodes: LearningMemoryEpisode[];
};

export function MemoryLedger({ episodes }: MemoryLedgerProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-blue-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200/70">Incident Memory Engine</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">Structured learning ledger</h2>
      <div className="mt-5 grid gap-3">
        {episodes.map((episode) => (
          <article key={episode.memory_id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">{episode.incident_type.replaceAll("_", " ")}</h3>
                <p className="mt-1 text-sm text-slate-400">{episode.chosen_plan}</p>
              </div>
              <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-sm font-bold text-cyan-100">
                {episode.strategy_score}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-300">{episode.final_outcome}</p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
              <span className="rounded-2xl bg-white/[0.05] px-3 py-2 text-slate-300">Severity {episode.severity}</span>
              <span className="rounded-2xl bg-white/[0.05] px-3 py-2 text-slate-300">{episode.response_time_minutes}m response</span>
              <span className="rounded-2xl bg-white/[0.05] px-3 py-2 text-slate-300">{episode.casualties_avoided} avoided</span>
            </div>
            {episode.overrides.length > 0 ? (
              <p className="mt-3 text-xs text-amber-100/80">Override learned: {episode.overrides.join(", ")}</p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
