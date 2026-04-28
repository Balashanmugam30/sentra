import { formatCurrency } from "@/lib/revenue/helpers";
import type { ExpansionOpportunity } from "@/lib/growth/types";

type ExpansionPanelProps = {
  opportunities: ExpansionOpportunity[];
  busyAction: string | null;
  onExpand: (customerId: string) => void;
};

export function ExpansionPanel({ opportunities, busyAction, onExpand }: ExpansionPanelProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Expansion engine</p>
      <div className="mt-4 space-y-3">
        {opportunities.map((opportunity) => {
          const customerId = opportunity.opportunity_id.replace("EXP-", "");
          return (
            <article key={opportunity.opportunity_id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{opportunity.customer}</p>
                  <p className="text-xs text-slate-500">{opportunity.type} · {opportunity.confidence}% confidence</p>
                </div>
                <p className="text-xl font-black text-emerald-100">{formatCurrency(opportunity.potential_arr)}</p>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-300">{opportunity.trigger}</p>
              <button
                type="button"
                onClick={() => onExpand(customerId)}
                disabled={busyAction === `expand-${customerId}`}
                className="mt-4 rounded-2xl border border-cyan-300/25 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/20 disabled:opacity-50"
              >
                Launch expansion
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

