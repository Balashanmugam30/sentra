"use client";

import { useDataEmpire } from "@/lib/data-empire/use-data-empire";
import {
  DataEmpireBar,
  DataEmpireMetricCard,
  DataEmpirePanelShell,
} from "@/modules/dashboard/components/data-empire-primitives";

export function LiveSignalGrid() {
  const { pipelines, signals, sources, summary } = useDataEmpire();
  const topSource = sources[0];

  return (
    <DataEmpirePanelShell
      description="Live ingestion across revenue, crisis, sensors, ecosystem usage, user actions, and AI outcomes with privacy-safe signal scoring."
      eyebrow="Live Signal Grid"
      title={`${topSource?.name ?? "AI Decisions"} is the highest-volume proprietary stream`}
    >
      <div className="grid gap-3 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="grid gap-3 md:grid-cols-2">
          {sources.slice(0, 8).map((source) => (
            <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4" key={source.source_id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">{source.name}</p>
                  <p className="mt-1 text-xs text-white/42">{source.category}</p>
                </div>
                <span className="rounded-full border border-cyan-200/16 bg-cyan-200/8 px-3 py-1 text-xs font-semibold text-cyan-50">
                  {source.privacy_tier}
                </span>
              </div>
              <div className="mt-4">
                <DataEmpireBar label="Trust" value={source.trust_score} />
              </div>
              <p className="mt-3 text-xs text-white/50">{source.signals_day.toLocaleString()} signals/day</p>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <DataEmpireMetricCard label="Strongest signal" note="highest fusion impact" value={summary?.strongest_signal ?? "AI Decisions"} />
          <DataEmpireMetricCard label="Prediction value" value={`${summary?.highest_prediction_value ?? 98}%`} />
          <DataEmpireMetricCard label="Decision impact" value={`${summary?.decision_impact_index ?? 96}%`} />
          {signals.slice(0, 3).map((signal) => (
            <DataEmpireBar key={signal.signal_id} label={signal.source} value={signal.decision_impact} />
          ))}
          <div className="rounded-[22px] border border-white/10 bg-white/[0.035] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-white/40">Pipeline health</p>
            <div className="mt-3 space-y-3">
              {pipelines.slice(0, 3).map((pipeline) => (
                <DataEmpireBar key={pipeline.pipeline_id} label={pipeline.name} value={pipeline.quality_score} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </DataEmpirePanelShell>
  );
}
