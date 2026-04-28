import { formatCurrency } from "@/lib/revenue/helpers";
import type { SalesDeal } from "@/lib/growth/types";

type PipelineBoardProps = {
  deals: SalesDeal[];
  busyAction: string | null;
  onMoveDeal: (dealId: string, stage: string) => void;
};

const stages = ["New", "Qualified", "Discovery", "Demo", "Proposal", "Security Review", "Negotiation", "Won", "Lost"];

export function PipelineBoard({ deals, busyAction, onMoveDeal }: PipelineBoardProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">CRM pipeline</p>
          <h2 className="mt-2 text-2xl font-black text-white">Enterprise deal board</h2>
        </div>
        <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-slate-300">{deals.length} active deals</span>
      </div>
      <div className="mt-5 grid gap-4 xl:grid-cols-3">
        {stages.slice(1, 8).map((stage) => {
          const stageDeals = deals.filter((deal) => deal.stage === stage);
          const stageValue = stageDeals.reduce((sum, deal) => sum + deal.arr_value, 0);
          return (
            <article key={stage} className="min-h-52 rounded-3xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center justify-between">
                <p className="font-black text-white">{stage}</p>
                <span className="text-xs text-slate-500">{formatCurrency(stageValue)}</span>
              </div>
              <div className="mt-4 space-y-3">
                {stageDeals.map((deal) => (
                  <div key={deal.deal_id} className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{deal.company}</p>
                        <p className="text-xs text-slate-500">{deal.industry} · {deal.owner}</p>
                      </div>
                      <span className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-2 py-1 text-xs font-black text-emerald-100">{deal.probability}%</span>
                    </div>
                    <p className="mt-3 text-xl font-black text-cyan-100">{formatCurrency(deal.arr_value)}</p>
                    <p className="mt-2 text-sm leading-5 text-slate-300">{deal.next_step}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {deal.risk_flags.map((flag) => (
                        <span key={flag} className="rounded-full border border-amber-300/20 bg-amber-400/10 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-amber-100">{flag}</span>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => onMoveDeal(deal.deal_id, stage === "Negotiation" ? "Won" : "Proposal")}
                      disabled={busyAction === `deal-${deal.deal_id}`}
                      className="mt-4 w-full rounded-2xl border border-cyan-300/25 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-400/20 disabled:opacity-50"
                    >
                      {stage === "Negotiation" ? "Mark won" : "Move to proposal"}
                    </button>
                  </div>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

