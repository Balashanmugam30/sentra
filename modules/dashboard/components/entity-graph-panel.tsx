"use client";

import { useDataEmpire } from "@/lib/data-empire/use-data-empire";
import {
  DataEmpireBar,
  DataEmpireMetricCard,
  DataEmpirePanelShell,
} from "@/modules/dashboard/components/data-empire-primitives";

export function EntityGraphPanel() {
  const { graph } = useDataEmpire();
  const nodes = graph?.nodes ?? [];
  const relationships = graph?.relationships ?? [];

  return (
    <DataEmpirePanelShell
      description="A connected tenant intelligence graph linking people, companies, incidents, risks, assets, agencies, devices, workflows, and signals."
      eyebrow="Entity Graph Engine"
      title={`${((graph?.linked_entities ?? 2_100_000) / 1_000_000).toFixed(1)}M linked entities powering prediction and defensibility`}
    >
      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative min-h-[280px] rounded-[26px] border border-white/10 bg-[radial-gradient(circle_at_50%_45%,rgba(34,211,238,0.18),rgba(2,6,23,0.62)_58%)] p-5">
          {nodes.slice(0, 10).map((node, index) => (
            <div
              className="absolute rounded-full border border-cyan-200/30 bg-cyan-200/12 px-3 py-2 text-xs font-semibold text-cyan-50 shadow-[0_0_24px_rgba(34,211,238,0.18)]"
              key={node.id}
              style={{
                left: `${12 + ((index * 31) % 70)}%`,
                top: `${12 + ((index * 23) % 68)}%`,
              }}
            >
              {node.label}
            </div>
          ))}
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {nodes.slice(0, 6).map((node) => (
            <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4" key={node.id}>
              <p className="text-sm font-semibold text-white">{node.label}</p>
              <p className="mt-1 text-xs text-white/42">{node.entity_type}</p>
              <div className="mt-4 space-y-3">
                <DataEmpireBar label="Risk" value={node.risk_score} />
                <DataEmpireBar label="Value" value={node.value_score} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <DataEmpireMetricCard label="Relationships" value={relationships.length.toLocaleString()} />
        <DataEmpireMetricCard label="Avg confidence" value="94%" />
        <DataEmpireMetricCard label="Hidden clusters" value="18" />
        <DataEmpireMetricCard label="Graph freshness" value="Live" />
      </div>
    </DataEmpirePanelShell>
  );
}
