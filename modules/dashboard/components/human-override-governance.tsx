"use client";

import type { AutonomyMode } from "@/lib/autonomy/types";
import { useAutonomy } from "@/lib/autonomy/use-autonomy";
import {
  AutonomyActionButton,
  AutonomyPanelChrome,
  AutonomyPill,
  autoList,
  autoNumber,
  autoString,
} from "@/modules/dashboard/components/autonomy-panel-primitives";

const MODES: AutonomyMode[] = ["advisory", "approval_required", "semi_auto", "full_auto", "lockdown_mode"];

export function HumanOverrideGovernance() {
  const { governance, live, setMode, busyAction } = useAutonomy();
  const overrides = autoList<Record<string, unknown>>(governance?.override_ledger);
  const currentMode = autoString(governance?.current_mode, live?.metrics?.autonomy_mode ?? "approval_required");

  return (
    <AutonomyPanelChrome title="Human Override Governance" eyebrow="Control, Audit, and Autonomy Modes" accent="orange">
      <div className="flex flex-wrap gap-2">
        {MODES.map((mode) => (
          <AutonomyActionButton key={mode} onClick={() => setMode(mode)} disabled={busyAction === `mode-${mode}`}>
            {mode === currentMode ? "Active: " : ""}
            {mode.replace("_", " ")}
          </AutonomyActionButton>
        ))}
      </div>
      <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h4 className="font-semibold text-white">Current Governance</h4>
          <AutonomyPill tone="gold">{currentMode.replace("_", " ")}</AutonomyPill>
        </div>
        <p className="mt-2 text-sm text-slate-300">
          Override required above risk {autoNumber(governance?.override_required_above_risk, 70)}. Critical action chain stays human-governed.
        </p>
      </div>
      <div className="space-y-3">
        {overrides.slice(0, 4).map((override, index) => (
          <article key={`${autoString(override.override_id, "override")}-${index}`} className="rounded-2xl border border-white/10 bg-white/[0.05] p-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="font-semibold text-white">{autoString(override.actor, "operator")}</span>
              <AutonomyPill tone="orange">Risk {autoNumber(override.risk_score, 40)}</AutonomyPill>
            </div>
            <p className="mt-2 text-sm text-slate-300">{autoString(override.reason, "Human governance event stored.")}</p>
          </article>
        ))}
      </div>
    </AutonomyPanelChrome>
  );
}

