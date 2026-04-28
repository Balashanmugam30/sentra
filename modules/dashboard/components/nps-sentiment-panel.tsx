"use client";

import { useCustomerSuccess } from "@/lib/customer-success/use-customer-success";

export function NpsSentimentPanel() {
  const { metrics, support } = useCustomerSuccess();

  return (
    <section className="rounded-[30px] border border-white/10 bg-[rgba(5,10,20,0.78)] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/54">
        NPS / CSAT / Sentiment
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
        Customer sentiment and silent dissatisfaction detection
      </h2>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div className="rounded-[24px] border border-cyan-200/12 bg-cyan-200/6 p-5">
          <p className="text-[0.62rem] uppercase tracking-[0.18em] text-white/40">NPS Average</p>
          <p className="mt-2 text-5xl font-semibold tracking-[-0.06em] text-white">{metrics?.NPS_average ?? 0}</p>
        </div>
        <div className="rounded-[24px] border border-amber-200/12 bg-amber-200/6 p-5">
          <p className="text-[0.62rem] uppercase tracking-[0.18em] text-white/40">CSAT Average</p>
          <p className="mt-2 text-5xl font-semibold tracking-[-0.06em] text-white">{metrics?.CSAT_average ?? 0}%</p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {(support?.accounts ?? []).slice(0, 6).map((account, index) => (
          <div className="rounded-[18px] border border-white/10 bg-white/[0.045] p-3" key={`${account.tenant_id}-${account.NPS_score}-${index}`}>
            <p className="text-sm font-semibold text-white">{account.workspace_name}</p>
            <p className="mt-1 text-xs text-white/45">
              NPS {account.NPS_score} - CSAT {account.CSAT_score}% - {account.support_sentiment}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
