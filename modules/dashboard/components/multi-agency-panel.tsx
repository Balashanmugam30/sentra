"use client";

import { useGovernment } from "@/lib/government/use-government";
import {
  GovernmentPanelChrome,
  GovernmentPill,
  govBar,
  govList,
  govNumber,
  govRecord,
  govString,
} from "@/modules/dashboard/components/government-panel-primitives";

type Agency = { agency: string; active_units: number; response_speed: number; readiness: number; communication_health: number };

export function MultiAgencyPanel() {
  const { copilot } = useGovernment();
  const multiAgency = govRecord(copilot?.multi_agency);

  return (
    <GovernmentPanelChrome
      description={govString(multiAgency.top_coordination_need, "Synchronize health, transport, and telecom for coastal cyclone response.")}
      eyebrow="Multi-Agency Coordination"
      title={`${govNumber(multiAgency.active_agencies, 9)} agencies active with ${govNumber(multiAgency.communication_mesh_health, 89)}% mesh health`}
    >
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {govList<Agency>(multiAgency.agencies).map((agency) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.035] p-4" key={agency.agency}>
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold text-white">{agency.agency}</p>
              <GovernmentPill label={`${agency.active_units} units`} />
            </div>
            <div className="mt-3 space-y-2">
              <div>
                <div className="flex justify-between text-xs text-white/44"><span>Response</span><span>{agency.response_speed}%</span></div>
                <div className="mt-1 h-2 rounded-full bg-white/10"><div className="h-full rounded-full bg-cyan-300/75" style={{ width: govBar(agency.response_speed) }} /></div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-white/44"><span>Comms</span><span>{agency.communication_health}%</span></div>
                <div className="mt-1 h-2 rounded-full bg-white/10"><div className="h-full rounded-full bg-amber-300/75" style={{ width: govBar(agency.communication_health) }} /></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </GovernmentPanelChrome>
  );
}
