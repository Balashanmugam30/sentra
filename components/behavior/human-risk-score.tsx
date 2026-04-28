import type { BehaviorSummary } from "@/lib/behavior/types";

type HumanRiskScoreProps = {
  summary: BehaviorSummary;
};

function riskColor(score: number) {
  if (score >= 72) {
    return "from-rose-400 to-red-500 text-rose-50";
  }
  if (score >= 52) {
    return "from-amber-300 to-orange-400 text-amber-50";
  }
  return "from-emerald-300 to-cyan-300 text-emerald-50";
}

export function HumanRiskScore({ summary }: HumanRiskScoreProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-cyan-950/25 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Human risk score</p>
      <div className="mt-5 flex flex-wrap items-center gap-5">
        <div className={`grid h-36 w-36 place-items-center rounded-full bg-gradient-to-br ${riskColor(summary.human_risk_score)} shadow-2xl shadow-cyan-950/30`}>
          <div className="text-center">
            <p className="text-5xl font-black">{summary.human_risk_score}</p>
            <p className="text-[10px] font-black uppercase tracking-[0.22em]">risk</p>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-3xl font-black text-white">{summary.highest_risk_zone}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">{summary.recommended_style}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              ["Modeled", summary.population_modeled.toLocaleString()],
              ["At risk", summary.at_risk_population.toLocaleString()],
              ["Trust", `${summary.trust_score}%`],
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

