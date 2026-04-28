"use client";

import { useCustomerSuccess } from "@/lib/customer-success/use-customer-success";

const money = new Intl.NumberFormat("en-US", {
  currency: "USD",
  maximumFractionDigits: 0,
  style: "currency",
});

export function RenewalPipelinePanel() {
  const { renewals } = useCustomerSuccess();

  return (
    <section className="rounded-[30px] border border-white/10 bg-[rgba(5,10,20,0.78)] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/54">
        Renewal Command Center
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
        Renewal pipeline by urgency window
      </h2>
      <div className="mt-5 grid gap-3 md:grid-cols-6">
        {["due_in_90d", "due_in_60d", "due_in_30d", "due_in_14d", "due_this_week", "overdue"].map((bucket) => (
          <div className="rounded-[20px] border border-white/10 bg-white/[0.045] p-4" key={bucket}>
            <p className="text-[0.6rem] uppercase tracking-[0.16em] text-white/38">{bucket.replaceAll("_", " ")}</p>
            <p className="mt-2 text-3xl font-semibold text-white">{renewals?.buckets?.[bucket] ?? 0}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 grid gap-3">
        {(renewals?.renewals ?? []).slice(0, 6).map((renewal, index) => (
          <article className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4" key={`${renewal.tenant_id}-${renewal.renewal_date}-${index}`}>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="font-semibold text-white">{renewal.workspace_name}</h3>
                <p className="mt-1 text-xs text-white/42">
                  {renewal.days_until_renewal} days - {renewal.owner} - {renewal.last_touchpoint}
                </p>
              </div>
              <div className="text-left md:text-right">
                <p className="text-lg font-semibold text-white">{money.format(renewal.contract_value)}</p>
                <p className="text-xs text-cyan-50/58">{renewal.renewal_probability}% renewal probability</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
