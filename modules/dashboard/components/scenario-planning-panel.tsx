"use client";

import { useExecution } from "@/lib/execution/use-execution";
import {
  ExecutionPanelChrome,
  exList,
  executionMoney,
} from "@/modules/dashboard/components/execution-panel-primitives";

type Scenario = { scenario: string; revenue_impact: number; runway_impact: number; morale_impact: number; execution_strain: number; valuation_effect: number };

export function ScenarioPlanningPanel() {
  const { scenarios, runSimulation } = useExecution();

  return (
    <ExecutionPanelChrome
      description="Simulates hiring, layoffs, international expansion, fundraising, recession, churn spike, and competitor pressure."
      eyebrow="Scenario Planning"
      title="Org simulator compares revenue, runway, morale, strain, and valuation effects"
    >
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {exList<Scenario>(scenarios?.scenarios).map((item) => (
          <button
            className="rounded-[22px] border border-white/10 bg-white/[0.035] p-4 text-left transition hover:border-cyan-200/30 hover:bg-cyan-200/[0.055]"
            key={item.scenario}
            onClick={() => void runSimulation(item.scenario)}
            type="button"
          >
            <p className="text-sm font-semibold text-white">{item.scenario}</p>
            <p className="mt-2 text-xs text-cyan-50/62">Revenue {item.revenue_impact}% / Runway {item.runway_impact}mo</p>
            <p className="mt-1 text-xs text-white/46">Morale {item.morale_impact}% / Strain {item.execution_strain}% / Valuation {item.valuation_effect}%</p>
          </button>
        ))}
      </div>
      <p className="mt-4 text-xs text-white/44">Baseline ARR {executionMoney.format(8_200_000)}. Simulation uses deterministic execution metrics.</p>
    </ExecutionPanelChrome>
  );
}
