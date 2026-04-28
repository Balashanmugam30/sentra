"use client";

import { useRevenueGrowth } from "@/lib/revenue-growth/use-revenue-growth";
import { RevenueMetricCard, RevenuePanelShell, revenueMoney } from "@/modules/dashboard/components/revenue-panel-primitives";

export function SalesAiCommand() {
  const { salesActions } = useRevenueGrowth();

  return (
    <RevenuePanelShell description="AI SDR command queue ranks hot leads, stalled deals, upsells, renewal rescues, and enterprise whales by expected revenue." eyebrow="Sales AI Command" title="Next best actions are revenue-ranked">
      <div className="space-y-3">
        {salesActions.slice(0, 6).map((action) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4" key={action.action_id}>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-sm font-semibold text-white">{action.title}</p>
                <p className="mt-2 text-sm leading-6 text-white/55">{action.next_step}</p>
              </div>
              <div className="grid min-w-[240px] grid-cols-2 gap-2">
                <RevenueMetricCard label="Revenue" value={revenueMoney.format(action.expected_revenue)} />
                <RevenueMetricCard label="Confidence" value={`${action.confidence}%`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </RevenuePanelShell>
  );
}
