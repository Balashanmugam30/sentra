"use client";

import { useAutonomy } from "@/lib/autonomy/use-autonomy";
import {
  AutonomyMetricTile,
  AutonomyPanelChrome,
  AutonomyPill,
  autoCurrency,
  autoList,
  autoNumber,
  autoString,
} from "@/modules/dashboard/components/autonomy-panel-primitives";

export function FuturePredictionPanel() {
  const { predict } = useAutonomy();
  const horizons = autoList<Record<string, unknown>>(predict?.horizons);

  return (
    <AutonomyPanelChrome title="Future Prediction Panel" eyebrow="15m / 60m / 24h Foresight">
      <div className="grid gap-3 md:grid-cols-4">
        <AutonomyMetricTile label="Escalation" value={autoNumber(predict?.escalation_probability, 18)} suffix="%" tone="orange" />
        <AutonomyMetricTile label="Recovery ETA" value={autoNumber(predict?.recovery_eta_minutes, 11)} suffix="m" tone="gold" />
        <AutonomyMetricTile label="Financial Loss" value={autoCurrency(predict?.financial_loss_projection)} />
        <AutonomyMetricTile label="Reputation Risk" value={autoNumber(predict?.reputation_risk, 21)} suffix="%" />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {horizons.slice(0, 3).map((horizon, index) => (
          <article key={`${autoString(horizon.horizon, "horizon")}-${index}`} className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
            <div className="flex items-center justify-between gap-3">
              <AutonomyPill tone={index === 0 ? "orange" : "cyan"}>{autoString(horizon.horizon, "15m")}</AutonomyPill>
              <span className="text-xs text-cyan-100">{autoNumber(horizon.containment_probability, 88)}% containment</span>
            </div>
            <h4 className="mt-3 font-semibold text-white">{autoString(horizon.top_risk, "Autonomy forecast")}</h4>
            <p className="mt-2 text-sm text-slate-300">{autoString(horizon.expected_state, "stable with managed response")}</p>
          </article>
        ))}
      </div>
    </AutonomyPanelChrome>
  );
}

