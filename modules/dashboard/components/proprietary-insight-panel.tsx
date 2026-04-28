"use client";

import { useDataEmpire } from "@/lib/data-empire/use-data-empire";
import {
  DataEmpireBar,
  DataEmpirePanelShell,
  dataEmpireMoney,
} from "@/modules/dashboard/components/data-empire-primitives";

export function ProprietaryInsightPanel() {
  const { insights } = useDataEmpire();

  return (
    <DataEmpirePanelShell
      description="Insights generated from proprietary cross-module signals that competitors cannot see or easily reproduce."
      eyebrow="Proprietary Insight Engine"
      title={`${insights.length || 5} non-obvious intelligence advantages detected`}
      tone="gold"
    >
      <div className="grid gap-3 lg:grid-cols-2">
        {insights.slice(0, 6).map((insight) => (
          <article className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4" key={insight.insight_id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-base font-semibold text-white">{insight.title}</p>
                <p className="mt-2 text-sm leading-6 text-white/55">{insight.detail}</p>
              </div>
              <span className="rounded-full border border-amber-200/20 bg-amber-200/10 px-3 py-1 text-xs font-semibold text-amber-50">
                {dataEmpireMoney.format(insight.monetization_value)}
              </span>
            </div>
            <p className="mt-3 text-xs uppercase tracking-[0.16em] text-cyan-50/50">{insight.impact}</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <DataEmpireBar label="Confidence" value={insight.confidence} />
              <DataEmpireBar label="Moat value" value={insight.moat_value} />
            </div>
            <p className="mt-4 rounded-[18px] border border-cyan-200/12 bg-cyan-200/8 p-3 text-sm text-cyan-50/80">
              {insight.suggested_action}
            </p>
          </article>
        ))}
      </div>
    </DataEmpirePanelShell>
  );
}
