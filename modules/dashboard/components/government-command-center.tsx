"use client";

import { useGovernment } from "@/lib/government/use-government";
import {
  GovernmentActionButton,
  GovernmentMetricTile,
  GovernmentPanelChrome,
} from "@/modules/dashboard/components/government-panel-primitives";

export function GovernmentCommandCenter() {
  const { live, loading, error, refresh, activateEmergency, generateReport, busyAction } = useGovernment();

  return (
    <GovernmentPanelChrome
      action={
        <>
          <GovernmentActionButton onClick={() => void refresh()}>{loading ? "Syncing..." : "Refresh"}</GovernmentActionButton>
          <GovernmentActionButton disabled={busyAction === "emergency"} onClick={() => void activateEmergency()} tone="red">
            Activate Emergency
          </GovernmentActionButton>
          <GovernmentActionButton disabled={busyAction === "report"} onClick={() => void generateReport()} tone="gold">
            Generate Report
          </GovernmentActionButton>
        </>
      }
      description="Sovereign readiness, defense grid, critical infrastructure, continuity, border AI, and multi-agency response unified into a national command layer."
      eyebrow="Global Defense + Government Command OS"
      title={`National readiness ${live?.national_readiness ?? 89} with ${live?.states_connected ?? 28} states connected`}
    >
      <div className="grid gap-3 md:grid-cols-4">
        <GovernmentMetricTile label="Cyber Defense" note="national cyber posture" value={`${live?.cyber_defense ?? 92}%`} />
        <GovernmentMetricTile label="Medical Surge" note="capacity index" value={`${live?.medical_surge_capacity ?? 81}%`} />
        <GovernmentMetricTile label="Threat Level" note="current national signal" value={live?.threat_level ?? "Moderate"} />
        <GovernmentMetricTile label="Recovery Confidence" note="continuity model" value={`${live?.recovery_confidence ?? 91}%`} />
      </div>
      {error ? (
        <div className="mt-4 rounded-[20px] border border-orange-300/20 bg-orange-400/10 p-4 text-sm text-orange-50">
          Government telemetry delayed. Showing last verified sovereign command state.
        </div>
      ) : null}
    </GovernmentPanelChrome>
  );
}
