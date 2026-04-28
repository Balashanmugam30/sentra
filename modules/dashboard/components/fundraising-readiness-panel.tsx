"use client";

import { useInvestor } from "@/lib/investor/use-investor";
import {
  InvestorPanelChrome,
  InvestorStatusPill,
  asNumber,
  asRecord,
  asString,
  barWidth,
  investorMoney,
} from "@/modules/dashboard/components/investor-panel-primitives";

export function FundraisingReadinessPanel() {
  const { readiness } = useInvestor();
  const drivers = asRecord(readiness?.drivers);
  const raise = asRecord(readiness?.raise_recommendation);

  return (
    <InvestorPanelChrome
      action={<InvestorStatusPill label={asString(readiness?.class, "Series B Ready")} tone="gold" />}
      description="Scores revenue maturity, growth, churn quality, security posture, GTM repeatability, team maturity, market size, AI moat, and narrative quality."
      eyebrow="Capital Readiness"
      title={`${asNumber(readiness?.score, 88)}/100 fundraising readiness`}
    >
      <div className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-3 rounded-[24px] border border-white/10 bg-white/[0.035] p-4">
          {Object.entries(drivers).map(([label, value]) => (
            <div key={label}>
              <div className="flex items-center justify-between text-xs text-white/54">
                <span className="capitalize">{label.replaceAll("_", " ")}</span>
                <span>{asNumber(value)}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-white/10">
                <div className="h-full rounded-full bg-cyan-300/75" style={{ width: barWidth(value) }} />
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-[24px] border border-amber-200/14 bg-amber-200/[0.055] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-amber-100/52">Recommended raise</p>
          <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white">
            {investorMoney.format(asNumber(raise.amount, 10_000_000))}
          </p>
          <p className="mt-2 text-sm text-white/58">
            {asString(raise.instrument, "priced Series A")} at {investorMoney.format(asNumber(raise.target_valuation, 62_000_000))} target valuation.
          </p>
        </div>
      </div>
    </InvestorPanelChrome>
  );
}
