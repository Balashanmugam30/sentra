"use client";

import { useAutonomy } from "@/lib/autonomy/use-autonomy";
import {
  AutonomyActionButton,
  AutonomyMetricTile,
  AutonomyPanelChrome,
  AutonomyPill,
  autoList,
  autoNumber,
  autoString,
} from "@/modules/dashboard/components/autonomy-panel-primitives";

export function SelfHealingCore() {
  const { health, runHeal, busyAction } = useAutonomy();
  const actions = autoList<Record<string, unknown>>(health?.actions);
  const lastHeal = health?.last_heal && typeof health.last_heal === "object" ? (health.last_heal as Record<string, unknown>) : {};

  return (
    <AutonomyPanelChrome
      title="Self-Healing Core"
      eyebrow="Operational Auto-Recovery"
      action={
        <AutonomyActionButton onClick={runHeal} disabled={busyAction === "heal"}>
          Run Heal
        </AutonomyActionButton>
      }
    >
      <div className="grid gap-3 md:grid-cols-3">
        <AutonomyMetricTile label="Heal Success" value={autoNumber(health?.self_heal_success_percent, 96)} suffix="%" tone="gold" />
        <AutonomyMetricTile label="Posture" value={autoString(health?.system_posture, "healthy-watch")} />
        <AutonomyMetricTile label="Latency Saved" value={autoNumber(lastHeal.latency_saved_ms, 840)} suffix="ms" />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {actions.slice(0, 6).map((action, index) => (
          <div key={`${autoString(action.action, "heal")}-${index}`} className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
            <div className="flex items-center justify-between gap-3">
              <h4 className="font-semibold text-white">{autoString(action.action, "Self-heal action")}</h4>
              <AutonomyPill>{autoString(action.status, "ready")}</AutonomyPill>
            </div>
            <p className="mt-2 text-sm text-slate-300">{autoString(action.impact, "Protects command continuity.")}</p>
          </div>
        ))}
      </div>
    </AutonomyPanelChrome>
  );
}

