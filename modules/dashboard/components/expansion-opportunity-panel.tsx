"use client";

import { useCustomerSuccess } from "@/lib/customer-success/use-customer-success";

const money = new Intl.NumberFormat("en-US", {
  currency: "USD",
  maximumFractionDigits: 0,
  style: "currency",
});

export function ExpansionOpportunityPanel() {
  const { busyAction, expandAccount, expansion } = useCustomerSuccess();

  return (
    <section className="rounded-[30px] border border-cyan-100/12 bg-[linear-gradient(135deg,rgba(5,10,20,0.78),rgba(103,232,249,0.08))] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/54">
            Expansion Revenue Engine
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
            Upsell and cross-sell opportunities
          </h2>
        </div>
        <p className="rounded-full border border-cyan-200/16 bg-cyan-200/8 px-4 py-2 text-sm font-semibold text-cyan-50">
          {money.format(expansion?.expansion_pipeline ?? 0)} ARR pipeline
        </p>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {(expansion?.opportunities ?? []).slice(0, 6).map((opportunity, index) => (
          <article className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4" key={`${opportunity.tenant_id}-${opportunity.opportunity_score}-${index}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">{opportunity.workspace_name}</h3>
                <p className="mt-1 text-xs text-white/42">{opportunity.recommended_offer}</p>
              </div>
              <span className="text-2xl font-semibold text-cyan-50">{opportunity.opportunity_score}</span>
            </div>
            <p className="mt-3 text-sm text-white/60">
              {money.format(opportunity.expected_MRR_gain)} MRR gain - {opportunity.close_probability}% close probability
            </p>
            <button
              className="mt-4 rounded-full border border-cyan-200/16 bg-cyan-200/8 px-4 py-2 text-xs font-semibold text-cyan-50 transition hover:bg-cyan-200/14 disabled:opacity-50"
              disabled={busyAction === "expand-account"}
              onClick={() => void expandAccount(opportunity.tenant_id)}
              type="button"
            >
              {busyAction === "expand-account" ? "Expanding..." : "Run expansion motion"}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
