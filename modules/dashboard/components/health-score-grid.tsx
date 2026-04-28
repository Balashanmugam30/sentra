"use client";

import { useCustomerSuccess } from "@/lib/customer-success/use-customer-success";

function statusClass(status: string) {
  if (status === "healthy") return "border-cyan-200/18 bg-cyan-200/8 text-cyan-50";
  if (status === "watch") return "border-amber-200/18 bg-amber-200/8 text-amber-50";
  return "border-orange-200/20 bg-orange-200/10 text-orange-50";
}

export function HealthScoreGrid() {
  const { health } = useCustomerSuccess();

  return (
    <section className="rounded-[30px] border border-white/10 bg-[rgba(5,10,20,0.78)] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/54">
        Customer Health Intelligence
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
        Product adoption, sentiment, support, and renewal health
      </h2>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {(health?.accounts ?? []).map((account, index) => (
          <article className="rounded-[24px] border border-white/10 bg-white/[0.045] p-4" key={`${account.tenant_id}-${account.health_score}-${index}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-white">{account.workspace_name}</h3>
                <p className="mt-1 text-xs text-white/42">Trend: {account.trend}</p>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(account.status)}`}>
                {account.status}
              </span>
            </div>
            <p className="mt-4 text-4xl font-semibold tracking-[-0.06em] text-white">{account.health_score}</p>
            <div className="mt-3 h-2 rounded-full bg-white/10">
              <div className="h-full rounded-full bg-cyan-300/80" style={{ width: `${account.health_score}%` }} />
            </div>
            <p className="mt-3 text-xs leading-5 text-white/52">{account.drivers[0] ?? "Stable account motion"}</p>
            {account.risks[0] ? <p className="mt-2 text-xs leading-5 text-orange-100/68">{account.risks[0]}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}
