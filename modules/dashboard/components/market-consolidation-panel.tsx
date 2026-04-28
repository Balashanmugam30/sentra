"use client";

import { useMonopolyExpansion } from "@/lib/monopoly-expansion/use-monopoly-expansion";
import { MonopolyBar, MonopolyMetricCard, MonopolyPanelShell } from "@/modules/dashboard/components/monopoly-panel-primitives";

export function MarketConsolidationPanel() {
  const { consolidation } = useMonopolyExpansion();

  return (
    <MonopolyPanelShell
      description="Share capture simulations for acquisitions, adjacent markets, bundling, partner-led government motion, and developer ecosystem expansion."
      eyebrow="Market Consolidation"
      title={`${consolidation?.weak_rivals_identified ?? 5} weak rivals identified for responsible consolidation`}
      tone="gold"
    >
      <div className="grid gap-3 md:grid-cols-2">
        <MonopolyMetricCard label="Adjacent markets" value={(consolidation?.adjacent_markets ?? []).join(", ")} />
        <MonopolyMetricCard label="Guardrail" value={consolidation?.responsible_growth_guardrail ?? "customer outcomes and interoperability"} />
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-4">
        {(consolidation?.share_capture_simulation ?? []).map((move) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4" key={move.move}>
            <p className="text-sm font-semibold text-white">{move.move}</p>
            <p className="mt-1 text-xs text-white/42">Risk: {move.risk}</p>
            <div className="mt-4 space-y-3">
              <MonopolyBar label="Share gain" max={10} value={move.share_gain} />
              <MonopolyBar label="Pricing power" max={10} value={move.pricing_power} />
            </div>
          </div>
        ))}
      </div>
    </MonopolyPanelShell>
  );
}

