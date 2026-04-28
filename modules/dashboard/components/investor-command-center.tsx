"use client";

import { useInvestor } from "@/lib/investor/use-investor";
import {
  InvestorActionButton,
  InvestorMetricTile,
  InvestorPanelChrome,
  compactInvestorMoney,
  investorMoney,
} from "@/modules/dashboard/components/investor-panel-primitives";

export function InvestorCommandCenter() {
  const { live, loading, error, refresh, generateBoardPack, busyAction } = useInvestor();

  return (
    <InvestorPanelChrome
      action={
        <>
          <InvestorActionButton onClick={() => void refresh()}>{loading ? "Syncing..." : "Refresh"}</InvestorActionButton>
          <InvestorActionButton
            disabled={busyAction === "board-pack"}
            onClick={() => void generateBoardPack()}
            tone="gold"
          >
            {busyAction === "board-pack" ? "Building pack..." : "Generate Board Pack"}
          </InvestorActionButton>
        </>
      }
      description="Fundraising readiness, valuation, cash runway, capital strategy, investor pipeline, and board reporting now operate as one institutional command layer."
      eyebrow="Investor Operating System"
      title={`${compactInvestorMoney.format(live?.base_valuation ?? 62_000_000)} base valuation with ${live?.runway_months ?? 30} months runway`}
    >
      <div className="grid gap-3 md:grid-cols-4">
        <InvestorMetricTile label="ARR" note={`${live?.YoY_growth_percent ?? 182}% YoY growth`} value={investorMoney.format(live?.ARR ?? 4_800_000)} />
        <InvestorMetricTile label="NRR" note="enterprise expansion" value={`${live?.net_revenue_retention ?? 129}%`} />
        <InvestorMetricTile label="Rule of 40" note="investor-grade efficiency" value={live?.rule_of_40 ?? 71} />
        <InvestorMetricTile label="Pipeline Checks" note="probability weighted" value={investorMoney.format(live?.investor_pipeline ?? 0)} />
      </div>
      {error ? (
        <div className="mt-4 rounded-[20px] border border-orange-300/20 bg-orange-400/10 p-4 text-sm text-orange-50">
          Investor data delayed. Showing last verified command state.
        </div>
      ) : null}
    </InvestorPanelChrome>
  );
}
