"use client";

import { useInvestor } from "@/lib/investor/use-investor";
import {
  InvestorPanelChrome,
  InvestorStatusPill,
  asList,
  asNumber,
  asString,
  barWidth,
} from "@/modules/dashboard/components/investor-panel-primitives";

type BuyerMatch = { class: string; fit_score: number; rationale: string };

export function MnaOpportunityPanel() {
  const { mna } = useInvestor();
  const matches = asList<BuyerMatch>(mna?.top_buyer_matches);

  return (
    <InvestorPanelChrome
      action={<InvestorStatusPill label={`${asNumber(mna?.strategic_premium_percent, 42)}% strategic premium`} tone="gold" />}
      description="Acquisition attractiveness from ARR, growth, moat, government contracts, integrations, AI IP, stickiness, and global footprint."
      eyebrow="M&A Opportunity Engine"
      title={`${asNumber(mna?.acquisition_readiness_percent, 96)}% acquisition readiness`}
    >
      <div className="grid gap-3 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-[24px] border border-cyan-200/14 bg-cyan-200/[0.045] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/52">Attractiveness drivers</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {asList<string>(mna?.attractiveness_drivers).map((item) => (
              <InvestorStatusPill key={item} label={item} />
            ))}
          </div>
        </div>
        <div className="space-y-3">
          {matches.map((match) => (
            <div className="rounded-[20px] border border-white/10 bg-white/[0.035] p-4" key={match.class}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-white">{match.class}</span>
                <span className="text-cyan-50/68">{match.fit_score}% fit</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-white/10">
                <div className="h-full rounded-full bg-cyan-300/75" style={{ width: barWidth(match.fit_score) }} />
              </div>
              <p className="mt-2 text-xs leading-5 text-white/50">{asString(match.rationale)}</p>
            </div>
          ))}
        </div>
      </div>
    </InvestorPanelChrome>
  );
}
