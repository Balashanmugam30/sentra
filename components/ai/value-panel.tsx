import type { LearningExecutiveValue } from "@/lib/ai/types";

type ValuePanelProps = {
  value: LearningExecutiveValue;
};

export function ValuePanel({ value }: ValuePanelProps) {
  const metrics = [
    ["Response time", value.response_time_improvement],
    ["False alarms", value.false_alarm_reduction],
    ["Trust", value.trust_increase],
    ["Losses prevented", value.prevented_losses_estimate],
  ];

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200/70">Executive Value</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">Adaptive intelligence ROI</h2>
      <div className="mt-5 grid grid-cols-2 gap-3">
        {metrics.map(([label, metric]) => (
          <div key={label} className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <p className="text-2xl font-black text-white">{metric}</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-slate-500">{label}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-3xl border border-emerald-300/20 bg-emerald-400/10 p-4">
        <p className="text-3xl font-black text-emerald-100">{value.learning_maturity_score}</p>
        <p className="text-xs uppercase tracking-[0.22em] text-emerald-100/70">Learning maturity</p>
        <p className="mt-3 text-sm leading-6 text-slate-200">{value.summary}</p>
      </div>
    </section>
  );
}
