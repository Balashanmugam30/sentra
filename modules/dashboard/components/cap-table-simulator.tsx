"use client";

import { useInvestor } from "@/lib/investor/use-investor";
import {
  InvestorActionButton,
  InvestorMetricTile,
  InvestorPanelChrome,
  asList,
  asNumber,
  investorMoney,
} from "@/modules/dashboard/components/investor-panel-primitives";

type RoundRow = {
  round: string;
  post_money: number;
  dilution_percent: number;
  founder_percent: number;
  investor_percent: number;
  esop_percent: number;
};

export function CapTableSimulator() {
  const { captable, updateCapTable, busyAction } = useInvestor();
  const rounds = asList<RoundRow>(captable?.rounds);

  return (
    <InvestorPanelChrome
      action={
        <InvestorActionButton disabled={busyAction === "cap-table"} onClick={() => void updateCapTable()} tone="gold">
          {busyAction === "cap-table" ? "Repricing..." : "Update Model"}
        </InvestorActionButton>
      }
      description="Founder ownership, investor dilution, ESOP pool, SAFE conversion, and future round simulation."
      eyebrow="Cap Table Simulator"
      title={`${asNumber(captable?.founder_ownership_remaining, 55.7)}% founder ownership after Series B scenario`}
    >
      <div className="grid gap-3 md:grid-cols-4">
        <InvestorMetricTile label="Founders" value={`${asNumber(captable?.founder_ownership_remaining, 55.7)}%`} />
        <InvestorMetricTile label="Investors" value={`${asNumber(captable?.investor_ownership, 34.3)}%`} />
        <InvestorMetricTile label="ESOP" value={`${asNumber(captable?.ESOP_percent, 10)}%`} />
        <InvestorMetricTile label="Post Money" value={investorMoney.format(asNumber(captable?.post_money_valuation, 180_000_000))} />
      </div>
      <div className="mt-5 overflow-hidden rounded-[24px] border border-white/10">
        {rounds.map((round) => (
          <div className="grid gap-3 border-b border-white/8 bg-white/[0.025] p-4 text-sm text-white/66 last:border-b-0 md:grid-cols-5" key={`${round.round}-${round.post_money}`}>
            <span className="font-semibold text-white">{round.round}</span>
            <span>{round.post_money ? investorMoney.format(round.post_money) : "Formation"}</span>
            <span>Dilution {round.dilution_percent}%</span>
            <span>Founder {round.founder_percent}%</span>
            <span>ESOP {round.esop_percent}%</span>
          </div>
        ))}
      </div>
    </InvestorPanelChrome>
  );
}
