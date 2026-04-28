"use client";

import { useCrm } from "@/lib/crm/use-crm";

const money = new Intl.NumberFormat("en-US", {
  currency: "USD",
  maximumFractionDigits: 0,
  style: "currency",
});

export function GrowthMetricsPanel() {
  const { metrics } = useCrm();

  return (
    <section className="rounded-[30px] border border-white/10 bg-[rgba(5,10,20,0.78)] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/54">
        Growth Metrics
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
        CAC, LTV, velocity, payback, and expansion intelligence
      </h2>
      <div className="mt-5 grid gap-3 md:grid-cols-4">
        {[
          ["CAC", money.format(metrics?.CAC ?? 0), "acquisition"],
          ["LTV", money.format(metrics?.LTV ?? 0), "lifetime"],
          ["LTV/CAC", `${metrics?.LTV_CAC ?? 0}x`, "efficiency"],
          ["Lead Velocity", `${metrics?.Lead_Velocity ?? 0}%`, "growth"],
          ["Conversion", `${metrics?.Conversion_Rate ?? 0}%`, "qualified"],
          ["Pipeline Velocity", money.format(metrics?.Pipeline_Velocity ?? 0), "weighted"],
          ["Churn Impact", `${metrics?.Churn_Impact ?? 0}%`, "risk"],
          ["Expansion", money.format(metrics?.Expansion_Potential ?? 0), "upsell"],
        ].map(([label, value, note]) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4" key={label}>
            <p className="text-[0.62rem] uppercase tracking-[0.18em] text-white/40">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
            <p className="mt-1 text-xs text-cyan-50/56">{note}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-[24px] border border-cyan-200/12 bg-cyan-200/6 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-50/55">AI Growth Recommendations</p>
        <div className="mt-3 grid gap-2 md:grid-cols-3">
          {(metrics?.ai_recommendations ?? []).map((recommendation, index) => (
            <p className="rounded-[18px] border border-white/10 bg-white/[0.045] p-3 text-sm leading-6 text-white/62" key={`${recommendation}-${index}`}>
              {recommendation}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
