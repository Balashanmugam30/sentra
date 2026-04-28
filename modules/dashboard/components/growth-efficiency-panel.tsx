"use client";

import { useInvestor } from "@/lib/investor/use-investor";
import {
  InvestorMetricTile,
  InvestorPanelChrome,
  asNumber,
  investorMoney,
} from "@/modules/dashboard/components/investor-panel-primitives";

export function GrowthEfficiencyPanel() {
  const { metrics } = useInvestor();

  return (
    <InvestorPanelChrome
      description="Investor-grade efficiency metrics: LTV/CAC, payback, burn multiple, magic number, gross profit, net new ARR, and Rule of 40."
      eyebrow="Growth Efficiency"
      title={`Rule of 40 ${asNumber(metrics?.rule_of_40, 71)} with ${asNumber(metrics?.LTV_CAC, 7)}x LTV/CAC`}
    >
      <div className="grid gap-3 md:grid-cols-4">
        <InvestorMetricTile label="LTV/CAC" note="enterprise SaaS quality" value={`${asNumber(metrics?.LTV_CAC, 7)}x`} />
        <InvestorMetricTile label="CAC Payback" note="months" value={asNumber(metrics?.CAC_payback_months, 9)} />
        <InvestorMetricTile label="Burn Multiple" note="net burn / net new ARR" value={asNumber(metrics?.burn_multiple, 2.47)} />
        <InvestorMetricTile label="Magic Number" note="sales efficiency" value={asNumber(metrics?.magic_number, 1.4)} />
        <InvestorMetricTile label="Gross Profit" value={investorMoney.format(asNumber(metrics?.gross_profit, 3_888_000))} />
        <InvestorMetricTile label="Net New ARR" value={investorMoney.format(asNumber(metrics?.net_new_ARR, 1_020_000))} />
        <InvestorMetricTile label="Expansion ARR" value={investorMoney.format(asNumber(metrics?.expansion_ARR, 1_380_000))} />
        <InvestorMetricTile label="Cash Efficiency" value={asNumber(metrics?.cash_efficiency_score, 75)} />
      </div>
    </InvestorPanelChrome>
  );
}
