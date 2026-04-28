"use client";

import { useDataEmpire } from "@/lib/data-empire/use-data-empire";
import {
  DataEmpireActionButton,
  DataEmpireBar,
  DataEmpirePanelShell,
} from "@/modules/dashboard/components/data-empire-primitives";

export function DataSourceControl() {
  const { busyAction, pipelines, runIngestion, sources } = useDataEmpire();

  return (
    <DataEmpirePanelShell
      action={
        <DataEmpireActionButton busy={busyAction === "ingestion"} onClick={() => void runIngestion()}>
          {busyAction === "ingestion" ? "Ingesting..." : "Run Safe Ingestion"}
        </DataEmpireActionButton>
      }
      description="Control plane for tenant-scoped ingestion sources, privacy tiers, freshness windows, cleansing quality, dedupe, and masking."
      eyebrow="Data Source Control"
      title={`${sources.length || 14} signal families flowing through governed pipelines`}
    >
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm font-semibold text-white">Source freshness</p>
          <div className="mt-4 space-y-3">
            {sources.slice(0, 7).map((source) => (
              <DataEmpireBar key={source.source_id} label={source.name} max={10_000} value={10_000 - source.freshness_seconds} />
            ))}
          </div>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm font-semibold text-white">Pipeline quality</p>
          <div className="mt-4 space-y-3">
            {pipelines.map((pipeline) => (
              <DataEmpireBar key={pipeline.pipeline_id} label={`${pipeline.name} (${pipeline.status})`} value={pipeline.quality_score} />
            ))}
          </div>
        </div>
      </div>
    </DataEmpirePanelShell>
  );
}
