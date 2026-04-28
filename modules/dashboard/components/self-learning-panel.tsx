"use client";

import { useAutonomy } from "@/lib/autonomy/use-autonomy";
import {
  AutonomyActionButton,
  AutonomyMetricTile,
  AutonomyPanelChrome,
  autoBar,
  autoList,
  autoNumber,
  autoString,
} from "@/modules/dashboard/components/autonomy-panel-primitives";

export function SelfLearningPanel() {
  const { learning, live, runLearningCycle, busyAction } = useAutonomy();
  const strategies = autoList<Record<string, unknown>>(learning?.strategy_scores);
  const drift = autoList<Record<string, unknown>>(learning?.confidence_drift);

  return (
    <AutonomyPanelChrome
      title="Self-Learning Engine"
      eyebrow="Strategy Weights Improving"
      action={
        <AutonomyActionButton onClick={runLearningCycle} disabled={busyAction === "learning"}>
          Improve Weights
        </AutonomyActionButton>
      }
    >
      <div className="grid gap-3 md:grid-cols-3">
        <AutonomyMetricTile label="Improvement" value={`+${autoNumber(live?.metrics?.learning_improvement_percent, 14)}`} suffix="%" tone="gold" />
        <AutonomyMetricTile label="False Positives" value={autoNumber(learning?.false_positive_rate, 4)} suffix="%" />
        <AutonomyMetricTile label="Rejected" value={autoNumber(learning?.rejected_recommendations, 12)} suffix="%" tone="orange" />
      </div>
      <div className="space-y-3">
        {strategies.slice(0, 4).map((strategy, index) => {
          const score = autoNumber(strategy.score, 80);
          return (
            <div key={`${autoString(strategy.strategy, "strategy")}-${index}`} className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold text-white">{autoString(strategy.strategy, "Strategy")}</span>
                <span className="text-cyan-100">{score}% {autoString(strategy.trend, "+0")}</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-white/10">
                <div className="h-full rounded-full bg-cyan-200" style={{ width: autoBar(score) }} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {drift.slice(0, 3).map((item, index) => (
          <div key={`${autoString(item.label, "drift")}-${index}`} className="rounded-2xl border border-white/10 bg-white/[0.045] p-3">
            <p className="text-sm font-semibold text-white">{autoString(item.label, "Confidence drift")}</p>
            <p className="mt-2 text-xs text-slate-300">
              {autoNumber(item.before, 60)}% to {autoNumber(item.after, 82)}% because {autoString(item.reason, "new evidence")}
            </p>
          </div>
        ))}
      </div>
    </AutonomyPanelChrome>
  );
}

