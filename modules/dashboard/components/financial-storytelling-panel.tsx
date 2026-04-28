"use client";

import { useInvestor } from "@/lib/investor/use-investor";
import {
  InvestorPanelChrome,
  InvestorStatusPill,
  asString,
} from "@/modules/dashboard/components/investor-panel-primitives";

export function FinancialStorytellingPanel() {
  const { metrics, board, copilot } = useInvestor();

  return (
    <InvestorPanelChrome
      description="Turns Sentra's operating system breadth into a concise investor narrative: growth, retention, AI moat, GovTech pull, marketplace expansion, and global distribution."
      eyebrow="Financial Storytelling"
      title="The boardroom narrative is already fundable"
    >
      <div className="rounded-[26px] border border-cyan-200/14 bg-cyan-200/[0.045] p-5">
        <p className="text-lg leading-7 text-white">{asString(metrics?.investor_summary)}</p>
        <p className="mt-3 text-sm leading-6 text-white/58">{asString(copilot?.strategic_answer)}</p>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-[22px] border border-white/10 bg-white/[0.035] p-4">
          <p className="text-sm font-semibold text-white">Why now</p>
          <p className="mt-2 text-sm leading-6 text-white/56">Autonomous crisis AI, public safety intelligence, marketplace extensibility, and global GTM are converging into one operating system.</p>
        </div>
        <div className="rounded-[22px] border border-white/10 bg-white/[0.035] p-4">
          <p className="text-sm font-semibold text-white">Why Sentra</p>
          <p className="mt-2 text-sm leading-6 text-white/56">{asString(board?.global_expansion_status, "UAE and Singapore pilot-ready; India launched; US high-ticket pipeline.")}</p>
        </div>
        <div className="rounded-[22px] border border-white/10 bg-white/[0.035] p-4">
          <p className="text-sm font-semibold text-white">Board proof</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <InvestorStatusPill label="129% NRR" />
            <InvestorStatusPill label="81% margin" />
            <InvestorStatusPill label="30mo runway" tone="gold" />
          </div>
        </div>
      </div>
    </InvestorPanelChrome>
  );
}
