"use client";

import { useExecution } from "@/lib/execution/use-execution";
import {
  ExecutionActionButton,
  ExecutionMetricTile,
  ExecutionPanelChrome,
  exList,
  exNumber,
  exRecord,
  exString,
  executionMoney,
} from "@/modules/dashboard/components/execution-panel-primitives";

type ForecastScenario = { scenario: string; runway_months: number; valuation_effect: string };

export function CfoWarRoom() {
  const { cfo, costMode, growthMode, raisePlan, busyAction } = useExecution();
  const spend = exRecord(cfo?.department_spend);

  return (
    <ExecutionPanelChrome
      action={
        <>
          <ExecutionActionButton disabled={busyAction === "cost"} onClick={() => void costMode()} tone="red">
            Cut Costs 10%
          </ExecutionActionButton>
          <ExecutionActionButton disabled={busyAction === "growth"} onClick={() => void growthMode()}>
            Allocate Growth Budget
          </ExecutionActionButton>
          <ExecutionActionButton disabled={busyAction === "raise"} onClick={() => void raisePlan()} tone="gold">
            Raise Plan
          </ExecutionActionButton>
        </>
      }
      description={exString(cfo?.raise_timing_recommendation, "Raise after UAE anchor or if strategic investor offers $120M+ pre-money.")}
      eyebrow="CFO War Room"
      title={`${executionMoney.format(exNumber(cfo?.cash_balance, 9_400_000))} cash with ${exNumber(cfo?.runway_months, 36)} months runway`}
    >
      <div className="grid gap-3 md:grid-cols-4">
        <ExecutionMetricTile label="Burn Multiple" value={exNumber(cfo?.burn_multiple, 1.2)} />
        <ExecutionMetricTile label="Gross Margin" value={`${exNumber(cfo?.gross_margin_percent, 84)}%`} />
        <ExecutionMetricTile label="Monthly Burn" value={executionMoney.format(exNumber(cfo?.monthly_burn, 260_000))} />
        <ExecutionMetricTile label="Budget Leaks" value={exList<string>(cfo?.budget_leaks).length || 3} />
      </div>
      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        <div className="rounded-[24px] border border-white/10 bg-white/[0.035] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-white/42">Department spend</p>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {Object.entries(spend).map(([label, value]) => (
              <div className="rounded-[16px] border border-white/8 bg-black/10 p-3" key={label}>
                <p className="text-xs capitalize text-white/46">{label.replaceAll("_", " ")}</p>
                <p className="mt-1 text-sm font-semibold text-white">{executionMoney.format(exNumber(value))}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-2 rounded-[24px] border border-amber-200/14 bg-amber-200/[0.055] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-amber-100/54">Scenario forecasting</p>
          {exList<ForecastScenario>(cfo?.scenario_forecasting).map((item) => (
            <div className="flex items-center justify-between gap-3 rounded-[16px] border border-white/8 bg-black/10 p-3 text-sm" key={item.scenario}>
              <span className="font-semibold text-white">{item.scenario}</span>
              <span className="text-cyan-50/60">{item.runway_months}mo / {item.valuation_effect}</span>
            </div>
          ))}
        </div>
      </div>
    </ExecutionPanelChrome>
  );
}
