"use client";

import { useCivilizationInfra } from "@/lib/civilization-infra/use-civilization-infra";
import {
  CivilizationBar,
  CivilizationMetricCard,
  CivilizationPanelShell,
} from "@/modules/dashboard/components/civilization-panel-primitives";

const FALLBACK_CITIES = [
  { city: "Mumbai", crowd_flow: 88, emergency_corridors: 91, public_safety: 90, traffic_intelligence: 92 },
  { city: "Dubai", crowd_flow: 94, emergency_corridors: 96, public_safety: 95, traffic_intelligence: 95 },
  { city: "Singapore", crowd_flow: 96, emergency_corridors: 97, public_safety: 96, traffic_intelligence: 98 },
  { city: "New York", crowd_flow: 86, emergency_corridors: 89, public_safety: 88, traffic_intelligence: 90 },
];

export function MegaCityOpsMap() {
  const { cities, live } = useCivilizationInfra();
  const cityList = cities?.cities?.length ? cities.cities : FALLBACK_CITIES;

  return (
    <CivilizationPanelShell
      description="Megacity overlay for traffic intelligence, crowd flow, emergency corridors, and public-safety posture."
      eyebrow="Mega City Engine"
      title={`${live?.cities_active ?? cities?.cities_onboarded ?? 148} cities synchronized`}
    >
      <div className="grid gap-3 md:grid-cols-4">
        <CivilizationMetricCard label="Traffic intel" value={`${cities?.traffic_intelligence ?? 93}%`} />
        <CivilizationMetricCard label="Crowd flow" value={`${cities?.crowd_flow ?? 91}%`} />
        <CivilizationMetricCard label="Corridors" value={`${cities?.emergency_corridors ?? 92}%`} />
        <CivilizationMetricCard label="Public safety" value={`${cities?.public_safety_posture ?? 91}%`} />
      </div>
      <div className="mt-5 grid gap-3 lg:grid-cols-4">
        {cityList.map((city) => (
          <div className="relative overflow-hidden rounded-[26px] border border-cyan-200/12 bg-[radial-gradient(circle_at_35%_25%,rgba(34,211,238,0.2),rgba(255,255,255,0.035)_55%)] p-4" key={city.city}>
            <div className="absolute right-5 top-5 h-3 w-3 rounded-full bg-cyan-300 shadow-[0_0_22px_rgba(34,211,238,0.8)]" />
            <p className="text-sm font-semibold text-white">{city.city}</p>
            <p className="mt-1 text-xs text-white/45">Live continuity node</p>
            <div className="mt-5 space-y-3">
              <CivilizationBar label="Traffic" value={city.traffic_intelligence} />
              <CivilizationBar label="Crowd" value={city.crowd_flow} />
              <CivilizationBar label="Corridors" value={city.emergency_corridors} />
            </div>
          </div>
        ))}
      </div>
    </CivilizationPanelShell>
  );
}
