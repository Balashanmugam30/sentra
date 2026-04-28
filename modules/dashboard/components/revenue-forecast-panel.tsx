"use client";

import { useCrm } from "@/lib/crm/use-crm";

const money = new Intl.NumberFormat("en-US", {
  currency: "USD",
  maximumFractionDigits: 0,
  style: "currency",
});

export function RevenueForecastPanel() {
  const { forecast } = useCrm();

  return (
    <section className="rounded-[30px] border border-white/10 bg-[rgba(5,10,20,0.78)] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/54">
        Revenue Forecast
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
        ARR, MRR, likely closes, and sales-cycle intelligence
      </h2>
      <div className="mt-5 grid gap-3 md:grid-cols-4">
        {[
          ["ARR Projection", money.format(forecast?.ARR_projection ?? 0), "weighted"],
          ["MRR Projection", money.format(forecast?.MRR_projection ?? 0), "monthly"],
          ["Win Rate", `${forecast?.win_rate ?? 0}%`, "historical"],
          ["Sales Cycle", `${forecast?.sales_cycle_days ?? 0}d`, "average"],
        ].map(([label, value, note]) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4" key={label}>
            <p className="text-[0.62rem] uppercase tracking-[0.18em] text-white/40">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
            <p className="mt-1 text-xs text-cyan-50/56">{note}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {(forecast?.likely_closes ?? []).slice(0, 6).map((deal, index) => (
          <div className="rounded-[20px] border border-cyan-200/12 bg-cyan-200/6 p-4" key={`${deal.id}-${deal.expected_close_date}-${index}`}>
            <div className="flex items-center justify-between gap-3 text-xs text-white/48">
              <span>{deal.company_name}</span>
              <span>{deal.probability}%</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-white/10">
              <div className="h-full rounded-full bg-cyan-300/75" style={{ width: `${deal.probability}%` }} />
            </div>
            <p className="mt-2 text-sm font-semibold text-white">{money.format(deal.value)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
