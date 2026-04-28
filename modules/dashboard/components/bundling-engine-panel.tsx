"use client";

import { useMonopolyExpansion } from "@/lib/monopoly-expansion/use-monopoly-expansion";
import {
  MonopolyActionButton,
  MonopolyBar,
  MonopolyPanelShell,
  monopolyMoney,
} from "@/modules/dashboard/components/monopoly-panel-primitives";

export function BundlingEnginePanel() {
  const { bundles, busyAction, launchBundle } = useMonopolyExpansion();

  return (
    <MonopolyPanelShell
      action={
        <MonopolyActionButton busy={busyAction === "bundle"} onClick={() => void launchBundle()}>
          {busyAction === "bundle" ? "Launching..." : "Launch Bundle"}
        </MonopolyActionButton>
      }
      description="Cross-sell and upsell bundles that increase buyer value, reduce fragmentation, and make point solutions uneconomic."
      eyebrow="Product Bundling Engine"
      title={`${bundles?.recommended_bundle ?? "Full Enterprise Suite"} is the strongest expansion offer`}
    >
      <p className="mb-4 rounded-[22px] border border-cyan-200/12 bg-cyan-200/8 p-4 text-sm leading-6 text-cyan-50/70">
        {bundles?.bundle_strategy ?? "Increase buyer value through integration depth, data gravity, executive proof, and lower operational fragmentation."}
      </p>
      <div className="grid gap-3 lg:grid-cols-4">
        {(bundles?.bundles ?? []).map((bundle) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4" key={bundle.name}>
            <p className="text-sm font-semibold text-white">{bundle.name}</p>
            <p className="mt-1 text-xs text-white/42">{monopolyMoney.format(bundle.annual_value)} annual value</p>
            <div className="mt-4 space-y-3">
              <MonopolyBar label="Attach" value={bundle.attach_rate} />
              <MonopolyBar label="Rival pressure" value={bundle.rival_pressure} />
            </div>
          </div>
        ))}
      </div>
    </MonopolyPanelShell>
  );
}

