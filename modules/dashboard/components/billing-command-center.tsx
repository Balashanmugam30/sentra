"use client";

import { useBilling } from "@/lib/billing/use-billing";

const money = new Intl.NumberFormat("en-US", {
  currency: "USD",
  maximumFractionDigits: 0,
  style: "currency",
});

export function BillingCommandCenter() {
  const { busyAction, createPortal, me, refresh, revenue } = useBilling();
  const subscription = me?.subscription;

  return (
    <section className="rounded-[30px] border border-cyan-100/12 bg-[linear-gradient(135deg,rgba(5,12,26,0.9),rgba(103,232,249,0.08),rgba(245,158,11,0.08))] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.32)] backdrop-blur-2xl">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/58">
            Revenue Command System
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.055em] text-white">
            {subscription?.organization_name ?? "Tenant"} billing is {subscription?.billing_status ?? "syncing"}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/58">
            Stripe-ready subscription control with tenant entitlements, invoices, failed-payment recovery, and executive SaaS metrics.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="rounded-full border border-cyan-200/22 bg-cyan-200/10 px-4 py-2 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-200/16"
            onClick={() => void refresh()}
            type="button"
          >
            Refresh
          </button>
          <button
            className="rounded-full border border-amber-200/24 bg-amber-200/12 px-4 py-2 text-sm font-semibold text-amber-50 transition hover:bg-amber-200/18 disabled:opacity-55"
            disabled={busyAction === "portal"}
            onClick={() => void createPortal()}
            type="button"
          >
            {busyAction === "portal" ? "Opening..." : "Billing Portal"}
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-4">
        {[
          ["MRR", money.format(revenue?.mrr ?? subscription?.monthly_mrr ?? 0)],
          ["ARR", money.format(revenue?.arr ?? subscription?.annual_value ?? 0)],
          ["Plan", subscription?.plan ?? "--"],
          ["Provider", me?.provider === "stripe" ? "Stripe live" : "Demo safe"],
        ].map(([label, value]) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4" key={label}>
            <p className="text-[0.62rem] uppercase tracking-[0.18em] text-white/40">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
