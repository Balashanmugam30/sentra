"use client";

import { useBilling } from "@/lib/billing/use-billing";
import type { BillingPlanKey } from "@/lib/billing/types";

const money = new Intl.NumberFormat("en-US", {
  currency: "USD",
  maximumFractionDigits: 0,
  style: "currency",
});

export function PlanSelectorPanel() {
  const { busyAction, changePlan, createCheckout, me, plans } = useBilling();
  const currentPlan = me?.subscription?.plan;

  return (
    <section className="rounded-[30px] border border-white/10 bg-[rgba(5,10,20,0.76)] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/54">
        Plan Selector
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
        Upgrade, downgrade, or launch hosted checkout
      </h2>
      <div className="mt-5 grid gap-4 xl:grid-cols-4">
        {(plans?.plans ?? []).map((plan) => {
          const active = plan.plan_key === currentPlan;
          return (
            <article
              className={`rounded-[24px] border p-4 transition ${
                active ? "border-cyan-200/30 bg-cyan-200/10" : "border-white/10 bg-white/[0.045]"
              }`}
              key={plan.plan_key}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-lg font-semibold text-white">{plan.name}</p>
                {active ? (
                  <span className="rounded-full border border-cyan-200/20 bg-cyan-200/10 px-2 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-cyan-50">
                    Current
                  </span>
                ) : null}
              </div>
              <p className="mt-3 text-3xl font-semibold text-white">{money.format(plan.monthly_price)}</p>
              <p className="mt-1 text-xs text-white/44">per month / {plan.seat_limit.toLocaleString()} seats</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {plan.modules_enabled.slice(0, 3).map((module) => (
                  <span className="rounded-full border border-white/10 bg-black/18 px-2 py-1 text-xs text-white/58" key={`${plan.plan_key}-${module}`}>
                    {module.replaceAll("_", " ")}
                  </span>
                ))}
              </div>
              <div className="mt-5 grid gap-2">
                <button
                  className="rounded-full border border-cyan-200/22 bg-cyan-200/10 px-3 py-2 text-xs font-semibold text-cyan-50 transition hover:bg-cyan-200/16 disabled:opacity-50"
                  disabled={active || busyAction === `plan-${plan.plan_key}`}
                  onClick={() => void changePlan(plan.plan_key as BillingPlanKey)}
                  type="button"
                >
                  {busyAction === `plan-${plan.plan_key}` ? "Updating..." : active ? "Active Plan" : "Change Plan"}
                </button>
                <button
                  className="rounded-full border border-amber-200/18 bg-amber-200/8 px-3 py-2 text-xs font-semibold text-amber-50 transition hover:bg-amber-200/14 disabled:opacity-50"
                  disabled={busyAction === `checkout-${plan.plan_key}`}
                  onClick={() => void createCheckout({ plan: plan.plan_key as BillingPlanKey })}
                  type="button"
                >
                  {busyAction === `checkout-${plan.plan_key}` ? "Creating..." : "Hosted Checkout"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
