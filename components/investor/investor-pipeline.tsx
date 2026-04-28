import { formatCurrency } from "@/lib/revenue/helpers";
import type { InvestorRecord } from "@/lib/investor/types";

type InvestorPipelineProps = {
  investors: InvestorRecord[];
  busyAction: string | null;
  onUpdateFund: (investorId: string, status: string) => void;
};

export function InvestorPipeline({ investors, busyAction, onUpdateFund }: InvestorPipelineProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-blue-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-200/70">Investor CRM</p>
      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        {investors.map((investor) => (
          <article key={investor.investor_id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-white">{investor.fund_name}</p>
                <p className="text-xs text-slate-500">
                  {investor.partner_name} - {investor.stage_fit}
                </p>
              </div>
              <span className="rounded-full border border-cyan-300/25 bg-cyan-400/10 px-3 py-1 text-xs font-black uppercase text-cyan-100">
                {investor.status}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-white/[0.04] p-2">
                <p className="font-black text-white">{formatCurrency(investor.check_size)}</p>
                <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">check</p>
              </div>
              <div className="rounded-xl bg-white/[0.04] p-2">
                <p className="font-black text-emerald-100">{investor.interest_score}</p>
                <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">fit</p>
              </div>
              <div className="rounded-xl bg-white/[0.04] p-2">
                <p className="font-black text-cyan-100">{investor.probability_to_invest}%</p>
                <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">probability</p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              {investor.thesis_fit} via {investor.warm_intro}.
            </p>
            <button
              type="button"
              onClick={() => onUpdateFund(investor.investor_id, investor.status === "term sheet" ? "won" : "partner meeting")}
              disabled={busyAction === `fund-${investor.investor_id}`}
              className="mt-4 w-full rounded-2xl border border-blue-300/25 bg-blue-400/10 px-4 py-2 text-sm font-semibold text-blue-100 transition hover:bg-blue-400/20 disabled:opacity-50"
            >
              Advance investor
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

