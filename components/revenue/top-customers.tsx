import { formatCurrency, statusClass } from "@/lib/revenue/helpers";
import type { RevenueCustomer } from "@/lib/revenue/types";

type TopCustomersProps = {
  customers: RevenueCustomer[];
};

export function TopCustomers({ customers }: TopCustomersProps) {
  return (
    <article className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-slate-950/30 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Top accounts</p>
      <div className="mt-4 space-y-3">
        {customers.map((customer, index) => (
          <div key={customer.tenant_id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-white">#{index + 1} {customer.customer}</p>
                <p className="text-xs text-slate-500">{customer.plan} · {customer.executive_owner}</p>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase ${statusClass(customer.renewal_risk)}`}>{customer.renewal_risk}</span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-white/[0.04] p-2">
                <p className="font-black text-white">{formatCurrency(customer.arr)}</p>
                <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">ARR</p>
              </div>
              <div className="rounded-xl bg-white/[0.04] p-2">
                <p className="font-black text-emerald-100">+{customer.growth_rate}%</p>
                <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">growth</p>
              </div>
              <div className="rounded-xl bg-white/[0.04] p-2">
                <p className="font-black text-cyan-100">{customer.usage_score}</p>
                <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">usage</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

