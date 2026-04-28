"use client";

import { useCivilizationInfra } from "@/lib/civilization-infra/use-civilization-infra";
import {
  CivilizationActionButton,
  CivilizationBar,
  CivilizationMetricCard,
  CivilizationPanelShell,
} from "@/modules/dashboard/components/civilization-panel-primitives";

const FALLBACK_RISKS = [
  { horizon: "7d", mitigation: "pre-stage pumps and rail diversion", probability: 31, risk: "Flood surge" },
  { horizon: "14d", mitigation: "shift load and open cooling centers", probability: 39, risk: "Heatwave grid pressure" },
  { horizon: "6d", mitigation: "activate air quality and evacuation mesh", probability: 27, risk: "Wildfire corridor" },
];

export function DisasterPredictionPanel() {
  const { busyAction, disasters, generateNationalBrief, live, runDisasterModel } = useCivilizationInfra();
  const risks = disasters?.future_risks?.length ? disasters.future_risks : FALLBACK_RISKS;

  return (
    <CivilizationPanelShell
      action={
        <div className="flex flex-wrap gap-2">
          <CivilizationActionButton busy={busyAction === "disaster-model"} onClick={() => void runDisasterModel()}>
            {busyAction === "disaster-model" ? "Modeling..." : "Run Disaster Model"}
          </CivilizationActionButton>
          <CivilizationActionButton busy={busyAction === "national-brief"} onClick={() => void generateNationalBrief()}>
            {busyAction === "national-brief" ? "Generating..." : "Generate National Brief"}
          </CivilizationActionButton>
        </div>
      }
      description="Flood, cyclone, wildfire, earthquake response, and heatwave forecasting with mitigation paths."
      eyebrow="Disaster Prediction Engine"
      title={`${live?.disaster_forecast_accuracy ?? disasters?.forecast_accuracy ?? 94}% forecast accuracy`}
      tone="danger"
    >
      <div className="grid gap-3 md:grid-cols-5">
        <CivilizationMetricCard label="Flood" value={`${disasters?.flood?.probability ?? 31}%`} note={`ETA ${disasters?.flood?.eta_days ?? 8}d`} />
        <CivilizationMetricCard label="Cyclone" value={`${disasters?.cyclone?.probability ?? 22}%`} note={`ETA ${disasters?.cyclone?.eta_days ?? 13}d`} />
        <CivilizationMetricCard label="Wildfire" value={`${disasters?.wildfire?.probability ?? 27}%`} note={`ETA ${disasters?.wildfire?.eta_days ?? 6}d`} />
        <CivilizationMetricCard label="Earthquake readiness" value={`${disasters?.earthquake_response_readiness ?? 86}%`} />
        <CivilizationMetricCard label="Heatwave risk" value={`${disasters?.heatwave_risk ?? 39}%`} />
      </div>
      <div className="mt-5 space-y-3">
        {risks.map((risk) => (
          <div className="rounded-[22px] border border-red-200/10 bg-red-200/[0.045] p-4" key={`${risk.risk}-${risk.horizon}`}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-white">{risk.risk}</p>
                <p className="mt-1 text-xs text-white/50">{risk.horizon} horizon / {risk.mitigation}</p>
              </div>
              <span className="rounded-full border border-red-200/18 bg-red-200/10 px-3 py-1 text-xs font-semibold text-red-50">
                {risk.probability}% probability
              </span>
            </div>
            <div className="mt-4">
              <CivilizationBar label="Mitigation pressure" value={risk.probability} />
            </div>
          </div>
        ))}
      </div>
    </CivilizationPanelShell>
  );
}
