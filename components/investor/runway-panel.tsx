import { formatCurrency } from "@/lib/revenue/helpers";
import type { InvestorSummary } from "@/lib/investor/types";

type RunwayPanelProps = {
  summary: InvestorSummary;
  runway: Record<string, unknown> | null;
  busyAction: string | null;
  onAddCash: () => void;
};

function scenarios(runway: Record<string, unknown> | null) {
  const value = runway?.scenarios;
  return Array.isArray(value) ? (value.slice(0, 4) as Array<Record<string, unknown>>) : [];
}

export function RunwayPanel({ summary, runway, busyAction, onAddCash }: RunwayPanelProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-emerald-950/20 backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200/70">Runway engine</p>
          <p className="mt-3 text-5xl font-black text-white">{summary.runway_months}mo</p>
          <p className="mt-2 text-sm text-slate-400">
            Cash {formatCurrency(summary.cash_on_hand)} - Burn {formatCurrency(summary.monthly_burn)}/mo
          </p>
        </div>
        <button
          type="button"
          onClick={onAddCash}
          disabled={busyAction === "add-cash"}
          className="rounded-2xl border border-emerald-300/30 bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-100 disabled:opacity-60"
        >
          Add $2M
        </button>
      </div>
      <div className="mt-4 grid gap-3">
        {scenarios(runway).map((scenario) => (
          <article key={String(scenario.action)} className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold text-white">{String(scenario.action)}</p>
              <p className="text-xl font-black text-emerald-100">{String(scenario.runway_months)}mo</p>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-300">{String(scenario.impact)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

