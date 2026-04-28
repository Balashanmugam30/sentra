"use client";

import { useAutonomy } from "@/lib/autonomy/use-autonomy";
import {
  AutonomyActionButton,
  AutonomyMetricTile,
  AutonomyPanelChrome,
  AutonomyPill,
  autoNumber,
  autoString,
} from "@/modules/dashboard/components/autonomy-panel-primitives";

export function AutonomyCommandCenter() {
  const { live, loading, error, refresh, busyAction, runLearningCycle } = useAutonomy();
  const metrics = live?.metrics;
  const topDecision = live?.top_decision ?? {};

  return (
    <AutonomyPanelChrome
      title="Autonomy Command Center"
      eyebrow="Self-Evolving Intelligence Core"
      action={
        <div className="flex flex-wrap gap-2">
          <AutonomyPill tone="gold">{autoString(metrics?.autonomy_mode, "approval_required").replace("_", " ")}</AutonomyPill>
          <AutonomyActionButton onClick={runLearningCycle} disabled={busyAction === "learning"}>
            Run Learning Cycle
          </AutonomyActionButton>
          <AutonomyActionButton onClick={() => void refresh()} disabled={loading}>
            Refresh
          </AutonomyActionButton>
        </div>
      }
    >
      <div className="grid gap-3 md:grid-cols-4">
        <AutonomyMetricTile label="Decision Supremacy" value={autoNumber(metrics?.decision_supremacy)} suffix="%" tone="gold" />
        <AutonomyMetricTile label="Trust Score" value={autoNumber(metrics?.trust_score)} suffix="%" />
        <AutonomyMetricTile label="Prediction Accuracy" value={autoNumber(metrics?.prediction_accuracy_percent)} suffix="%" />
        <AutonomyMetricTile label="Self-Heal Success" value={autoNumber(metrics?.self_heal_success_percent)} suffix="%" />
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/60">Top Decision</p>
            <h4 className="mt-1 text-xl font-semibold text-white">{autoString(topDecision.title, "Execute corridor-first containment")}</h4>
          </div>
          <AutonomyPill tone="orange">Urgency {autoNumber(topDecision.urgency, 84)}%</AutonomyPill>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-200/80">
          {live?.reasoning_summary ??
            "Autonomy OS is syncing live memory, prediction, trust, and governance signals into a human-governed command recommendation."}
        </p>
        {error ? <p className="mt-3 text-xs text-amber-200">Live feed delayed. Showing last verified autonomy state.</p> : null}
      </div>
    </AutonomyPanelChrome>
  );
}

