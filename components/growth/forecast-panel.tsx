import { formatCurrency } from "@/lib/revenue/helpers";
import type { GtmSummary } from "@/lib/growth/types";

type ForecastPanelProps = {
  summary: GtmSummary;
};

export function ForecastPanel({ summary }: ForecastPanelProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-blue-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-200/70">Revenue forecast</p>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {[
          ["Weighted ARR", formatCurrency(summary.weighted_forecast)],
          ["Quarter forecast", formatCurrency(summary.quarter_forecast)],
          ["Best case", formatCurrency(summary.best_case)],
          ["Worst case", formatCurrency(summary.worst_case)],
          ["Expansion", formatCurrency(summary.expansion_pipeline)],
          ["Renewals", formatCurrency(summary.renewal_pipeline)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-2xl font-black text-white">{value}</p>
            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

