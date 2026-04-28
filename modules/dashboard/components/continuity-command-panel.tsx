"use client";

import { useGovernment } from "@/lib/government/use-government";
import {
  GovernmentMetricTile,
  GovernmentPanelChrome,
  GovernmentPill,
  govList,
  govNumber,
  govString,
} from "@/modules/dashboard/components/government-panel-primitives";

export function ContinuityCommandPanel() {
  const { continuity } = useGovernment();

  return (
    <GovernmentPanelChrome
      action={<GovernmentPill label={govString(continuity?.strategic_continuity_class, "resilient")} tone="gold" />}
      description="Continuity command tracks alternate HQ, backup networks, emergency communications, leadership mobility, and strategic continuity readiness."
      eyebrow="Continuity Command"
      title={`${govNumber(continuity?.government_continuity_readiness, 88)}% continuity readiness`}
    >
      <div className="grid gap-3 md:grid-cols-4">
        <GovernmentMetricTile label="Alternate HQ" value={govString(continuity?.alternate_HQ_status, "warm standby")} />
        <GovernmentMetricTile label="Backup Network" value={`${govNumber(continuity?.backup_network_readiness, 92)}%`} />
        <GovernmentMetricTile label="Emergency Comms" value={`${govNumber(continuity?.emergency_communication_score, 90)}%`} />
        <GovernmentMetricTile label="Leadership Mobility" value={`${govNumber(continuity?.leadership_mobility_readiness, 86)}%`} />
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {govList<string>(continuity?.continuity_actions).map((item) => (
          <GovernmentPill key={item} label={item} />
        ))}
      </div>
    </GovernmentPanelChrome>
  );
}
