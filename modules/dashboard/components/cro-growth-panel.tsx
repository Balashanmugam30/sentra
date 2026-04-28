"use client";

import { useExecution } from "@/lib/execution/use-execution";
import {
  ExecutionMetricTile,
  ExecutionPanelChrome,
  ExecutionPill,
  exList,
  exNumber,
  executionMoney,
} from "@/modules/dashboard/components/execution-panel-primitives";

export function CroGrowthPanel() {
  const { cro } = useExecution();

  return (
    <ExecutionPanelChrome
      description="Revenue AI merges CRM, global growth, partners, renewals, and customer expansion into a single GTM execution lens."
      eyebrow="CRO Revenue AI"
      title={`${executionMoney.format(exNumber(cro?.pipeline, 18_400_000))} pipeline with ${exNumber(cro?.GTM_efficiency, 87)}% GTM efficiency`}
    >
      <div className="grid gap-3 md:grid-cols-4">
        <ExecutionMetricTile label="Net New ARR" value={executionMoney.format(exNumber(cro?.net_new_ARR, 2_600_000))} />
        <ExecutionMetricTile label="Expansion ARR" value={executionMoney.format(exNumber(cro?.expansion_ARR, 1_850_000))} />
        <ExecutionMetricTile label="Renewal Confidence" value={`${exNumber(cro?.renewal_confidence, 91)}%`} />
        <ExecutionMetricTile label="Partner Contribution" value={`${exNumber(cro?.partner_contribution_percent, 38)}%`} />
      </div>
      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        <div className="rounded-[24px] border border-cyan-200/14 bg-cyan-200/[0.045] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/52">Territory winners</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {exList<string>(cro?.territory_winners).map((item) => (
              <ExecutionPill key={item} label={item} tone="gold" />
            ))}
          </div>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-white/[0.035] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-white/42">Recommended moves</p>
          <div className="mt-3 space-y-2">
            {exList<string>(cro?.recommended_moves).map((item) => (
              <p className="text-sm leading-6 text-white/62" key={item}>{item}</p>
            ))}
          </div>
        </div>
      </div>
    </ExecutionPanelChrome>
  );
}
