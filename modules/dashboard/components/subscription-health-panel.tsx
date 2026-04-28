"use client";

import { useBilling } from "@/lib/billing/use-billing";

export function SubscriptionHealthPanel() {
  const { busyAction, cancel, me, reactivate } = useBilling();
  const subscription = me?.subscription;

  return (
    <section className="rounded-[30px] border border-white/10 bg-[rgba(5,10,20,0.76)] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/54">
        Subscription Health
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
        Renewal, status, payment method, and plan posture
      </h2>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {[
          ["Status", subscription?.billing_status ?? "--"],
          ["Renewal", subscription?.renewal_date ? new Date(subscription.renewal_date).toLocaleDateString() : "--"],
          ["Payment", subscription?.payment_method_status ?? "--"],
        ].map(([label, value]) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4" key={label}>
            <p className="text-[0.62rem] uppercase tracking-[0.18em] text-white/40">{label}</p>
            <p className="mt-2 text-lg font-semibold capitalize text-white">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <button
          className="rounded-full border border-red-200/18 bg-red-300/8 px-4 py-2 text-sm font-semibold text-red-50 transition hover:bg-red-300/14 disabled:opacity-50"
          disabled={busyAction === "cancel" || subscription?.cancel_at_period_end}
          onClick={() => void cancel()}
          type="button"
        >
          {busyAction === "cancel" ? "Scheduling..." : "Cancel at Renewal"}
        </button>
        <button
          className="rounded-full border border-cyan-200/22 bg-cyan-200/10 px-4 py-2 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-200/16 disabled:opacity-50"
          disabled={busyAction === "reactivate" || !subscription?.cancel_at_period_end}
          onClick={() => void reactivate()}
          type="button"
        >
          {busyAction === "reactivate" ? "Reactivating..." : "Reactivate"}
        </button>
      </div>
    </section>
  );
}
