import { formatCurrency, statusClass } from "@/lib/revenue/helpers";
import type { CustomerHealth as CustomerHealthType } from "@/lib/growth/types";

type CustomerHealthProps = {
  customers: CustomerHealthType[];
  busyAction: string | null;
  onSave: (customerId: string) => void;
};

export function CustomerHealth({ customers, busyAction, onSave }: CustomerHealthProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-emerald-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200/70">Customer health</p>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {customers.map((customer) => (
          <article key={customer.customer_id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-white">{customer.customer}</p>
                <p className="text-xs text-slate-500">{formatCurrency(customer.arr)} ARR · {customer.sentiment}</p>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase ${statusClass(customer.status)}`}>{customer.status}</span>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2 text-center">
              <div className="rounded-xl bg-white/[0.04] p-2">
                <p className="font-black text-white">{customer.adoption_score}</p>
                <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">adoption</p>
              </div>
              <div className="rounded-xl bg-white/[0.04] p-2">
                <p className="font-black text-white">{customer.risk_score}</p>
                <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">risk</p>
              </div>
              <div className="rounded-xl bg-white/[0.04] p-2">
                <p className="font-black text-white">{customer.nps}</p>
                <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">NPS</p>
              </div>
              <div className="rounded-xl bg-white/[0.04] p-2">
                <p className="font-black text-white">{customer.csat}</p>
                <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">CSAT</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-300">{customer.next_success_action}</p>
            <button
              type="button"
              onClick={() => onSave(customer.customer_id)}
              disabled={busyAction === `save-${customer.customer_id}`}
              className="mt-4 w-full rounded-2xl border border-emerald-300/25 bg-emerald-400/10 px-3 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-400/20 disabled:opacity-50"
            >
              Launch save playbook
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

