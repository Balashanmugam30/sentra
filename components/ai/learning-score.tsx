import type { LearningTrendPoint } from "@/lib/ai/types";

type LearningScoreProps = {
  score: number;
  maturity: string;
  episodes: number;
  trend: LearningTrendPoint[];
};

export function LearningScore({ score, maturity, episodes, trend }: LearningScoreProps) {
  return (
    <section className="rounded-[2rem] border border-cyan-300/20 bg-gradient-to-br from-cyan-300/12 via-slate-950/80 to-emerald-300/10 p-5 shadow-2xl shadow-cyan-950/30 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-100/70">Learning Score</p>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-6xl font-black tracking-[-0.08em] text-white">{score}</p>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">/100 {maturity}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-right">
          <p className="text-2xl font-black text-emerald-100">{episodes}</p>
          <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Episodes learned</p>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-4 gap-2">
        {trend.map((point) => (
          <div key={point.label} className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <div className="h-20 rounded-xl bg-white/5 p-1">
              <div className="mt-auto rounded-lg bg-gradient-to-t from-cyan-300 to-emerald-300" style={{ height: `${point.score}%` }} />
            </div>
            <p className="mt-2 text-xs font-semibold text-white">{point.score}</p>
            <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">{point.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
