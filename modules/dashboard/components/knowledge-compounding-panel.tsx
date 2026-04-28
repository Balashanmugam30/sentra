"use client";

import { useDataEmpire } from "@/lib/data-empire/use-data-empire";
import {
  DataEmpireActionButton,
  DataEmpireMetricCard,
  DataEmpirePanelShell,
} from "@/modules/dashboard/components/data-empire-primitives";

export function KnowledgeCompoundingPanel() {
  const { busyAction, knowledge, runLearning } = useDataEmpire();

  return (
    <DataEmpirePanelShell
      action={
        <DataEmpireActionButton busy={busyAction === "learning"} onClick={() => void runLearning()}>
          {busyAction === "learning" ? "Learning..." : "Run Learning Cycle"}
        </DataEmpireActionButton>
      }
      description="Each accepted decision, resolved incident, customer motion, ecosystem install, and forecast outcome increases future prediction quality."
      eyebrow="Knowledge Compounding Engine"
      title={`Knowledge assets growing +${knowledge?.knowledge_asset_growth ?? 18}% with +${knowledge?.prediction_accuracy_gain ?? 4.2}% forecast gain`}
      tone="gold"
    >
      <div className="grid gap-3 md:grid-cols-4">
        <DataEmpireMetricCard label="Patterns found" value={(knowledge?.new_patterns_found ?? 8_740).toLocaleString()} />
        <DataEmpireMetricCard label="Models improved" value={(knowledge?.models_improved ?? 42).toLocaleString()} />
        <DataEmpireMetricCard label="Learning pool" value={knowledge?.cross_tenant_anonymized_learning ? "Anonymized" : "Tenant only"} />
        <DataEmpireMetricCard label="Daily growth" value={`+${knowledge?.knowledge_asset_growth ?? 18}%`} />
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        {(knowledge?.daily_learning_summary ?? [
          "Responder routing success lifted evacuation forecast precision.",
          "Billing recovery signals improved churn-risk lead time.",
          "Ecosystem install graph improved retention prediction.",
        ]).map((learning) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-white/65" key={learning}>
            {learning}
          </div>
        ))}
      </div>
    </DataEmpirePanelShell>
  );
}
