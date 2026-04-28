import { formatCurrency } from "@/lib/master/runtime";
import type { MasterBoardSummary } from "@/lib/master/types";

export function RunwayMeter({ summary }: { summary: MasterBoardSummary }) {
  const runwayPercent = Math.min(100, Math.round((summary.runway_months / 36) * 100));

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-amber-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-200/70">Finance Command</p>
      <h2 className="mt-2 text-2xl font-black text-white">Runway Meter</h2>
      <div className="mt-5 rounded-[2rem] border border-amber-300/20 bg-amber-300/10 p-5 text-center">
        <p className="text-6xl font-black text-white">{summary.runway_months}</p>
        <p className="mt-1 text-sm uppercase tracking-[0.28em] text-amber-100/70">months runway</p>
        <div className="mt-5 h-3 overflow-hidden rounded-full bg-black/30">
          <div className="h-full rounded-full bg-amber-300 shadow-[0_0_24px_rgba(252,211,77,0.5)]" style={{ width: `${runwayPercent}%` }} />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Burn</p>
          <p className="mt-2 text-xl font-black text-white">{formatCurrency(summary.burn_monthly)}/mo</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Expansion</p>
          <p className="mt-2 text-xl font-black text-emerald-200">{formatCurrency(summary.expansion_pipeline)}</p>
        </div>
      </div>
    </section>
  );
}

