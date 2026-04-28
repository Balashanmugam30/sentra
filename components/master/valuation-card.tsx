import { formatCurrency } from "@/lib/master/runtime";
import type { MasterBoardSummary } from "@/lib/master/types";

type ValuationCardProps = {
  summary: MasterBoardSummary;
  busyAction: string | null;
  onSimulate: (objective?: string) => void;
  onForecast: (scenario?: string) => void;
};

export function ValuationCard({ summary, busyAction, onSimulate, onForecast }: ValuationCardProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Investor Readiness</p>
      <h2 className="mt-2 text-2xl font-black text-white">Valuation Range</h2>
      <div className="mt-5 rounded-[2rem] border border-cyan-300/20 bg-cyan-300/10 p-5">
        <p className="text-5xl font-black text-white">{formatCurrency(summary.valuation_base)}</p>
        <p className="mt-2 text-sm text-cyan-100/75">Base valuation from ARR, growth, NRR, AI premium, and government readiness.</p>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button type="button" onClick={() => onSimulate("preserve_revenue")} disabled={busyAction === "valuation"} className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-3 text-sm font-bold text-cyan-50 transition hover:bg-cyan-300/20 disabled:opacity-50">
          {busyAction === "valuation" ? "Simulating..." : "Run valuation"}
        </button>
        <button type="button" onClick={() => onForecast("aggressive")} disabled={busyAction === "forecast"} className="rounded-2xl border border-emerald-300/30 bg-emerald-300/10 px-4 py-3 text-sm font-bold text-emerald-50 transition hover:bg-emerald-300/20 disabled:opacity-50">
          {busyAction === "forecast" ? "Forecasting..." : "Forecast ARR"}
        </button>
      </div>
    </section>
  );
}

