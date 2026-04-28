"use client";

import { useCivilizationInfra } from "@/lib/civilization-infra/use-civilization-infra";
import {
  CivilizationBar,
  CivilizationMetricCard,
  CivilizationPanelShell,
  civNumber,
} from "@/modules/dashboard/components/civilization-panel-primitives";

const FALLBACK_CORRIDORS = [
  { flow: 92, mode: "Air", name: "National Air Relief Spine", reroute: 91 },
  { flow: 88, mode: "Rail", name: "Intercity Medical Rail", reroute: 89 },
  { flow: 86, mode: "Sea", name: "Port Continuity Lane", reroute: 87 },
  { flow: 90, mode: "Metro", name: "Urban Emergency Corridor", reroute: 93 },
];

export function TransportCommandPanel() {
  const { live, transport } = useCivilizationInfra();
  const corridors = transport?.corridors?.length ? transport.corridors : FALLBACK_CORRIDORS;

  return (
    <CivilizationPanelShell
      description="Airports, ports, rail, metro, and freight corridors coordinated for rapid reroute and national recovery."
      eyebrow="Transport Command Engine"
      title={`${civNumber.format(live?.transport_nodes ?? transport?.transport_nodes ?? 1_840)} transport nodes under command`}
    >
      <div className="grid gap-3 md:grid-cols-6">
        <CivilizationMetricCard label="Airports" value={transport?.airports ?? 132} />
        <CivilizationMetricCard label="Ports" value={transport?.ports ?? 78} />
        <CivilizationMetricCard label="Rail" value={transport?.rail_nodes ?? 620} />
        <CivilizationMetricCard label="Metro" value={transport?.metro_nodes ?? 244} />
        <CivilizationMetricCard label="Freight" value={transport?.freight_nodes ?? 766} />
        <CivilizationMetricCard label="Reroute" value={`${transport?.reroute_efficiency ?? 91}%`} />
      </div>
      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {corridors.map((corridor) => (
          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4" key={`${corridor.mode}-${corridor.name}`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">{corridor.name}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-cyan-100/45">{corridor.mode}</p>
              </div>
              <span className="rounded-full border border-amber-200/18 bg-amber-200/10 px-3 py-1 text-xs font-semibold text-amber-50">
                {corridor.reroute}% reroute
              </span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <CivilizationBar label="Flow" value={corridor.flow} />
              <CivilizationBar label="Reroute efficiency" value={corridor.reroute} />
            </div>
          </div>
        ))}
      </div>
    </CivilizationPanelShell>
  );
}
