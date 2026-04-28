"use client";

import { useDataEmpire } from "@/lib/data-empire/use-data-empire";
import {
  DataEmpireBar,
  DataEmpireMetricCard,
  DataEmpirePanelShell,
} from "@/modules/dashboard/components/data-empire-primitives";

export function CompetitiveMoatScore() {
  const { moat } = useDataEmpire();
  const score = moat?.competitive_moat_score ?? 97;

  return (
    <DataEmpirePanelShell
      description="Composite defensibility score from data volume, uniqueness, forecast accuracy, ecosystem depth, retention lift, switching cost, partner data advantage, and AI superiority."
      eyebrow="Competitive Moat Score"
      title={`${score}/100 - proprietary data advantage is compounding`}
      tone="gold"
    >
      <div className="grid gap-4 lg:grid-cols-[0.72fr_1.28fr]">
        <div className="rounded-[28px] border border-amber-200/16 bg-[radial-gradient(circle_at_50%_35%,rgba(245,158,11,0.23),rgba(2,6,23,0.62)_62%)] p-8 text-center">
          <p className="text-[4.5rem] font-semibold leading-none tracking-[-0.08em] text-white">{score}</p>
          <p className="mt-3 text-sm uppercase tracking-[0.24em] text-amber-50/58">Moat score</p>
          <p className="mt-4 text-sm leading-6 text-white/58">Switching cost index: {moat?.switching_cost_index ?? "Extreme"}</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <DataEmpireBar label="Data volume" value={moat?.data_volume_score ?? 98} />
          <DataEmpireBar label="Data uniqueness" value={moat?.data_uniqueness_score ?? 97} />
          <DataEmpireBar label="Prediction accuracy" value={moat?.prediction_accuracy_score ?? 94} />
          <DataEmpireBar label="Ecosystem depth" value={moat?.ecosystem_depth_score ?? 93} />
          <DataEmpireBar label="Retention lift" value={moat?.retention_lift_score ?? 91} />
          <DataEmpireBar label="AI superiority" value={moat?.ai_superiority_score ?? 96} />
          <DataEmpireMetricCard label="Partner data edge" value={`${moat?.partner_data_advantage ?? 92}%`} />
          <DataEmpireMetricCard label="Defensibility" value="Extreme" />
        </div>
      </div>
    </DataEmpirePanelShell>
  );
}
