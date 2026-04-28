"use client";

import { useInvestor } from "@/lib/investor/use-investor";
import {
  InvestorActionButton,
  InvestorPanelChrome,
  InvestorStatusPill,
  formatDate,
  investorMoney,
} from "@/modules/dashboard/components/investor-panel-primitives";

export function InvestorCrmPanel() {
  const { investors, addInvestor, busyAction } = useInvestor();

  return (
    <InvestorPanelChrome
      action={
        <InvestorActionButton disabled={busyAction === "add-investor"} onClick={() => void addInvestor()} tone="gold">
          {busyAction === "add-investor" ? "Adding..." : "Add Investor"}
        </InvestorActionButton>
      }
      description="Fundraising pipeline with thesis fit, warm intros, probability to invest, check size, and next-action discipline."
      eyebrow="Investor CRM"
      title={`${investors.length || 6} investor relationships ranked by conviction`}
    >
      <div className="grid gap-3 xl:grid-cols-2">
        {investors.map((investor) => (
          <div className="rounded-[24px] border border-white/10 bg-white/[0.035] p-4" key={`${investor.investor_id}-${investor.tenant_id}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold tracking-[-0.03em] text-white">{investor.fund_name}</p>
                <p className="mt-1 text-sm text-white/50">
                  {investor.partner_name} - {investor.stage_fit}
                </p>
              </div>
              <InvestorStatusPill label={`${investor.interest_score} interest`} tone="gold" />
            </div>
            <p className="mt-3 text-sm leading-6 text-white/58">{investor.thesis_fit}</p>
            <div className="mt-4 grid gap-2 text-xs text-white/48 md:grid-cols-3">
              <span>{investorMoney.format(investor.check_size)} check</span>
              <span>{investor.probability_to_invest}% probability</span>
              <span>{formatDate(investor.next_action_date)}</span>
            </div>
          </div>
        ))}
      </div>
    </InvestorPanelChrome>
  );
}
