"use client";

import { useOmega } from "@/lib/omega/use-omega";
import { OmegaBar, OmegaMetricCard, OmegaPanelShell, omegaList, omegaNumber, omegaRecord, omegaString } from "@/modules/dashboard/components/omega-panel-primitives";

export function GlobalThreatEngine() {
  const { live, threats } = useOmega();
  const threatList = omegaList<Record<string, unknown>>(threats?.threats);
  const topThreat = omegaRecord(threats?.top_threat ?? live?.top_threats?.[0]);

  return (
    <OmegaPanelShell
      description="Ranks war escalation, cyber attacks, civil unrest, trade collapse, sanctions pressure, and satellite disruption."
      eyebrow="Global Threat Engine"
      title={`${omegaString(topThreat.threat, "war escalation")} is the top fused threat`}
      tone="danger"
    >
      <div className="grid gap-3 md:grid-cols-4">
        <OmegaMetricCard label="Threat events" value={live?.metrics?.threat_events ?? 12} />
        <OmegaMetricCard label="War regions" value={live?.metrics?.war_risk_regions ?? 4} />
        <OmegaMetricCard label="Cyber probability" value={`${omegaNumber(omegaRecord(threats?.cyber).cyber_attack_probability, 37)}%`} />
        <OmegaMetricCard label="Diplomatic stability" value={`${omegaNumber(omegaRecord(threats?.geopolitics).diplomatic_stability, 84)}%`} />
      </div>
      <div className="mt-5 space-y-3">
        {threatList.map((threat, index) => (
          <div className="rounded-[22px] border border-red-200/10 bg-red-200/[0.045] p-4" key={`${omegaString(threat.threat, "threat")}-${index}`}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold capitalize text-white">{omegaString(threat.threat, "Threat")}</p>
              <span className="text-xs text-red-50">{omegaNumber(threat.probability, 30)}% probability</span>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <OmegaBar label="Severity" value={omegaNumber(threat.severity, 60)} />
              <p className="text-xs leading-5 text-white/52">{omegaString(threat.response, "Recommended response active.")}</p>
            </div>
          </div>
        ))}
      </div>
    </OmegaPanelShell>
  );
}

