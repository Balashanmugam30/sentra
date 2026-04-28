import { formatCurrency, statusClass } from "@/lib/revenue/helpers";
import type { RenewalEvent } from "@/lib/revenue/types";

type RenewalCalendarProps = {
  renewals: RenewalEvent[];
};

export function RenewalCalendar({ renewals }: RenewalCalendarProps) {
  return (
    <article className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-amber-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-200/70">Renewal calendar</p>
      <div className="mt-4 space-y-3">
        {renewals.map((renewal) => (
          <div key={renewal.tenant_id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-white">{renewal.customer}</p>
                <p className="text-xs text-slate-500">{renewal.renewal_date} by {renewal.owner}</p>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase ${statusClass(renewal.risk)}`}>{renewal.risk}</span>
            </div>
            <p className="mt-3 text-xl font-black text-white">{formatCurrency(renewal.amount)}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

