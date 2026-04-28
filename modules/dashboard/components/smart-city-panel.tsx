"use client";

import { useGovernment } from "@/lib/government/use-government";
import {
  GovernmentMetricTile,
  GovernmentPanelChrome,
  govNumber,
} from "@/modules/dashboard/components/government-panel-primitives";

export function SmartCityPanel() {
  const { live, copilot } = useGovernment();

  return (
    <GovernmentPanelChrome
      description="Smart city command links transport, utilities, health, education, telecom, ports, airports, and local administration into one response mesh."
      eyebrow="Smart City Crisis Operations"
      title={`${live?.states_connected ?? 28} states connected with ${govNumber(copilot?.multi_agency && typeof copilot.multi_agency === "object" ? (copilot.multi_agency as Record<string, unknown>).communication_mesh_health : 89, 89)}% mesh health`}
    >
      <div className="grid gap-3 md:grid-cols-4">
        <GovernmentMetricTile label="Agencies" value={live?.active_agencies ?? 9} />
        <GovernmentMetricTile label="States" value={live?.states_connected ?? 28} />
        <GovernmentMetricTile label="Threat" value={live?.threat_level ?? "Moderate"} />
        <GovernmentMetricTile label="Recovery" value={`${live?.recovery_confidence ?? 91}%`} />
      </div>
    </GovernmentPanelChrome>
  );
}
