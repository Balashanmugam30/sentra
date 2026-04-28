import { formatCurrency } from "@/lib/revenue/helpers";
import type { RevenueSummary } from "@/lib/revenue/types";

type MrrChartProps = {
  summary: RevenueSummary;
};

export function MrrChart({ summary }: MrrChartProps) {
  const maxMrr = Math.max(...summary.growth_trend.map((point) => point.mrr), 1);
  return (
    <article className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-emerald-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200/70">Revenue KPIs</p>
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        {[
          ["MRR", formatCurrency(summary.mrr)],
          ["ARR", formatCurrency(summary.arr)],
          ["NRR", `${summary.net_revenue_retention}%`],
          ["Churn", `${summary.churn_percent}%`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-2xl font-black text-white">{value}</p>
            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">{label}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 flex h-40 items-end gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
        {summary.growth_trend.map((point) => (
          <div key={point.period} className="flex flex-1 flex-col items-center gap-2">
            <div className="w-full rounded-t-2xl bg-gradient-to-t from-emerald-500 to-cyan-300" style={{ height: `${Math.max(12, (point.mrr / maxMrr) * 100)}%` }} />
            <span className="text-xs text-slate-500">{point.period}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

