import { formatCurrency } from "@/lib/revenue/helpers";
import type { FunnelStageMetric } from "@/lib/growth/types";

type FunnelChartProps = {
  stages: FunnelStageMetric[];
};

export function FunnelChart({ stages }: FunnelChartProps) {
  const maxCount = Math.max(...stages.map((stage) => stage.count), 1);
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-blue-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-200/70">Funnel analytics</p>
      <div className="mt-5 space-y-3">
        {stages.map((stage) => (
          <div key={stage.stage} className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-white">{stage.stage}</p>
                <p className="text-xs text-slate-500">{stage.count.toLocaleString()} records · {formatCurrency(stage.revenue_value)}</p>
              </div>
              <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs font-black text-cyan-100">{stage.conversion_rate}% CVR</span>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-300 to-emerald-300" style={{ width: `${(stage.count / maxCount) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

