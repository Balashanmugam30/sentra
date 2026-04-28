import { formatCompact } from "@/lib/revenue/helpers";
import type { ForecastPoint } from "@/lib/revenue/types";

type ForecastChartProps = {
  forecast: ForecastPoint[];
};

export function ForecastChart({ forecast }: ForecastChartProps) {
  const maxValue = Math.max(...forecast.map((point) => point.aggressive), 1);
  return (
    <article className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-blue-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-200/70">12 month forecast</p>
      <div className="mt-5 grid gap-3">
        {forecast.slice(0, 12).map((point) => (
          <div key={point.month} className="grid grid-cols-[44px_1fr_64px] items-center gap-3 text-sm">
            <span className="font-semibold text-slate-400">{point.month}</span>
            <div className="h-3 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-300 to-emerald-300" style={{ width: `${(point.expected / maxValue) * 100}%` }} />
            </div>
            <span className="text-right font-black text-white">{formatCompact(point.expected)}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

