import type { StrategySnapshot } from "@/lib/behavior/decision";

type StrategyCompareProps = {
  strategy: StrategySnapshot;
};

export function StrategyCompare({ strategy }: StrategyCompareProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Strategy A vs B vs C</p>
      <div className="mt-5 overflow-hidden rounded-3xl border border-white/10">
        <div className="grid grid-cols-[1.2fr_repeat(6,0.8fr)] gap-px bg-white/10 text-xs text-slate-300">
          {["Strategy", "Casualty", "Evac", "Panic", "Trust", "Damage", "Score"].map((header) => (
            <div key={header} className="bg-slate-950/80 p-3 font-bold uppercase tracking-[0.16em]">{header}</div>
          ))}
          {strategy.strategies.map((row) => (
            <div key={row.strategy} className="contents">
              <div className="bg-black/35 p-3 font-black text-white">{row.strategy}</div>
              <div className="bg-black/35 p-3">{row.casualty_risk}%</div>
              <div className="bg-black/35 p-3">{row.evac_time_minutes}m</div>
              <div className="bg-black/35 p-3">{row.panic_probability}%</div>
              <div className="bg-black/35 p-3">{row.trust_impact}%</div>
              <div className="bg-black/35 p-3">${Math.round(row.financial_damage / 1000)}K</div>
              <div className="bg-black/35 p-3 font-black text-cyan-100">{row.score}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-5 rounded-3xl border border-emerald-300/25 bg-emerald-400/10 p-4">
        <p className="text-xs uppercase tracking-[0.24em] text-emerald-200/80">Recommended winner</p>
        <p className="mt-2 text-2xl font-black text-white">{strategy.winner.strategy}</p>
        <p className="mt-2 text-sm leading-6 text-slate-300">{strategy.why_winner_selected}</p>
      </div>
    </section>
  );
}
