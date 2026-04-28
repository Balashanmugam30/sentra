"use client";

import { useRevenueGrowth } from "@/lib/revenue-growth/use-revenue-growth";
import { RevenueActionButton, RevenueBar, RevenueMetricCard, RevenuePanelShell, revenueMoney } from "@/modules/dashboard/components/revenue-panel-primitives";

export function PricingPsychologyPanel() {
  const { bestPricingVariant, busyAction, pricingExperiments, runPricingTest } = useRevenueGrowth();

  return (
    <RevenuePanelShell
      action={
        <RevenueActionButton busy={busyAction === "pricing"} onClick={() => void runPricingTest()}>
          {busyAction === "pricing" ? "Testing..." : "Run Pricing Test"}
        </RevenueActionButton>
      }
      description="A/B pricing intelligence for plan anchors, trial mechanics, annual conversion, and enterprise procurement psychology."
      eyebrow="Pricing Psychology Engine"
      title={`Winner: ${bestPricingVariant?.name ?? "Demo-gated enterprise"}`}
      tone="gold"
    >
      <div className="grid gap-3 lg:grid-cols-2">
        {pricingExperiments.slice(0, 6).map((experiment) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4" key={experiment.experiment_id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">{experiment.name}</p>
                <p className="mt-1 text-xs text-white/42">{experiment.variant}</p>
              </div>
              {experiment.winner ? <span className="rounded-full border border-amber-200/25 bg-amber-200/12 px-3 py-1 text-xs font-semibold text-amber-50">Winner</span> : null}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <RevenueMetricCard label="ARPU" value={revenueMoney.format(experiment.arpu)} />
              <RevenueMetricCard label="Confidence" value={`${experiment.confidence}%`} />
            </div>
            <div className="mt-4">
              <RevenueBar label="Conversion rate" max={15} value={experiment.conversion_rate} />
            </div>
          </div>
        ))}
      </div>
    </RevenuePanelShell>
  );
}
