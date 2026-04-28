"use client";

import { useInvestor } from "@/lib/investor/use-investor";
import type { InvestorRecord } from "@/lib/investor/types";
import {
  InvestorPanelChrome,
  InvestorStatusPill,
  asList,
  asString,
  investorMoney,
} from "@/modules/dashboard/components/investor-panel-primitives";

export function FundraisingAiCopilot() {
  const { copilot } = useInvestor();
  const investors = asList<InvestorRecord>(copilot?.best_fit_investors);

  return (
    <InvestorPanelChrome
      action={<InvestorStatusPill label={copilot?.series_a_ready ? "Series A ready" : "Improve first"} tone="gold" />}
      description="Deterministic strategic answers for raise size, valuation, readiness gaps, investor fit, and 90-day valuation expansion."
      eyebrow="AI Fundraising Copilot"
      title={asString(copilot?.recommended_raise, "$10M Series A")}
    >
      <div className="grid gap-3 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-[24px] border border-cyan-200/14 bg-cyan-200/[0.045] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/52">Strategic answer</p>
          <p className="mt-3 text-lg leading-7 text-white">{asString(copilot?.strategic_answer)}</p>
          <p className="mt-3 text-sm leading-6 text-white/58">{asString(copilot?.realistic_valuation)}</p>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-white/[0.035] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-white/42">Best-fit investors</p>
          <div className="mt-3 space-y-3">
            {investors.map((investor) => (
              <div className="flex items-center justify-between gap-3" key={`${investor.investor_id}-${investor.tenant_id}`}>
                <div>
                  <p className="text-sm font-semibold text-white">{investor.fund_name}</p>
                  <p className="text-xs text-white/44">{investor.partner_name}</p>
                </div>
                <span className="text-xs text-cyan-50/70">{investorMoney.format(investor.check_size)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {asList<string>(copilot?.maximize_valuation).slice(0, 4).map((item) => (
          <div className="rounded-[18px] border border-white/10 bg-white/[0.035] p-3 text-sm leading-5 text-white/64" key={item}>
            {item}
          </div>
        ))}
      </div>
    </InvestorPanelChrome>
  );
}
