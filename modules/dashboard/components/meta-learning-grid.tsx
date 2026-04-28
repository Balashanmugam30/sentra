"use client";

import { useOmega } from "@/lib/omega/use-omega";
import { OmegaBar, OmegaMetricCard, OmegaPanelShell, omegaList, omegaNumber, omegaRecord, omegaString } from "@/modules/dashboard/components/omega-panel-primitives";

export function MetaLearningGrid() {
  const { aiLive } = useOmega();
  const meta = omegaRecord(aiLive?.meta_learning);
  const sources = omegaList<Record<string, unknown>>(meta.learning_sources);

  return (
    <OmegaPanelShell
      description="Learns from accepted decisions, rejected decisions, human overrides, outcomes, and failure patterns."
      eyebrow="Meta Learning Engine"
      title={omegaString(meta.confidence_change_reason, "Confidence rose from converged memory, trust, and forecast signals.")}
    >
      <div className="grid gap-3 md:grid-cols-3">
        <OmegaMetricCard label="Accepted" value={`${omegaNumber(meta.accepted_decisions_percent, 76)}%`} />
        <OmegaMetricCard label="Rejected" value={`${omegaNumber(meta.rejected_decisions_percent, 9)}%`} />
        <OmegaMetricCard label="Overrides" value={`${omegaNumber(meta.override_rate_percent, 15)}%`} />
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {sources.map((source, index) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4" key={`${omegaString(source.source, "source")}-${index}`}>
            <OmegaBar label={omegaString(source.source, "Learning source")} value={omegaNumber(source.weight, 20)} max={40} />
          </div>
        ))}
      </div>
    </OmegaPanelShell>
  );
}

