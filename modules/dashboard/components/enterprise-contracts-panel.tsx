"use client";

import { useGrowth } from "@/lib/growth/use-growth";

const money = new Intl.NumberFormat("en-US", { currency: "USD", maximumFractionDigits: 0, style: "currency" });

export function EnterpriseContractsPanel() {
  const { busyAction, contracts, createEnterpriseDeal } = useGrowth();
  const enterprise = contracts.filter((contract) => !contract.deal_type.includes("Government")).slice(0, 5);

  return (
    <section className="rounded-[30px] border border-white/10 bg-[rgba(5,10,20,0.78)] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/54">Enterprise Procurement Engine</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">Large-account contract motion</h2>
        </div>
        <button className="rounded-full border border-cyan-200/22 bg-cyan-200/10 px-4 py-2 text-sm font-semibold text-cyan-50 disabled:opacity-50" disabled={busyAction === "enterprise-deal"} onClick={() => void createEnterpriseDeal()} type="button">
          {busyAction === "enterprise-deal" ? "Creating..." : "Create Deal"}
        </button>
      </div>
      <div className="mt-5 grid gap-3">
        {enterprise.map((contract, index) => (
          <article className="rounded-[20px] border border-white/10 bg-white/[0.045] p-4" key={`${contract.contract_id}-${index}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-white">{contract.account_name}</p>
                <p className="mt-1 text-xs text-white/45">{contract.country} - {contract.stage}</p>
              </div>
              <span className="text-lg font-semibold text-cyan-50">{money.format(contract.value)}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

