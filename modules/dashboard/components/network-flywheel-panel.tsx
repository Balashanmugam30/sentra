"use client";

import { useMonopolyExpansion } from "@/lib/monopoly-expansion/use-monopoly-expansion";
import { MonopolyBar, MonopolyMetricCard, MonopolyPanelShell } from "@/modules/dashboard/components/monopoly-panel-primitives";

export function NetworkFlywheelPanel() {
  const { network } = useMonopolyExpansion();

  return (
    <MonopolyPanelShell
      description="Self-reinforcing growth loops from referrals, partner-led wins, developer expansion, data compounding, and ecosystem stickiness."
      eyebrow="Network Flywheel"
      title={`${network?.referral_loop ?? 1.52} referral loop with +${network?.developer_growth ?? 28}% developer growth`}
    >
      <div className="grid gap-3 md:grid-cols-4">
        <MonopolyMetricCard label="Partner-led wins" value={`${network?.partner_led_wins ?? 39}%`} />
        <MonopolyMetricCard label="Referral loop" value={`${network?.referral_loop ?? 1.52}x`} />
        <MonopolyMetricCard label="Data compounding" value={`${network?.data_compounding ?? 94}%`} />
        <MonopolyMetricCard label="Stickiness" value={`${network?.ecosystem_stickiness ?? 92}%`} />
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        {(network?.flywheel ?? []).map((step, index) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4" key={step}>
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-50/45">Loop {index + 1}</p>
            <p className="mt-2 text-sm leading-6 text-white/66">{step}</p>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <MonopolyBar label="Flywheel strength" value={network?.ecosystem_stickiness ?? 92} />
      </div>
    </MonopolyPanelShell>
  );
}

