"use client";

import { useGrowth } from "@/lib/growth/use-growth";

const money = new Intl.NumberFormat("en-US", { currency: "USD", maximumFractionDigits: 0, style: "currency" });

export function GovernmentDealsPanel() {
  const { contracts } = useGrowth();
  const deals = contracts.filter((contract) => contract.deal_type.includes("Government")).slice(0, 5);

  return (
    <section className="rounded-[30px] border border-white/10 bg-[rgba(5,10,20,0.78)] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/54">Government Contract Engine</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">High-trust secure sector opportunities</h2>
      <div className="mt-5 grid gap-3">
        {deals.map((deal, index) => (
          <article className="rounded-[20px] border border-amber-200/12 bg-amber-200/[0.045] p-4" key={`${deal.contract_id}-gov-${index}`}>
            <p className="font-semibold text-white">{deal.account_name}</p>
            <p className="mt-2 text-2xl font-semibold text-amber-50">{money.format(deal.value)}</p>
            <p className="mt-1 text-xs text-white/45">{deal.country} - {deal.probability}% probability - {deal.stage}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

