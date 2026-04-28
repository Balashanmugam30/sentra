import { formatCurrency } from "@/lib/revenue/helpers";
import type { RepPerformance } from "@/lib/growth/types";

type RepLeaderboardProps = {
  reps: RepPerformance[];
};

export function RepLeaderboard({ reps }: RepLeaderboardProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-slate-950/30 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Rep leaderboard</p>
      <div className="mt-4 space-y-3">
        {reps.map((rep) => (
          <article key={rep.rep} className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-white">{rep.rep}</p>
                <p className="text-xs text-slate-500">Win rate {rep.win_rate}% · attainment {rep.attainment}%</p>
              </div>
              <p className="text-xl font-black text-cyan-100">{formatCurrency(rep.weighted_forecast)}</p>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-300" style={{ width: `${Math.min(100, rep.attainment)}%` }} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

