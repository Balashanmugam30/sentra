"use client";

import { useRevenueGrowth } from "@/lib/revenue-growth/use-revenue-growth";
import { RevenueBar, RevenueMetricCard, RevenuePanelShell } from "@/modules/dashboard/components/revenue-panel-primitives";

export function WaitlistExpansionPanel() {
  const { waitlist } = useRevenueGrowth();

  return (
    <RevenuePanelShell description="Waitlist demand, region heat, invite waves, launch city ranking, and product pull from future buyers." eyebrow="Waitlist Expansion Engine" title={`${(waitlist?.people_waiting ?? 12_840).toLocaleString()} operators waiting`}>
      <div className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
          <RevenueBar label="Expansion heat" value={waitlist?.expansion_heat ?? 91} />
          <div className="mt-4 grid gap-2 md:grid-cols-2">
            {(waitlist?.top_regions ?? ["UAE", "Singapore", "India South", "Germany"]).map((region) => (
              <div className="rounded-[18px] border border-cyan-200/12 bg-cyan-200/6 px-4 py-3 text-sm text-cyan-50/74" key={region}>
                {region}
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-3">
          <RevenueMetricCard label="Invite waves" value={waitlist?.invite_waves ?? 6} />
          <RevenueMetricCard label="Top request" value={waitlist?.top_requested_feature ?? "AI crisis simulation autopilot"} />
        </div>
      </div>
    </RevenuePanelShell>
  );
}
