import { formatCurrency } from "@/lib/revenue/helpers";
import type { InvestorSummary } from "@/lib/investor/types";

type ValuationCardProps = {
  summary: InvestorSummary;
  valuation: Record<string, unknown> | null;
};

function numberValue(source: Record<string, unknown> | null, key: string, fallback: number) {
  const value = source?.[key];
  return typeof value === "number" ? value : fallback;
}

export function ValuationCard({ summary, valuation }: ValuationCardProps) {
  const cases = [
    ["Conservative", numberValue(valuation, "conservative_valuation", summary.conservative_valuation)],
    ["Base", numberValue(valuation, "base_valuation", summary.base_valuation)],
    ["Aggressive", numberValue(valuation, "aggressive_valuation", summary.aggressive_valuation)],
  ];

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Valuation engine</p>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {cases.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-black text-white">{formatCurrency(Number(value))}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4">
        <p className="text-sm leading-6 text-emerald-50">
          ARR, growth, gross margin, NRR, AI moat premium, government premium, market premium, and risk discount support
          a base valuation of {formatCurrency(summary.base_valuation)}.
        </p>
      </div>
    </section>
  );
}

