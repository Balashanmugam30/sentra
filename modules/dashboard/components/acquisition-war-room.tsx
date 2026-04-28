"use client";

import { useMonopolyExpansion } from "@/lib/monopoly-expansion/use-monopoly-expansion";
import {
  MonopolyActionButton,
  MonopolyBar,
  MonopolyMetricCard,
  MonopolyPanelShell,
  monopolyMoney,
} from "@/modules/dashboard/components/monopoly-panel-primitives";

export function AcquisitionWarRoom() {
  const { acquisitionModel, acquisitionTargets, busyAction, runAcquisitionModel } = useMonopolyExpansion();
  const topTarget = acquisitionTargets[0]?.name ?? "OpsVision AI";

  return (
    <MonopolyPanelShell
      action={
        <MonopolyActionButton busy={busyAction === "acquisition"} onClick={() => void runAcquisitionModel(topTarget)}>
          {busyAction === "acquisition" ? "Modeling..." : "Run Acquisition Model"}
        </MonopolyActionButton>
      }
      description="Buyout targets ranked by ARR, multiple, strategic fit, customer overlap, talent, and integration ease."
      eyebrow="Acquisition War Room"
      title={`${topTarget} is the highest-fit consolidation target`}
      tone="gold"
    >
      <div className="grid gap-3 md:grid-cols-4">
        <MonopolyMetricCard label="Modeled target" value={acquisitionModel?.target ?? topTarget} />
        <MonopolyMetricCard label="Purchase price" value={monopolyMoney.format(acquisitionModel?.purchase_price ?? 33_640_000)} />
        <MonopolyMetricCard label="Integration" value={`${acquisitionModel?.integration_months ?? 7} mo`} />
        <MonopolyMetricCard label="Cross-sell" value={monopolyMoney.format(acquisitionModel?.customer_cross_sell ?? 1_900_000)} />
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-5">
        {acquisitionTargets.map((target) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4" key={target.name}>
            <p className="text-sm font-semibold text-white">{target.name}</p>
            <p className="mt-1 text-xs text-white/42">{monopolyMoney.format(target.arr)} ARR at {target.price_multiple}x</p>
            <div className="mt-4 space-y-3">
              <MonopolyBar label="Fit value" value={target.fit_value_score} />
              <MonopolyBar label="Talent" value={target.engineering_talent} />
            </div>
          </div>
        ))}
      </div>
    </MonopolyPanelShell>
  );
}

