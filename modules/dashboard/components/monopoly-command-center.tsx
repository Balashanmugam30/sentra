"use client";

import { useMonopolyExpansion } from "@/lib/monopoly-expansion/use-monopoly-expansion";
import {
  MonopolyActionButton,
  MonopolyMetricCard,
  MonopolyPanelShell,
  monopolyMoney,
} from "@/modules/dashboard/components/monopoly-panel-primitives";

export function MonopolyCommandCenter() {
  const { busyAction, error, live, loading, refresh, runExpansionSimulation } = useMonopolyExpansion();

  return (
    <MonopolyPanelShell
      action={
        <div className="flex flex-wrap gap-2">
          <MonopolyActionButton onClick={() => void refresh()}>{loading ? "Syncing..." : "Refresh"}</MonopolyActionButton>
          <MonopolyActionButton busy={busyAction === "simulation"} onClick={() => void runExpansionSimulation()}>
            {busyAction === "simulation" ? "Simulating..." : "Run Expansion Sim"}
          </MonopolyActionButton>
        </div>
      }
      description="Acquisitions, partnerships, geographic conquest, bundling, procurement default, ecosystem lock-in, and responsible winner-take-most flywheels."
      eyebrow="Monopoly Expansion OS"
      title={`${live?.label ?? "DEFAULT GLOBAL CHOICE"} with ${live?.monopoly_score ?? 97}/100 expansion score`}
      tone="gold"
    >
      {error ? (
        <div className="mb-4 rounded-[20px] border border-amber-300/20 bg-amber-300/10 p-3 text-sm text-amber-50">
          Expansion intelligence is serving last verified state: {error}
        </div>
      ) : null}
      <div className="grid gap-3 md:grid-cols-5">
        <MonopolyMetricCard label="Countries" note="active footprint" value={live?.countries_active ?? 24} />
        <MonopolyMetricCard label="Regions" note="controlled motion" value={live?.regions_controlled ?? 9} />
        <MonopolyMetricCard label="Customers" note="enterprise base" value={(live?.enterprise_customers ?? 188).toLocaleString()} />
        <MonopolyMetricCard label="Partner revenue" note="distribution power" value={monopolyMoney.format(live?.partner_revenue ?? 8_400_000)} />
        <MonopolyMetricCard label="Switching cost" note="value gravity" value={live?.avg_switching_cost_index ?? "Extreme"} />
      </div>
      <p className="mt-4 rounded-[22px] border border-cyan-200/12 bg-cyan-200/8 p-4 text-sm leading-6 text-cyan-50/76">
        {live?.dominance_thesis ??
          "Sentra becomes the default global choice by compounding customer value, trusted procurement proof, ecosystem depth, and responsible data gravity."}
      </p>
    </MonopolyPanelShell>
  );
}

