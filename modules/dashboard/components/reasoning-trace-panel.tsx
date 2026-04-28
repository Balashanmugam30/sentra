"use client";

import { useAutonomy } from "@/lib/autonomy/use-autonomy";
import {
  AutonomyMetricTile,
  AutonomyPanelChrome,
  AutonomyPill,
  autoList,
  autoNumber,
  autoString,
} from "@/modules/dashboard/components/autonomy-panel-primitives";

export function ReasoningTracePanel() {
  const { explain } = useAutonomy();
  const signals = autoList<string>(explain?.signals_used);
  const weights = autoList<Record<string, unknown>>(explain?.weights_used);
  const alternatives = autoList<Record<string, unknown>>(explain?.rejected_alternatives);

  return (
    <AutonomyPanelChrome title="Reasoning Trace Panel" eyebrow="Explainable Autonomy">
      <div className="grid gap-3 md:grid-cols-3">
        <AutonomyMetricTile label="Confidence" value={autoNumber(explain?.confidence, 90)} suffix="%" tone="gold" />
        <AutonomyMetricTile label="Signals Used" value={signals.length || 5} />
        <AutonomyMetricTile label="Alternatives Rejected" value={alternatives.length || 2} tone="orange" />
      </div>
      <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
        <h4 className="font-semibold text-white">{autoString(explain?.decision, "Autonomous decision")}</h4>
        <p className="mt-2 text-sm leading-6 text-slate-300">{autoString(explain?.expected_gain, "Expected gain is being computed from live signals.")}</p>
      </div>
      <div className="grid gap-3 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
          <h4 className="font-semibold text-white">Signals</h4>
          <div className="mt-3 space-y-2">
            {signals.slice(0, 5).map((signal, index) => (
              <p key={`${signal}-${index}`} className="text-sm text-slate-300">{signal}</p>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
          <h4 className="font-semibold text-white">Weights</h4>
          <div className="mt-3 flex flex-wrap gap-2">
            {weights.slice(0, 5).map((weight, index) => (
              <AutonomyPill key={`${autoString(weight.signal, "weight")}-${index}`}>
                {autoString(weight.signal, "Signal")} {autoNumber(weight.weight, 10)}
              </AutonomyPill>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
          <h4 className="font-semibold text-white">Rejected Alternatives</h4>
          <div className="mt-3 space-y-2">
            {alternatives.slice(0, 2).map((alternative, index) => (
              <p key={`${autoString(alternative.strategy, "alt")}-${index}`} className="text-sm text-orange-100/85">
                {autoString(alternative.strategy, "Alternative")} rejected: {autoString(alternative.reason, "risk tradeoff")}
              </p>
            ))}
          </div>
        </div>
      </div>
    </AutonomyPanelChrome>
  );
}

