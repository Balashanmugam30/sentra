import type { LearningSnapshot } from "@/lib/behavior/learning";

type LearningScoreProps = {
  learning: LearningSnapshot;
};

export function LearningScore({ learning }: LearningScoreProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Model improvement score</p>
      <div className="mt-5 flex flex-wrap items-center gap-5">
        <div className="grid h-36 w-36 place-items-center rounded-full bg-gradient-to-br from-cyan-300 via-emerald-300 to-blue-400 text-slate-950 shadow-2xl shadow-cyan-950/40">
          <div className="text-center">
            <p className="text-5xl font-black">{learning.model_improvement_score}</p>
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">learning</p>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-3xl font-black text-white">{learning.episodes_learned} incidents learned</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">{learning.executive_summary}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-4">
            {[
              ["Panic reduced", `${learning.avg_panic_reduction}%`],
              ["Compliance", `${learning.avg_compliance}%`],
              ["Minutes saved", learning.evacuation_minutes_saved.toString()],
              ["ROI saved", `$${Math.round(learning.roi_saved_estimate / 1000)}K`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">{label}</p>
                <p className="mt-1 text-xl font-black text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
