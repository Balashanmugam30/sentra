"use client";

import { useDataEmpire } from "@/lib/data-empire/use-data-empire";
import {
  DataEmpireActionButton,
  DataEmpireBar,
  DataEmpirePanelShell,
  dataEmpireMoney,
} from "@/modules/dashboard/components/data-empire-primitives";

export function AnomalyRadar() {
  const { anomalies, busyAction, live, runAnomalyScan } = useDataEmpire();

  return (
    <DataEmpirePanelShell
      action={
        <DataEmpireActionButton busy={busyAction === "anomaly-scan"} onClick={() => void runAnomalyScan()}>
          {busyAction === "anomaly-scan" ? "Scanning..." : "Run Anomaly Scan"}
        </DataEmpireActionButton>
      }
      description="Privacy-safe anomaly detection across operational, revenue, infrastructure, social, and AI decision streams."
      eyebrow="Anomaly Radar"
      title={`${(live?.anomalies_found_week ?? 1_240).toLocaleString()} anomalies found this week`}
      tone="danger"
    >
      <div className="grid gap-3 lg:grid-cols-3">
        {anomalies.slice(0, 6).map((anomaly) => (
          <article className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4" key={anomaly.anomaly_id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">{anomaly.title}</p>
                <p className="mt-1 text-xs text-white/42">{anomaly.source}</p>
              </div>
              <span className="rounded-full border border-red-200/18 bg-red-200/10 px-3 py-1 text-xs font-semibold text-red-50">
                {anomaly.severity}
              </span>
            </div>
            <div className="mt-4 space-y-3">
              <DataEmpireBar label="Probability" value={anomaly.probability} />
              <DataEmpireBar label="Economic impact" max={1_000_000} value={anomaly.economic_impact} />
            </div>
            <p className="mt-4 text-sm text-cyan-50/65">{anomaly.recommended_action}</p>
            <p className="mt-2 text-xs text-white/40">Impact: {dataEmpireMoney.format(anomaly.economic_impact)}</p>
          </article>
        ))}
      </div>
    </DataEmpirePanelShell>
  );
}
