"use client";

import { useMonopolyExpansion } from "@/lib/monopoly-expansion/use-monopoly-expansion";
import { MonopolyBar, MonopolyMetricCard, MonopolyPanelShell } from "@/modules/dashboard/components/monopoly-panel-primitives";

export function MonopolyScorePanel() {
  const { score } = useMonopolyExpansion();
  const value = score?.monopoly_score ?? 97;

  return (
    <MonopolyPanelShell
      description="Single dominance meter combining acquisitions, partnerships, conquest, bundling, lock-in, channel strength, procurement default, network effects, and regulatory health."
      eyebrow="Monopoly Score"
      title={`${value}/100 - ${score?.label ?? "DEFAULT GLOBAL CHOICE"}`}
      tone="gold"
    >
      <div className="grid gap-4 lg:grid-cols-[0.72fr_1.28fr]">
        <div className="rounded-[28px] border border-amber-200/16 bg-[radial-gradient(circle_at_50%_35%,rgba(245,158,11,0.24),rgba(2,6,23,0.62)_62%)] p-8 text-center">
          <p className="text-[4.5rem] font-semibold leading-none tracking-[-0.08em] text-white">{value}</p>
          <p className="mt-3 text-sm uppercase tracking-[0.24em] text-amber-50/58">{score?.posture ?? "responsible winner-take-most"}</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <MonopolyBar label="Acquisition" value={score?.acquisition_score ?? 91} />
          <MonopolyBar label="Partnership" value={score?.partnership_score ?? 92} />
          <MonopolyBar label="Global conquest" value={score?.global_conquest_score ?? 90} />
          <MonopolyBar label="Bundling" value={score?.bundling_score ?? 94} />
          <MonopolyBar label="Lock-in value" value={score?.lockin_score ?? 96} />
          <MonopolyBar label="Network effects" value={score?.network_effect_score ?? 95} />
          <MonopolyBar label="Regulatory health" value={score?.regulatory_health_score ?? 89} />
          <MonopolyMetricCard label="Label" value={score?.label ?? "DEFAULT GLOBAL CHOICE"} />
        </div>
      </div>
    </MonopolyPanelShell>
  );
}

