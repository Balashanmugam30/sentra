import type { DecisionSnapshot } from "@/lib/behavior/decision";

type DecisionBoardProps = {
  decision: DecisionSnapshot;
};

function riskTone(score: number) {
  if (score >= 76) {
    return "from-rose-400 to-red-500 text-rose-50";
  }
  if (score >= 58) {
    return "from-amber-300 to-orange-400 text-amber-50";
  }
  return "from-emerald-300 to-cyan-300 text-slate-950";
}

export function DecisionBoard({ decision }: DecisionBoardProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Live human risk score</p>
      <div className="mt-5 flex flex-wrap items-center gap-5">
        <div className={`grid h-36 w-36 place-items-center rounded-full bg-gradient-to-br ${riskTone(decision.live_human_risk_score)} shadow-2xl shadow-cyan-950/40`}>
          <div className="text-center">
            <p className="text-5xl font-black">{decision.live_human_risk_score}</p>
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">risk</p>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-3xl font-black text-white">{decision.scenario.name}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
            Sentra recommends guided phased intervention for {decision.scenario.primary_zone} with {decision.urgency} urgency.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-4">
            {[
              ["Panic", `${decision.scenario.panic_level}/100`],
              ["Density", `${decision.scenario.crowd_density}/100`],
              ["Compliance", `${decision.scenario.compliance_score}%`],
              ["Vulnerable", decision.scenario.vulnerable_people.toLocaleString()],
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
