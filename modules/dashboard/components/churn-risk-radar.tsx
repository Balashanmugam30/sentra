"use client";

import { useCustomerSuccess } from "@/lib/customer-success/use-customer-success";

const money = new Intl.NumberFormat("en-US", {
  currency: "USD",
  maximumFractionDigits: 0,
  style: "currency",
});

export function ChurnRiskRadar() {
  const { churn } = useCustomerSuccess();

  return (
    <section className="rounded-[30px] border border-orange-100/12 bg-[linear-gradient(135deg,rgba(5,10,20,0.78),rgba(251,146,60,0.08))] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-orange-100/58">
        Churn Risk Radar
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
        At-risk revenue and AI save motions
      </h2>
      <div className="mt-5 grid gap-3 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-[24px] border border-white/10 bg-white/[0.045] p-5">
          <p className="text-[0.62rem] uppercase tracking-[0.18em] text-white/40">Revenue at risk</p>
          <p className="mt-2 text-4xl font-semibold tracking-[-0.06em] text-white">
            {money.format(churn?.revenue_at_risk ?? 0)}
          </p>
          <div className="mt-4 flex flex-col gap-2">
            {(churn?.top_causes ?? []).slice(0, 4).map((cause, index) => (
              <span className="rounded-full border border-orange-200/14 bg-orange-200/8 px-3 py-2 text-xs text-orange-50/76" key={`${cause}-${index}`}>
                {cause}
              </span>
            ))}
          </div>
        </div>
        <div className="grid gap-3">
          {(churn?.predictions ?? []).slice(0, 5).map((prediction, index) => (
            <article className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4" key={`${prediction.tenant_id}-${prediction.risk_percent}-${index}`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-white">{prediction.workspace_name}</h3>
                  <p className="mt-1 text-xs text-white/42">{prediction.top_causes[0]}</p>
                </div>
                <span className="text-2xl font-semibold text-orange-50">{prediction.risk_percent}%</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-white/10">
                <div className="h-full rounded-full bg-orange-300/80" style={{ width: `${prediction.risk_percent}%` }} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
