import { formatCurrency, formatCompact, percentOf } from "@/lib/revenue/helpers";
import type { QuotaMetric } from "@/lib/revenue/types";

type QuotaUsageCardProps = {
  usage: QuotaMetric[];
};

export function QuotaUsageCard({ usage }: QuotaUsageCardProps) {
  return (
    <article className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-blue-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-200/70">Usage billing engine</p>
      <div className="mt-4 grid gap-3">
        {usage.map((metric) => {
          const percent = percentOf(metric.used, metric.included);
          return (
            <div key={metric.key} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{metric.label}</p>
                  <p className="text-xs text-slate-500">
                    {formatCompact(metric.used)} / {formatCompact(metric.included)} {metric.unit}
                  </p>
                </div>
                <p className="text-sm font-black text-emerald-100">{metric.overage_estimate > 0 ? formatCurrency(metric.overage_estimate) : "No overage"}</p>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-blue-400 to-emerald-300" style={{ width: `${percent}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}

