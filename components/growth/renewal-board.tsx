import { formatCurrency, statusClass } from "@/lib/revenue/helpers";
import type { RenewalSignal } from "@/lib/growth/types";

type RenewalBoardProps = {
  renewals: RenewalSignal[];
};

export function RenewalBoard({ renewals }: RenewalBoardProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-amber-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-200/70">Renewal engine</p>
      <div className="mt-4 space-y-3">
        {renewals.map((renewal) => (
          <article key={renewal.renewal_id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-white">{renewal.customer}</p>
                <p className="text-xs text-slate-500">{renewal.due_bucket} · {renewal.owner}</p>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase ${statusClass(renewal.risk)}`}>{renewal.risk}</span>
            </div>
            <p className="mt-3 text-xl font-black text-white">{formatCurrency(renewal.arr)}</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">{renewal.recommended_playbook}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

