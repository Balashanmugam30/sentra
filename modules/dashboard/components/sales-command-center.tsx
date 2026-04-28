"use client";

import { useCrm } from "@/lib/crm/use-crm";

const money = new Intl.NumberFormat("en-US", {
  currency: "USD",
  maximumFractionDigits: 0,
  style: "currency",
});

export function SalesCommandCenter() {
  const { busyAction, createLead, deals, forecast, leads, loading, metrics, refresh } = useCrm();
  const totalPipeline = deals?.deals?.reduce((sum, deal) => sum + deal.value, 0) ?? 0;
  const activeReps = new Set([
    ...(leads?.leads?.map((lead) => lead.owner) ?? []),
    ...(deals?.deals?.map((deal) => deal.owner) ?? []),
  ]).size;
  const closingThisMonth = forecast?.likely_closes?.length ?? 0;
  const quotaAttainment = Math.min(100, Math.round(((forecast?.weighted_pipeline ?? 0) / 1_200_000) * 100));

  return (
    <section className="rounded-[32px] border border-cyan-100/12 bg-[linear-gradient(135deg,rgba(5,12,26,0.92),rgba(103,232,249,0.08),rgba(245,158,11,0.06))] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.34)] backdrop-blur-2xl">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/58">
            Sales Command Center
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.055em] text-white">
            Enterprise pipeline is {money.format(forecast?.weighted_pipeline ?? 0)} weighted
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/58">
            CRM command layer for lead velocity, demos, founder-led deal rescue, and recurring revenue growth.
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
            className="rounded-full border border-amber-200/24 bg-amber-200/12 px-4 py-2 text-sm font-semibold text-amber-50 transition hover:bg-amber-200/18 disabled:opacity-55"
            disabled={busyAction === "lead-create"}
            onClick={() =>
              void createLead({
                company_name: "Phoenix Logistics Command",
                contact_name: "Ava Stone",
                email: "ava@phoenixlogistics.example",
                role: "Chief Safety Officer",
                industry: "enterprise",
                country: "United States",
                company_size: "12,000",
                source: "inbound",
                status: "qualified",
                notes: "Board budget signal, urgent crisis readiness pilot requested.",
                deal_value_estimate: 210_000,
              })
            }
            type="button"
          >
            {busyAction === "lead-create" ? "Creating..." : "Create Demo Lead"}
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-5">
        {[
          ["Total Pipeline", money.format(totalPipeline), "gross"],
          ["Weighted", money.format(forecast?.weighted_pipeline ?? 0), "forecast"],
          ["Closing", String(closingThisMonth), "this month"],
          ["Active Reps", String(activeReps), "owners"],
          ["Quota", `${quotaAttainment}%`, `LTV/CAC ${metrics?.LTV_CAC ?? 0}`],
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
