"use client";

import { useCivilizationInfra } from "@/lib/civilization-infra/use-civilization-infra";
import {
  CivilizationBar,
  CivilizationMetricCard,
  CivilizationPanelShell,
  civNumber,
} from "@/modules/dashboard/components/civilization-panel-primitives";

const FALLBACK_LAYERS = [
  { health: 96, layer: "Grid + utilities" },
  { health: 94, layer: "Health + transport" },
  { health: 92, layer: "Food + water" },
  { health: 95, layer: "Government continuity" },
];

export function ContinuityBackbonePanel() {
  const { continuity, live } = useCivilizationInfra();
  const layers = continuity?.continuity_layers?.length ? continuity.continuity_layers : FALLBACK_LAYERS;

  return (
    <CivilizationPanelShell
      description="Cross-sector recovery engine measuring ETA, redundancy depth, coordination, and population served."
      eyebrow="Continuity Backbone Engine"
      title={`${live?.recovery_coordination_score ?? continuity?.cross_sector_coordination ?? 96}% recovery coordination`}
      tone="gold"
    >
      <div className="grid gap-3 md:grid-cols-4">
        <CivilizationMetricCard label="Recovery ETA" value={`${continuity?.recovery_eta_minutes ?? 22}m`} />
        <CivilizationMetricCard label="Redundancy depth" value={`${continuity?.redundancy_depth ?? 7}x`} />
        <CivilizationMetricCard label="Coordination" value={`${continuity?.cross_sector_coordination ?? 96}%`} />
        <CivilizationMetricCard label="Population served" value={civNumber.format(continuity?.population_served ?? live?.population_supported ?? 412_000_000)} />
      </div>
      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {layers.map((layer) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4" key={layer.layer}>
            <CivilizationBar label={layer.layer} value={layer.health} />
          </div>
        ))}
      </div>
    </CivilizationPanelShell>
  );
}
