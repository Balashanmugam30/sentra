"use client";

import { useCivilizationInfra } from "@/lib/civilization-infra/use-civilization-infra";
import {
  CivilizationBar,
  CivilizationMetricCard,
  CivilizationPanelShell,
  civNumber,
} from "@/modules/dashboard/components/civilization-panel-primitives";

const FALLBACK_REGIONS = [
  { hospitals: 520, icu_load: 68, region: "North Medical Mesh", surge: 86 },
  { hospitals: 640, icu_load: 72, region: "South Trauma Grid", surge: 88 },
  { hospitals: 590, icu_load: 64, region: "Metro Hospital Spine", surge: 91 },
  { hospitals: 730, icu_load: 69, region: "Western Surge Ring", surge: 87 },
];

export function HealthcareNetworkPanel() {
  const { healthcare, live } = useCivilizationInfra();
  const regions = healthcare?.hospital_regions?.length ? healthcare.hospital_regions : FALLBACK_REGIONS;

  return (
    <CivilizationPanelShell
      description="Hospital coordination, ICU pressure, ambulance routing, medicine reserves, and surge readiness."
      eyebrow="Healthcare Network Engine"
      title={`${civNumber.format(live?.hospitals_connected ?? healthcare?.hospitals_connected ?? 2_480)} hospitals connected`}
    >
      <div className="grid gap-3 md:grid-cols-4">
        <CivilizationMetricCard label="ICU load" value={`${healthcare?.icu_load ?? 68}%`} />
        <CivilizationMetricCard label="Ambulance routing" value={`${healthcare?.ambulance_routing ?? 92}%`} />
        <CivilizationMetricCard label="Medicine reserves" value={`${healthcare?.medicine_reserves_days ?? 29}d`} />
        <CivilizationMetricCard label="Surge readiness" value={`${healthcare?.surge_readiness ?? 88}%`} />
      </div>
      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {regions.map((region) => (
          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4" key={region.region}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">{region.region}</p>
                <p className="mt-1 text-xs text-white/45">{region.hospitals} hospitals connected</p>
              </div>
              <span className="rounded-full border border-cyan-200/18 bg-cyan-200/10 px-3 py-1 text-xs font-semibold text-cyan-50">
                Surge {region.surge}%
              </span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <CivilizationBar label="ICU load" value={region.icu_load} />
              <CivilizationBar label="Surge capacity" value={region.surge} />
            </div>
          </div>
        ))}
      </div>
    </CivilizationPanelShell>
  );
}
