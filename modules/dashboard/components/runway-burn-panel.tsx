"use client";

import { useInvestor } from "@/lib/investor/use-investor";
import {
  InvestorActionButton,
  InvestorMetricTile,
  InvestorPanelChrome,
  asList,
  asNumber,
  asString,
  investorMoney,
} from "@/modules/dashboard/components/investor-panel-primitives";

type RunwayScenario = { action: string; runway_months: number; impact: string };

export function RunwayBurnPanel() {
  const { runway, addCash, runScenario, busyAction } = useInvestor();
  const scenarios = asList<RunwayScenario>(runway?.scenarios);

  return (
    <InvestorPanelChrome
      action={
        <>
          <InvestorActionButton disabled={busyAction === "add-cash"} onClick={() => void addCash(2_000_000)}>
            {busyAction === "add-cash" ? "Adding..." : "Add $2M"}
          </InvestorActionButton>
          <InvestorActionButton disabled={busyAction === "scenario-Raise $10M"} onClick={() => void runScenario("Raise $10M")} tone="gold">
            Run $10M Raise
          </InvestorActionButton>
        </>
      }
      description="Cash preservation, hiring impact, raise sizing, and emergency financing scenarios for board-level capital planning."
      eyebrow="Runway and Burn Engine"
      title={`${asNumber(runway?.runway_months, 30)} months runway at ${investorMoney.format(asNumber(runway?.monthly_burn, 210_000))}/mo burn`}
    >
      <div className="grid gap-3 md:grid-cols-4">
        <InvestorMetricTile label="Cash" note="current treasury" value={investorMoney.format(asNumber(runway?.cash_on_hand, 6_400_000))} />
        <InvestorMetricTile label="Net Burn" note="monthly" value={investorMoney.format(asNumber(runway?.net_burn, 210_000))} />
        <InvestorMetricTile label="Raise Required" note="growth plan" value={investorMoney.format(asNumber(runway?.raise_required, 8_500_000))} />
        <InvestorMetricTile label="Survival Score" note="cash efficiency" value={asNumber(runway?.survival_score, 95)} />
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {scenarios.slice(0, 5).map((item) => (
          <button
            className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4 text-left transition hover:border-cyan-200/30 hover:bg-cyan-200/[0.055]"
            key={item.action}
            onClick={() => void runScenario(item.action)}
            type="button"
          >
            <p className="text-sm font-semibold text-white">{item.action}</p>
            <p className="mt-1 text-xs text-cyan-50/58">{item.runway_months} months runway</p>
            <p className="mt-3 text-xs leading-5 text-white/48">{asString(item.impact)}</p>
          </button>
        ))}
      </div>
    </InvestorPanelChrome>
  );
}
