"use client";

import { useCustomerSuccess } from "@/lib/customer-success/use-customer-success";

const money = new Intl.NumberFormat("en-US", {
  currency: "USD",
  maximumFractionDigits: 0,
  style: "currency",
});

export function CustomerSuccessCommandCenter() {
  const { busyAction, live, loading, metrics, refresh, runQbr, testRisk } = useCustomerSuccess();

  return (
    <section className="rounded-[32px] border border-cyan-100/12 bg-[linear-gradient(135deg,rgba(5,12,26,0.92),rgba(103,232,249,0.08),rgba(245,158,11,0.06))] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.34)] backdrop-blur-2xl">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/58">
            Customer Success Command Center
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.055em] text-white">
            NRR {metrics?.NRR ?? live?.NRR ?? 0}% with {money.format(metrics?.expansion_pipeline ?? live?.expansion_pipeline ?? 0)} expansion pipeline
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/58">
            Retention, renewals, account health, support sentiment, and expansion motions unified into one success operating layer.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="rounded-full border border-cyan-200/22 bg-cyan-200/10 px-4 py-2 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-200/16"
            onClick={() => void refresh()}
            type="button"
          >
            {loading ? "Syncing..." : "Refresh"}
          </button>
          <button
            className="rounded-full border border-orange-200/24 bg-orange-200/12 px-4 py-2 text-sm font-semibold text-orange-50 transition hover:bg-orange-200/18 disabled:opacity-55"
            disabled={busyAction === "test-risk"}
            onClick={() => void testRisk(undefined, "silent_churn")}
            type="button"
          >
            {busyAction === "test-risk" ? "Running..." : "Simulate Risk"}
          </button>
          <button
            className="rounded-full border border-amber-200/24 bg-amber-200/12 px-4 py-2 text-sm font-semibold text-amber-50 transition hover:bg-amber-200/18 disabled:opacity-55"
            disabled={busyAction === "run-qbr"}
            onClick={() => void runQbr()}
            type="button"
          >
            {busyAction === "run-qbr" ? "Scheduling..." : "Run QBR"}
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-5">
        {[
          ["Health Avg", `${metrics?.health_average ?? 0}`, "0-100"],
          ["At-Risk ARR", money.format(metrics?.at_risk_revenue ?? 0), "protected"],
          ["Renewals", money.format(metrics?.renewal_pipeline ?? 0), "90d"],
          ["NPS", `${metrics?.NPS_average ?? 0}`, "avg"],
          ["CSAT", `${metrics?.CSAT_average ?? 0}%`, "support"],
        ].map(([label, value, note]) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4" key={label}>
            <p className="text-[0.62rem] uppercase tracking-[0.18em] text-white/40">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
            <p className="mt-1 text-xs text-cyan-50/56">{note}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
