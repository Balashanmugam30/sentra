import { formatCurrency } from "@/lib/revenue/helpers";
import type { RevenuePlan } from "@/lib/revenue/types";

type UpgradeCenterProps = {
  plans: RevenuePlan[];
  currentPlanKey: string;
  busyAction: string | null;
  onUpgrade: (planKey: string) => void;
  onDowngrade: (planKey: string) => void;
};

export function UpgradeCenter({ plans, currentPlanKey, busyAction, onUpgrade, onDowngrade }: UpgradeCenterProps) {
  return (
    <article className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Upgrade paths</p>
      <div className="mt-4 grid gap-3 lg:grid-cols-5">
        {plans.map((plan) => {
          const isCurrent = plan.plan_key === currentPlanKey;
          const isStrategic = plan.plan_key === "government" || plan.plan_key === "custom_strategic";
          return (
            <div key={plan.plan_key} className={`rounded-3xl border p-4 ${isCurrent ? "border-emerald-300/40 bg-emerald-400/10" : "border-white/10 bg-black/20"}`}>
              <p className="text-lg font-black text-white">{plan.name}</p>
              <p className="mt-1 text-xs leading-5 text-slate-400">{plan.audience}</p>
              <p className="mt-4 text-2xl font-black text-cyan-100">{plan.monthly_price > 0 ? formatCurrency(plan.monthly_price) : "Custom"}</p>
              <p className="text-xs text-slate-500">{plan.support_tier}</p>
              <button
                type="button"
                onClick={() => (isCurrent ? undefined : isStrategic || plan.monthly_price >= 8_500 ? onUpgrade(plan.plan_key) : onDowngrade(plan.plan_key))}
                disabled={isCurrent || busyAction === "upgrade" || busyAction === "downgrade"}
                className="mt-4 w-full rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/15 disabled:opacity-40"
              >
                {isCurrent ? "Current" : isStrategic ? "Queue approval" : "Switch"}
              </button>
            </div>
          );
        })}
      </div>
    </article>
  );
}

