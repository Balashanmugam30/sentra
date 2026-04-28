"use client";

import { useOmega } from "@/lib/omega/use-omega";
import { OmegaBar, OmegaPanelShell, omegaList, omegaNumber, omegaRecord, omegaString } from "@/modules/dashboard/components/omega-panel-primitives";

export function AutonomousOptimizationPanel() {
  const { aiLive } = useOmega();
  const optimizer = omegaRecord(aiLive?.optimizer);
  const targets = omegaList<Record<string, unknown>>(optimizer.optimization_targets);

  return (
    <OmegaPanelShell
      description="Recursively optimizes speed, cost, accuracy, trust, and recovery ETA every cycle."
      eyebrow="Recursive Optimizer"
      title={`${omegaNumber(optimizer.compound_intelligence_score, 99)}/100 optimization intelligence`}
    >
      <div className="grid gap-3 md:grid-cols-2">
        {targets.map((target, index) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4" key={`${omegaString(target.target, "target")}-${index}`}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold capitalize text-white">{omegaString(target.target, "Target")}</p>
              <span className="text-xs text-cyan-100">{omegaString(target.status, "stable")}</span>
            </div>
            <div className="mt-4">
              <OmegaBar label="Improvement" value={omegaNumber(target.improvement, 20)} max={40} />
            </div>
          </div>
        ))}
      </div>
    </OmegaPanelShell>
  );
}

