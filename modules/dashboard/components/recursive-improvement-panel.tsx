"use client";

import { useOmega } from "@/lib/omega/use-omega";
import { OmegaBar, OmegaMetricCard, OmegaPanelShell, omegaList, omegaNumber, omegaRecord, omegaString } from "@/modules/dashboard/components/omega-panel-primitives";

export function RecursiveImprovementPanel() {
  const { aiLive, live } = useOmega();
  const improvement = omegaRecord(aiLive?.self_improvement);
  const domains = omegaList<Record<string, unknown>>(improvement.improved_domains);

  return (
    <OmegaPanelShell
      description="Self-improves routing logic, forecasting weights, UI prioritization, resource allocation, and anomaly thresholds."
      eyebrow="Self Improvement Engine"
      title={`Cycle ${omegaNumber(improvement.improvement_cycles, 42)} with ${live?.metrics?.decision_accuracy ?? 96}% accuracy`}
    >
      <div className="grid gap-3 md:grid-cols-3">
        <OmegaMetricCard label="Decision accuracy" value={`${omegaNumber(improvement.decision_accuracy, 96)}%`} />
        <OmegaMetricCard label="Learning gain" value={`+${omegaNumber(improvement.learning_gain_percent, 22)}%`} />
        <OmegaMetricCard label="Cycles" value={omegaNumber(improvement.improvement_cycles, 42)} />
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {domains.map((domain, index) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4" key={`${omegaString(domain.domain, "domain")}-${index}`}>
            <OmegaBar label={omegaString(domain.domain, "Domain")} value={omegaNumber(domain.gain, 20)} max={40} />
          </div>
        ))}
      </div>
    </OmegaPanelShell>
  );
}

