import type { TwinCompareState } from "@/lib/twin/types";

type DecisionSimulatorProps = {
  compare: TwinCompareState;
  busyAction: string | null;
  onCompare: () => void;
};

export function DecisionSimulator({ compare, busyAction, onCompare }: DecisionSimulatorProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-violet-950/20 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-violet-200/70">Executive Decision Simulator</p>
          <h2 className="mt-2 text-2xl font-black text-white">Strategy Compare</h2>
        </div>
        <button type="button" onClick={onCompare} className="rounded-2xl border border-violet-300/30 bg-violet-300/10 px-4 py-3 text-sm font-bold text-violet-50 transition hover:bg-violet-300/20">
          {busyAction === "compare-strategies" ? "Comparing..." : "Compare strategies"}
        </button>
      </div>
      <div className="mt-5 space-y-3">
        {compare.strategies.map((strategy) => (
          <article key={strategy.strategy_id} className={`rounded-3xl border p-4 ${strategy.winner ? "border-emerald-300/25 bg-emerald-300/10" : "border-white/10 bg-black/20"}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-black text-white">{strategy.name}</h3>
                <p className="mt-1 text-sm text-slate-400">{strategy.why}</p>
              </div>
              <p className="text-2xl font-black text-white">{strategy.confidence}%</p>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <Mini label="Casualty" value={`${strategy.casualty_risk}%`} />
              <Mini label="Recovery" value={`${strategy.recovery_eta}m`} />
              <Mini label="Downtime" value={`${strategy.downtime_hours}h`} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-black text-white">{value}</p>
    </div>
  );
}

