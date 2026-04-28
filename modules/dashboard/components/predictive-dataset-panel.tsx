"use client";

import { useDataEmpire } from "@/lib/data-empire/use-data-empire";
import {
  DataEmpireBar,
  DataEmpirePanelShell,
  dataEmpireMoney,
} from "@/modules/dashboard/components/data-empire-primitives";

export function PredictiveDatasetPanel() {
  const { datasets, live } = useDataEmpire();

  return (
    <DataEmpirePanelShell
      description="Predictive datasets that improve AI outcomes, unlock data products, increase switching costs, and make Sentra more accurate over time."
      eyebrow="Predictive Dataset Portfolio"
      title={`${(live?.unique_datasets ?? 418).toLocaleString()} unique datasets are compounding model advantage`}
    >
      <div className="grid gap-3 lg:grid-cols-3">
        {datasets.map((dataset) => (
          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4" key={dataset.dataset_id}>
            <p className="text-sm font-semibold text-white">{dataset.name}</p>
            <div className="mt-4 space-y-3">
              <DataEmpireBar label="Uniqueness" value={dataset.uniqueness_score} />
              <DataEmpireBar label="Training value" value={dataset.training_value} />
              <DataEmpireBar label="Revenue value" max={700_000} value={dataset.revenue_value} />
            </div>
            <p className="mt-3 text-xs text-cyan-50/55">Annual value: {dataEmpireMoney.format(dataset.revenue_value)}</p>
          </div>
        ))}
      </div>
    </DataEmpirePanelShell>
  );
}
