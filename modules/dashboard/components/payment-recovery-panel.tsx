"use client";

import { useBilling } from "@/lib/billing/use-billing";

export function PaymentRecoveryPanel() {
  const { busyAction, me, testWebhook } = useBilling();
  const recovery = me?.payment_recovery;

  return (
    <section className="rounded-[30px] border border-white/10 bg-[rgba(5,10,20,0.76)] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/54">
        Payment Recovery
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
        Failed payment grace periods and collection recovery
      </h2>
      <div className="mt-5 rounded-[24px] border border-white/10 bg-white/[0.045] p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-lg font-semibold capitalize text-white">{recovery?.state ?? "syncing"}</p>
            <p className="mt-2 text-sm leading-6 text-white/56">{recovery?.message ?? "Billing recovery state is loading."}</p>
          </div>
          <span className="rounded-full border border-amber-200/20 bg-amber-200/10 px-4 py-2 text-sm font-semibold text-amber-50">
            Grace {recovery?.grace_period_days ?? 0}d
          </span>
        </div>
      </div>
      <button
        className="mt-5 rounded-full border border-red-200/18 bg-red-300/8 px-4 py-2 text-sm font-semibold text-red-50 transition hover:bg-red-300/14 disabled:opacity-50"
        disabled={busyAction === "webhook"}
        onClick={() => void testWebhook("invoice.payment_failed")}
        type="button"
      >
        {busyAction === "webhook" ? "Simulating..." : "Simulate Failed Payment"}
      </button>
    </section>
  );
}
