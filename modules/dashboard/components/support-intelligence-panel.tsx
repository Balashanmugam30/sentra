"use client";

import { useCustomerSuccess } from "@/lib/customer-success/use-customer-success";

export function SupportIntelligencePanel() {
  const { support } = useCustomerSuccess();

  return (
    <section className="rounded-[30px] border border-white/10 bg-[rgba(5,10,20,0.78)] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/54">
        Support Intelligence Layer
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
        Tickets, SLA, escalations, and support sentiment
      </h2>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {[
          ["Escalations", `${support?.escalations_open ?? 0}`, "open priority items"],
          ["Avg Resolution", `${support?.avg_resolution_time ?? 0}h`, "across accounts"],
          ["Accounts", `${support?.accounts?.length ?? 0}`, "monitored"],
        ].map(([label, value, note]) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4" key={label}>
            <p className="text-[0.62rem] uppercase tracking-[0.18em] text-white/40">{label}</p>
            <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
            <p className="mt-1 text-xs text-cyan-50/56">{note}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {(support?.accounts ?? []).slice(0, 6).map((account, index) => (
          <article className="rounded-[20px] border border-white/10 bg-white/[0.045] p-4" key={`${account.tenant_id}-${account.ticket_volume}-${index}`}>
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold text-white">{account.workspace_name}</h3>
              <span className="text-sm text-cyan-50/68">{account.resolution_SLA}% SLA</span>
            </div>
            <p className="mt-2 text-xs text-white/44">
              {account.ticket_volume} tickets - {account.priority_escalations} escalations - sentiment {account.support_sentiment}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
