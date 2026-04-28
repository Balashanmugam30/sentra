"use client";

import { useCustomerSuccess } from "@/lib/customer-success/use-customer-success";

const money = new Intl.NumberFormat("en-US", {
  currency: "USD",
  maximumFractionDigits: 0,
  style: "currency",
});

export function AccountRescueWarRoom() {
  const { busyAction, churn, saveAccount } = useCustomerSuccess();
  const risky = (churn?.predictions ?? []).filter((prediction) => prediction.risk_percent >= 50).slice(0, 5);

  return (
    <section className="rounded-[30px] border border-orange-100/12 bg-[linear-gradient(135deg,rgba(5,10,20,0.78),rgba(251,146,60,0.08))] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-orange-100/58">
        Account Rescue War Room
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
        Revenue protection motions for at-risk customers
      </h2>
      <div className="mt-5 grid gap-3">
        {risky.map((account, index) => (
          <article className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4" key={`${account.tenant_id}-${account.risk_percent}-${index}`}>
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">{account.workspace_name}</h3>
                <p className="mt-1 text-xs text-white/42">
                  {account.risk_percent}% churn risk - {money.format(account.estimated_revenue_at_risk)} at risk
                </p>
              </div>
              <button
                className="rounded-full border border-orange-200/18 bg-orange-200/10 px-4 py-2 text-sm font-semibold text-orange-50 transition hover:bg-orange-200/16 disabled:opacity-50"
                disabled={busyAction === "save-account"}
                onClick={() => void saveAccount(account.tenant_id)}
                type="button"
              >
                {busyAction === "save-account" ? "Saving..." : "Launch save plan"}
              </button>
            </div>
            <div className="mt-4 grid gap-2 md:grid-cols-2">
              {account.save_actions.slice(0, 4).map((action, actionIndex) => (
                <p className="rounded-[16px] border border-white/10 bg-black/18 p-3 text-xs leading-5 text-white/54" key={`${account.tenant_id}-save-${actionIndex}`}>
                  {action}
                </p>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
