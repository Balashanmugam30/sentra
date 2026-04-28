"use client";

import { useRevenueGrowth } from "@/lib/revenue-growth/use-revenue-growth";
import { RevenueBar, RevenuePanelShell } from "@/modules/dashboard/components/revenue-panel-primitives";

export function LiveFunnelPanel() {
  const { funnel } = useRevenueGrowth();
  const max = Math.max(...funnel.map((stage) => stage.count), 1);

  return (
    <RevenuePanelShell description="Full acquisition funnel with live dropoff math from visitor to enterprise close." eyebrow="Live Funnel Engine" title="Conversion ladder is instrumented end to end">
      <div className="space-y-4">
        {funnel.map((stage, index) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4" key={`${stage.stage_id}-${stage.count}-${index}`}>
            <RevenueBar label={`${stage.name}${stage.conversion_rate ? ` - ${stage.conversion_rate}% conversion` : ""}`} max={max} value={stage.count} />
            {stage.dropoff_rate ? <p className="mt-2 text-xs text-white/42">{stage.dropoff_rate}% dropoff from previous stage</p> : null}
          </div>
        ))}
      </div>
    </RevenuePanelShell>
  );
}
