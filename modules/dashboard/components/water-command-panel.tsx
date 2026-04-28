"use client";

import { useCivilizationInfra } from "@/lib/civilization-infra/use-civilization-infra";
import {
  CivilizationBar,
  CivilizationMetricCard,
  CivilizationPanelShell,
} from "@/modules/dashboard/components/civilization-panel-primitives";

const FALLBACK_SYSTEMS = [
  { capacity: 91, name: "Reservoir Alpha", quality: 94, risk: 10 },
  { capacity: 87, name: "Metro Treatment Spine", quality: 92, risk: 14 },
  { capacity: 83, name: "Drought Buffer Network", quality: 89, risk: 19 },
];

export function WaterCommandPanel() {
  const { live, water } = useCivilizationInfra();
  const systems = water?.water_systems?.length ? water.water_systems : FALLBACK_SYSTEMS;

  return (
    <CivilizationPanelShell
      description="Reservoirs, purification plants, leak detection, drought pressure, and water-security continuity."
      eyebrow="Water Command Engine"
      title={`${live?.water_security_score ?? water?.water_security_score ?? 91}% water security score`}
    >
      <div className="grid gap-3 md:grid-cols-5">
        <CivilizationMetricCard label="Reservoirs" value={water?.reservoirs ?? 420} />
        <CivilizationMetricCard label="Purification" value={water?.purification_plants ?? 188} />
        <CivilizationMetricCard label="Leak detection" value={`${water?.leak_detection ?? 93}%`} />
        <CivilizationMetricCard label="Drought pressure" value={`${water?.drought_pressure ?? 24}%`} />
        <CivilizationMetricCard label="Security" value={`${water?.water_security_score ?? 91}%`} />
      </div>
      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        {systems.map((system) => (
          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4" key={system.name}>
            <p className="text-sm font-semibold text-white">{system.name}</p>
            <div className="mt-4 space-y-3">
              <CivilizationBar label="Capacity" value={system.capacity} />
              <CivilizationBar label="Quality" value={system.quality} />
              <CivilizationBar label="Risk inverse" value={100 - system.risk} />
            </div>
          </div>
        ))}
      </div>
    </CivilizationPanelShell>
  );
}
