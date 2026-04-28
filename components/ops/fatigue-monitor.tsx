import type { OpsFatigueRecord } from "@/lib/ops/types";

type FatigueMonitorProps = {
  fatigue: OpsFatigueRecord[];
};

export function FatigueMonitor({ fatigue }: FatigueMonitorProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-950/75 p-5 shadow-2xl shadow-rose-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-rose-100/70">Shift Fatigue Monitor</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">Overload and reserve swaps</h2>
      <div className="mt-5 grid gap-3">
        {fatigue.map((record) => (
          <article key={record.unit} className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">{record.unit}</h3>
                <p className="mt-1 text-xs text-slate-500">{record.active_hours}h active - {record.overload_risk}</p>
              </div>
              <span className={record.recommended_swap ? "font-bold text-rose-100" : "font-bold text-emerald-100"}>{record.fatigue_score}</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-rose-300" style={{ width: `${record.fatigue_score}%` }} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
