"use client";

import { useOmega } from "@/lib/omega/use-omega";
import { OmegaPanelShell, OmegaPill, omegaList, omegaNumber, omegaRecord, omegaString } from "@/modules/dashboard/components/omega-panel-primitives";

export function EarthDigitalTwin() {
  const { planetary } = useOmega();
  const earthTwin = omegaRecord(planetary?.earth_twin);
  const hotspots = omegaList<Record<string, unknown>>(earthTwin.crisis_hotspots);

  return (
    <OmegaPanelShell
      description="Lightweight digital twin with live pulses for stress zones, crisis hotspots, and command posture."
      eyebrow="Earth Digital Twin"
      title={omegaString(earthTwin.operational_state, "Planetary watch stable")}
      tone="gold"
    >
      <div className="relative min-h-[280px] overflow-hidden rounded-[30px] border border-cyan-200/12 bg-[radial-gradient(circle_at_50%_45%,rgba(34,211,238,0.22),rgba(2,6,23,0.2)_34%,rgba(2,6,23,0.86)_68%)] p-5">
        <div className="absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/20 bg-cyan-300/[0.035] shadow-[0_0_80px_rgba(34,211,238,0.22)]" />
        {hotspots.map((hotspot, index) => (
          <div
            className="absolute rounded-full border border-red-200/30 bg-red-300/20 px-3 py-1 text-xs font-semibold text-red-50 shadow-[0_0_24px_rgba(248,113,113,0.35)]"
            key={`${omegaString(hotspot.name, "hotspot")}-${index}`}
            style={{ left: `${18 + index * 22}%`, top: `${28 + (index % 2) * 34}%` }}
          >
            {omegaString(hotspot.name, "Hotspot")} / {omegaNumber(hotspot.severity, 70)}
          </div>
        ))}
        <div className="absolute bottom-5 left-5 flex flex-wrap gap-2">
          <OmegaPill>{omegaNumber(earthTwin.countries_modeled, 195)} countries</OmegaPill>
          <OmegaPill tone="gold">{omegaNumber(earthTwin.cities_active, 512)}+ cities</OmegaPill>
        </div>
      </div>
    </OmegaPanelShell>
  );
}

