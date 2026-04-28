"use client";

import { useMonopolyExpansion } from "@/lib/monopoly-expansion/use-monopoly-expansion";
import { MonopolyBar, MonopolyMetricCard, MonopolyPanelShell } from "@/modules/dashboard/components/monopoly-panel-primitives";

export function CustomerLockinPanel() {
  const { lockin } = useMonopolyExpansion();

  return (
    <MonopolyPanelShell
      description="Switching cost and dependency depth through integrations, workflow dependency, seat expansion, AI memory, and data gravity."
      eyebrow="Customer Lock-In Engine"
      title={`${lockin?.switching_cost ?? "Extreme"} switching cost with ${lockin?.data_gravity_score ?? 94}/100 data gravity`}
      tone="gold"
    >
      <div className="grid gap-3 md:grid-cols-4">
        <MonopolyMetricCard label="Integrations" value={(lockin?.installed_integrations ?? 420).toLocaleString()} />
        <MonopolyMetricCard label="Workflows" value={(lockin?.workflows_dependent ?? 1_840).toLocaleString()} />
        <MonopolyMetricCard label="Seats expanded" value={(lockin?.seats_expanded ?? 12_600).toLocaleString()} />
        <MonopolyMetricCard label="Switching cost" value={lockin?.switching_cost ?? "Extreme"} />
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-5">
        {(lockin?.dependency_chart ?? []).map((item) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4" key={item.driver}>
            <p className="text-sm font-semibold text-white">{item.driver}</p>
            <div className="mt-4">
              <MonopolyBar label="Dependency" value={item.score} />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 rounded-[20px] border border-white/10 bg-white/[0.035] p-4 text-sm leading-6 text-white/58">
        {lockin?.responsible_note ?? "Lock-in is built through measurable customer value, interoperability, trust, and data-driven outcomes."}
      </p>
    </MonopolyPanelShell>
  );
}

