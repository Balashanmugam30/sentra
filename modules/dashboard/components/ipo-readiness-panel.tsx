"use client";

import { useInvestor } from "@/lib/investor/use-investor";
import {
  InvestorPanelChrome,
  InvestorStatusPill,
  asList,
  asNumber,
  asRecord,
  asString,
  barWidth,
} from "@/modules/dashboard/components/investor-panel-primitives";

export function IpoReadinessPanel() {
  const { ipo } = useInvestor();
  const factors = asRecord(ipo?.factors);

  return (
    <InvestorPanelChrome
      action={<InvestorStatusPill label={asString(ipo?.status, "Emerging")} tone="gold" />}
      description="Tracks revenue scale, governance maturity, audit readiness, board independence, margins, durability, footprint, controls, and reporting discipline."
      eyebrow="IPO Readiness Engine"
      title={`${asNumber(ipo?.score, 67)}/100 public-company readiness`}
    >
      <div className="grid gap-3 lg:grid-cols-[1fr_0.9fr]">
        <div className="space-y-3 rounded-[24px] border border-white/10 bg-white/[0.035] p-4">
          {Object.entries(factors).map(([label, value]) => (
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
          <p className="text-xs uppercase tracking-[0.18em] text-amber-100/54">Next controls</p>
          <div className="mt-3 space-y-2">
            {asList<string>(ipo?.next_controls).map((item) => (
              <p className="rounded-[18px] border border-white/8 bg-black/10 p-3 text-sm leading-5 text-white/68" key={item}>
                {item}
              </p>
            ))}
          </div>
        </div>
      </div>
    </InvestorPanelChrome>
  );
}
