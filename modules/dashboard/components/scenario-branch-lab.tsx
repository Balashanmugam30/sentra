"use client";

import { useAutonomy } from "@/lib/autonomy/use-autonomy";
import {
  AutonomyMetricTile,
  AutonomyPanelChrome,
  AutonomyPill,
  autoCurrency,
  autoList,
  autoNumber,
  autoRecord,
  autoString,
} from "@/modules/dashboard/components/autonomy-panel-primitives";

export function ScenarioBranchLab() {
  const { branches } = useAutonomy();
  const options = autoList<Record<string, unknown>>(branches?.options);
  const winner = autoRecord(branches?.winner);

  return (
    <AutonomyPanelChrome title="Scenario Branch Lab" eyebrow="Option A / B / C / D Strategy Comparison" accent="gold">
      <div className="grid gap-3 md:grid-cols-4">
        <AutonomyMetricTile label="Winner" value={`Option ${autoString(winner.option, "A")}`} tone="gold" />
        <AutonomyMetricTile label="Risk" value={autoNumber(winner.risk, 18)} suffix="%" />
        <AutonomyMetricTile label="ETA" value={autoNumber(winner.eta_minutes, 9)} suffix="m" />
        <AutonomyMetricTile label="Confidence" value={autoNumber(winner.confidence, 91)} suffix="%" />
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {options.slice(0, 4).map((option, index) => (
          <article key={`${autoString(option.option, "option")}-${index}`} className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
            <div className="flex items-center justify-between gap-3">
              <AutonomyPill tone={autoString(option.option, "A") === autoString(winner.option, "A") ? "gold" : "cyan"}>
                Option {autoString(option.option, "A")}
              </AutonomyPill>
              <span className="text-xs text-cyan-100">{autoNumber(option.confidence, 80)}%</span>
            </div>
            <h4 className="mt-3 font-semibold text-white">{autoString(option.strategy, "Strategy")}</h4>
            <p className="mt-2 text-sm text-slate-300">{autoString(option.expected_gain, "Expected impact being modeled.")}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-400">
              Risk {autoNumber(option.risk, 20)}% - ETA {autoNumber(option.eta_minutes, 12)}m - {autoCurrency(option.cost)}
            </p>
          </article>
        ))}
      </div>
      <p className="text-sm text-slate-300">{autoString(branches?.decision_rule, "Decision rule is based on current objective and live operational risk.")}</p>
    </AutonomyPanelChrome>
  );
}
