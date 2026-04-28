"use client";

import { useInvestor } from "@/lib/investor/use-investor";
import {
  InvestorPanelChrome,
  InvestorStatusPill,
  asList,
  asNumber,
  asRecord,
  asString,
  investorMoney,
} from "@/modules/dashboard/components/investor-panel-primitives";

export function SeriesReadinessPanel() {
  const { readiness } = useInvestor();
  const raise = asRecord(readiness?.raise_recommendation);

  return (
    <InvestorPanelChrome
      action={<InvestorStatusPill label={asString(readiness?.class, "Series B Ready")} tone="gold" />}
      description="A focused Series A/B readiness lens for investors: amount, valuation, instrument, and the 90-day improvement plan."
      eyebrow="Series Readiness"
      title={`${asString(readiness?.class, "Series B Ready")} with ${investorMoney.format(asNumber(raise.amount, 10_000_000))} raise plan`}
    >
      <div className="grid gap-3 md:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-[24px] border border-amber-200/14 bg-amber-200/[0.055] p-4">
          <p className="text-[0.62rem] uppercase tracking-[0.18em] text-amber-100/56">Target valuation</p>
          <p className="mt-2 text-3xl font-semibold text-white">
            {investorMoney.format(asNumber(raise.target_valuation, 62_000_000))}
          </p>
          <p className="mt-2 text-sm text-white/56">{asString(raise.instrument, "priced Series A")}</p>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-white/[0.035] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-white/42">90-day priorities</p>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {asList<string>(readiness?.ninety_day_priorities).map((item) => (
              <div className="rounded-[18px] border border-white/8 bg-white/[0.035] p-3 text-sm leading-5 text-white/66" key={item}>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </InvestorPanelChrome>
  );
}
