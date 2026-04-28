import { formatCurrency } from "@/lib/master/runtime";
import type { MasterInvestor } from "@/lib/master/types";

export function InvestorPipeline({ investors }: { investors: MasterInvestor[] }) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-violet-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-violet-200/70">Capital Engine</p>
      <h2 className="mt-2 text-2xl font-black text-white">Investor Pipeline</h2>
      <div className="mt-5 space-y-3">
        {investors.map((investor) => (
          <article key={investor.investor_id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-black text-white">{investor.fund}</h3>
                <p className="mt-1 text-sm text-slate-400">{investor.fit} · {investor.stage.replaceAll("_", " ")}</p>
              </div>
              <p className="text-right text-lg font-black text-violet-200">{investor.conviction}%</p>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-violet-300" style={{ width: `${investor.conviction}%` }} />
            </div>
            <p className="mt-3 text-sm text-slate-300">{investor.next_action}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">Check size {formatCurrency(investor.check_size)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

