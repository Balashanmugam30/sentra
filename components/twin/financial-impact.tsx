import type { TwinCompareState, TwinPredictiveState } from "@/lib/twin/types";

function money(value: number) {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  return `$${Math.round(value / 1_000)}K`;
}

export function FinancialImpact({ predictive, compare }: { predictive: TwinPredictiveState; compare: TwinCompareState }) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-amber-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-200/70">Monetizable Twin Intelligence</p>
      <h2 className="mt-2 text-2xl font-black text-white">Financial Impact</h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Metric label="Exposure" value={money(predictive.financial_exposure)} />
        <Metric label="Best loss" value={money(compare.winner.financial_loss)} />
        <Metric label="Reputation" value={`${Math.round(predictive.reputation_risk)}%`} />
      </div>
      <p className="mt-4 rounded-3xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm leading-6 text-amber-50">{compare.board_summary}</p>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-xs uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
    </div>
  );
}

