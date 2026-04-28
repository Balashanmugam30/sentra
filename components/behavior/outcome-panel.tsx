import type { DecisionSnapshot } from "@/lib/behavior/decision";

type OutcomePanelProps = {
  decision: DecisionSnapshot;
};

export function OutcomePanel({ decision }: OutcomePanelProps) {
  const outcome = decision.expected_outcome;
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Expected outcome</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {[
          ["Panic reduction", `${outcome.panic_reduction_percent}%`],
          ["Stampede reduction", `${outcome.stampede_risk_reduction_percent}%`],
          ["Compliance gain", `${outcome.compliance_gain_percent}%`],
          ["Time saved", `${outcome.evacuation_time_saved_minutes}m`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-black text-white">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
