"use client";

import { useBilling } from "@/lib/billing/use-billing";

export function ChurnRiskPanel() {
  const { revenue } = useBilling();
  const risk = revenue?.churn_percent ?? 0;

  return (
    <section className="rounded-[30px] border border-white/10 bg-[rgba(5,10,20,0.76)] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/54">
        Churn Intelligence
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
        Revenue retention and expansion pressure
      </h2>
      <div className="mt-5 rounded-[24px] border border-white/10 bg-white/[0.045] p-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-5xl font-semibold tracking-[-0.06em] text-white">{risk}%</p>
            <p className="mt-2 text-sm text-white/52">Projected churn risk</p>
          </div>
          <div className="rounded-full border border-cyan-200/16 bg-cyan-200/8 px-4 py-2 text-sm font-semibold text-cyan-50">
            NRR {revenue?.net_revenue_retention ?? 0}%
          </div>
        </div>
        <div className="mt-5 h-2 rounded-full bg-white/10">
          <div className="h-full rounded-full bg-amber-300/80" style={{ width: `${Math.min(100, risk * 10)}%` }} />
        </div>
      </div>
    </section>
  );
}
