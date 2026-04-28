"use client";

import { useGrowth } from "@/lib/growth/use-growth";

const money = new Intl.NumberFormat("en-US", { currency: "USD", maximumFractionDigits: 0, style: "currency" });

function asNumber(value: unknown, fallback = 0) {
  return typeof value === "number" ? value : fallback;
}

export function GlobalRevenueForecast() {
  const { forecast, live } = useGrowth();
  const projected = asNumber(forecast?.projected_arr_12m, 31_700_000);

  return (
    <section className="rounded-[30px] border border-white/10 bg-[rgba(5,10,20,0.78)] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/54">Global Revenue Forecast</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">{money.format(projected)} projected ARR in 12 months</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {[
          ["Pipeline ARR", money.format(live?.pipeline_arr ?? 18_400_000)],
          ["Weighted", money.format(asNumber(forecast?.weighted_pipeline))],
          ["Countries Ready", `${asNumber(forecast?.countries_ready, 6)}`],
        ].map(([label, value]) => (
          <div className="rounded-[20px] border border-white/10 bg-white/[0.045] p-4" key={label}>
            <p className="text-[0.62rem] uppercase tracking-[0.18em] text-white/40">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

