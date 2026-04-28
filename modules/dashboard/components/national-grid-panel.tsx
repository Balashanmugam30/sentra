"use client";

import { useCivilizationInfra } from "@/lib/civilization-infra/use-civilization-infra";
import {
  CivilizationBar,
  CivilizationMetricCard,
  CivilizationPanelShell,
  civNumber,
} from "@/modules/dashboard/components/civilization-panel-primitives";

const FALLBACK_COUNTRIES = [
  { country: "India", emergency_mesh_health: 94, ministries_active: 14, population_supported: 142_000_000, readiness: 93 },
  { country: "USA", emergency_mesh_health: 91, ministries_active: 11, population_supported: 96_000_000, readiness: 90 },
  { country: "UAE", emergency_mesh_health: 97, ministries_active: 8, population_supported: 18_000_000, readiness: 96 },
  { country: "Singapore", emergency_mesh_health: 98, ministries_active: 7, population_supported: 8_000_000, readiness: 97 },
];

export function NationalGridPanel() {
  const { grid, live } = useCivilizationInfra();
  const countries = grid?.countries?.length ? grid.countries : FALLBACK_COUNTRIES;

  return (
    <CivilizationPanelShell
      description="Country command mesh linking ministries, emergency rooms, continuity cells, and national readiness posture."
      eyebrow="National Grid Engine"
      title={`${grid?.readiness_score ?? 94}% readiness across ${live?.countries_connected ?? grid?.countries_connected ?? 31} connected countries`}
      tone="gold"
    >
      <div className="grid gap-3 md:grid-cols-4">
        <CivilizationMetricCard label="Ministries active" value={grid?.ministries_active ?? 112} />
        <CivilizationMetricCard label="Mesh health" value={`${grid?.emergency_mesh_health ?? 95}%`} />
        <CivilizationMetricCard label="Population covered" value={civNumber.format(live?.population_supported ?? 412_000_000)} />
        <CivilizationMetricCard label="Command posture" value={grid?.command_posture ?? "Sovereign ready"} />
      </div>
      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {countries.map((country) => (
          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4" key={country.country}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">{country.country}</p>
                <p className="mt-1 text-xs text-white/46">
                  {country.ministries_active} ministries / {civNumber.format(country.population_supported)} people
                </p>
              </div>
              <span className="rounded-full border border-cyan-200/18 bg-cyan-200/10 px-3 py-1 text-xs font-semibold text-cyan-50">
                {country.readiness}%
              </span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <CivilizationBar label="Readiness" value={country.readiness} />
              <CivilizationBar label="Emergency mesh" value={country.emergency_mesh_health} />
            </div>
          </div>
        ))}
      </div>
    </CivilizationPanelShell>
  );
}
