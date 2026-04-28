"use client";

import { useOmega } from "@/lib/omega/use-omega";
import { OmegaActionButton, OmegaMetricCard, OmegaPanelShell, OmegaPill, omegaList, omegaString } from "@/modules/dashboard/components/omega-panel-primitives";

const MODES = ["advisory", "approval_required", "semi_autonomous", "full_autonomous", "emergency_manual_override"];

export function AiGovernanceCenter() {
  const { busyAction, changeMode, governance } = useOmega();
  const activeMode = omegaString(governance?.mode, "approval_required");
  const guardrails = omegaList<string>(governance?.guardrails);

  return (
    <OmegaPanelShell
      description="Human-governed superintelligence control layer with audit-signed mode changes and emergency manual override."
      eyebrow="AI Governance Center"
      title={`Mode: ${activeMode}`}
      tone="gold"
    >
      <div className="grid gap-3 md:grid-cols-3">
        <OmegaMetricCard label="High-risk approval" value={governance?.high_risk_requires_approval ? "Required" : "Optional"} />
        <OmegaMetricCard label="Override events" value={omegaList(governance?.override_events).length} />
        <OmegaMetricCard label="Guardrails" value={guardrails.length || 4} />
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {MODES.map((mode) => (
          <OmegaActionButton busy={busyAction === `mode-${mode}`} key={mode} onClick={() => void changeMode(mode)}>
            {mode === activeMode ? <OmegaPill tone="gold">{mode}</OmegaPill> : mode.replaceAll("_", " ")}
          </OmegaActionButton>
        ))}
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {guardrails.map((guardrail) => (
          <div className="rounded-[20px] border border-white/10 bg-white/[0.04] p-4 text-sm text-white/60" key={guardrail}>
            {guardrail}
          </div>
        ))}
      </div>
    </OmegaPanelShell>
  );
}

