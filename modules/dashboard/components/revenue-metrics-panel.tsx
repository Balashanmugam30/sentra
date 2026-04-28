"use client";

import { useBilling } from "@/lib/billing/use-billing";

const money = new Intl.NumberFormat("en-US", {
  currency: "USD",
  maximumFractionDigits: 0,
  style: "currency",
});

export function RevenueMetricsPanel() {
  const { revenue } = useBilling();

  return (
    <section className="rounded-[30px] border border-white/10 bg-[rgba(5,10,20,0.76)] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/54">
        Executive Revenue Metrics
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
        MRR, ARR, retention, expansion, and collections
      </h2>
      <div className="mt-5 grid gap-3 md:grid-cols-4">
        {[
          ["MRR", money.format(revenue?.mrr ?? 0), "+12%"],
          ["ARR", money.format(revenue?.arr ?? 0), "+18%"],
          ["NRR", `${revenue?.net_revenue_retention ?? 0}%`, "dominant"],
          ["Failed payments", `${revenue?.failed_payments ?? 0}`, "recovering"],
          ["ARPU", money.format(revenue?.arpu ?? 0), "healthy"],
          ["LTV", money.format(revenue?.ltv ?? 0), "enterprise"],
          ["Expansion MRR", money.format(revenue?.expansion_mrr ?? 0), "+growth"],
          ["Churn", `${revenue?.churn_percent ?? 0}%`, "watch"],
        ].map(([label, value, note]) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4" key={label}>
            <p className="text-[0.62rem] uppercase tracking-[0.18em] text-white/40">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
            <p className="mt-1 text-xs text-cyan-50/58">{note}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {(revenue?.trend ?? []).map((item) => (
          <div className="rounded-[20px] border border-cyan-200/12 bg-cyan-200/6 p-4" key={item.period}>
            <div className="flex items-center justify-between text-xs text-white/48">
              <span>{item.period}</span>
              <span>{money.format(item.arr)} ARR</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-white/10">
              <div className="h-full rounded-full bg-cyan-300/75" style={{ width: `${Math.min(100, (item.mrr / Math.max(1, revenue?.mrr ?? item.mrr)) * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
