"use client";

import { useTenant } from "@/lib/tenant/use-tenant";

export function PlanEntitlementsPanel() {
  const { plans } = useTenant();

  return (
    <section className="rounded-[30px] border border-white/10 bg-[rgba(5,10,20,0.76)] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/54">
        Plan Entitlements
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
        Starter, Business, Enterprise, and Government plans
      </h2>
      <div className="mt-5 grid gap-4 xl:grid-cols-4">
        {(plans?.plans ?? []).map((plan) => (
          <article
            className={`rounded-[24px] border p-4 ${
              plan.plan_name === plans?.current_plan?.plan_name
                ? "border-cyan-200/28 bg-cyan-200/10"
                : "border-white/10 bg-white/[0.045]"
            }`}
            key={plan.plan_name}
          >
            <p className="text-lg font-semibold text-white">{plan.plan_name}</p>
            <p className="mt-2 text-sm leading-6 text-white/56">{plan.description}</p>
            <p className="mt-4 text-xs uppercase tracking-[0.16em] text-cyan-50">{plan.seats_limit} seats</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {plan.modules_enabled.slice(0, 4).map((module) => (
                <span className="rounded-full border border-white/10 bg-black/18 px-2 py-1 text-xs text-white/58" key={`${plan.plan_name}-${module}`}>
                  {module.replaceAll("_", " ")}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
