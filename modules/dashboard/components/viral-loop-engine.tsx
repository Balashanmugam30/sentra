"use client";

import { useRevenueGrowth } from "@/lib/revenue-growth/use-revenue-growth";
import { RevenueMetricCard, RevenuePanelShell } from "@/modules/dashboard/components/revenue-panel-primitives";

export function ViralLoopEngine() {
  const { viral } = useRevenueGrowth();

  return (
    <RevenuePanelShell description="Measures organic spread through executive reports, board shares, crisis simulations, and referral invites." eyebrow="Viral Loop Engine" title={`Organic coefficient ${viral?.organic_coefficient ?? 1.34}`}>
      <div className="grid gap-3 md:grid-cols-5">
        <RevenueMetricCard label="Shares/customer" value={`${viral?.shares_per_customer ?? 2.4}`} />
        <RevenueMetricCard label="Invite CVR" value={`${viral?.invite_conversion ?? 56}%`} />
        <RevenueMetricCard label="Multiplier" value={`${viral?.growth_multiplier ?? 1.51}x`} />
        <RevenueMetricCard label="Cycle time" value={`${viral?.loop_cycle_days ?? 9}d`} />
        <RevenueMetricCard label="Loop" value="Board share" />
      </div>
      <p className="mt-4 rounded-[20px] border border-cyan-200/12 bg-cyan-200/6 p-4 text-sm text-cyan-50/68">
        Top loop: {viral?.top_loop ?? "executive report export -> board share -> demo request"}.
      </p>
    </RevenuePanelShell>
  );
}
