"use client";

import { useGovernment } from "@/lib/government/use-government";
import {
  GovernmentActionButton,
  GovernmentPanelChrome,
  govList,
  govNumber,
  governmentMoney,
} from "@/modules/dashboard/components/government-panel-primitives";

type DisasterScenario = {
  scenario: string;
  casualty_estimate: number;
  recovery_eta: string;
  financial_damage: number;
  resource_gaps: string[];
};

export function DisasterWarRoom() {
  const { disaster, runSimulation, busyAction } = useGovernment();

  return (
    <GovernmentPanelChrome
      action={
        <GovernmentActionButton disabled={busyAction === "simulation-Cyclone"} onClick={() => void runSimulation("Cyclone")} tone="red">
          Run Cyclone
        </GovernmentActionButton>
      }
      description="Disaster simulation covers flood, earthquake, terror attack, chemical leak, power outage, wildfire, cyclone, and pandemic wave."
      eyebrow="Disaster War Room"
      title={`${disaster?.active_scenario ?? "Cyclone"} readiness with ${govNumber(disaster?.recovery_confidence, 91)}% recovery confidence`}
    >
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {govList<DisasterScenario>(disaster?.scenarios).map((item) => (
          <button
            className="rounded-[22px] border border-white/10 bg-white/[0.035] p-4 text-left transition hover:border-orange-200/30 hover:bg-orange-300/[0.055]"
            key={item.scenario}
            onClick={() => void runSimulation(item.scenario)}
            type="button"
          >
            <p className="text-sm font-semibold text-white">{item.scenario}</p>
            <p className="mt-2 text-xs text-orange-50/64">{item.casualty_estimate.toLocaleString()} casualty estimate</p>
            <p className="mt-1 text-xs text-cyan-50/56">{item.recovery_eta} recovery</p>
            <p className="mt-1 text-xs text-white/42">{governmentMoney.format(item.financial_damage)} damage</p>
          </button>
        ))}
      </div>
      <div className="mt-5 rounded-[24px] border border-cyan-200/14 bg-cyan-200/[0.045] p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/52">Best response plan</p>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {govList<string>(disaster?.best_response_plan).map((item) => (
            <p className="text-sm leading-6 text-white/64" key={item}>{item}</p>
          ))}
        </div>
      </div>
    </GovernmentPanelChrome>
  );
}
