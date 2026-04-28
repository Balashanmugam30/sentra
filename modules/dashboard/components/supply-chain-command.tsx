"use client";

import { useOmega } from "@/lib/omega/use-omega";
import { OmegaBar, OmegaMetricCard, OmegaPanelShell, omegaList, omegaNumber, omegaString } from "@/modules/dashboard/components/omega-panel-primitives";

export function SupplyChainCommand() {
  const { live, logistics } = useOmega();
  const chokepoints = omegaList<Record<string, unknown>>(logistics?.chokepoints);

  return (
    <OmegaPanelShell
      description="Ports, sea lanes, semiconductors, fuel routes, and logistics rerouting intelligence."
      eyebrow="Supply Chain AI"
      title={`${live?.metrics?.supply_chokepoints ?? omegaNumber(logistics?.supply_chokepoints, 6)} chokepoints under watch`}
    >
      <div className="grid gap-3 md:grid-cols-4">
        <OmegaMetricCard label="Ports watch" value={omegaNumber(logistics?.ports_watch, 14)} />
        <OmegaMetricCard label="Semiconductor risk" value={`${omegaNumber(logistics?.semiconductor_risk, 36)}%`} />
        <OmegaMetricCard label="Fuel resilience" value={`${omegaNumber(logistics?.fuel_route_resilience, 83)}%`} />
        <OmegaMetricCard label="Reroute" value={`${omegaNumber(logistics?.reroute_efficiency, 89)}%`} />
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {chokepoints.map((point, index) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4" key={`${omegaString(point.node, "node")}-${index}`}>
            <p className="text-sm font-semibold text-white">{omegaString(point.node, "Chokepoint")}</p>
            <p className="mt-1 text-xs text-white/50">Reroute: {omegaString(point.reroute, "contingency route")}</p>
            <div className="mt-4">
              <OmegaBar label="Pressure" value={omegaNumber(point.pressure, 60)} />
            </div>
          </div>
        ))}
      </div>
    </OmegaPanelShell>
  );
}

