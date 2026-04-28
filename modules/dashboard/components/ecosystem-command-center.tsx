"use client";

import { useEcosystem } from "@/lib/ecosystem/use-ecosystem";
import {
  EcosystemActionButton,
  EcosystemMetricCard,
  EcosystemPanelShell,
  ecosystemMoney,
} from "@/modules/dashboard/components/ecosystem-panel-primitives";

export function EcosystemCommandCenter() {
  const { busyAction, live, loading, refresh, runSimulation } = useEcosystem();

  return (
    <EcosystemPanelShell
      action={
        <div className="flex flex-wrap gap-2">
          <EcosystemActionButton onClick={() => void refresh()}>{loading ? "Syncing..." : "Refresh"}</EcosystemActionButton>
          <EcosystemActionButton busy={busyAction === "simulation"} onClick={() => void runSimulation()}>
            {busyAction === "simulation" ? "Simulating..." : "Run Flywheel Sim"}
          </EcosystemActionButton>
        </div>
      }
      description="Marketplace, APIs, partners, certifications, webhooks, embedded widgets, and network effects unified into a platform-expansion command layer."
      eyebrow="Ecosystem Domination OS"
      title={`${live?.moat_score ?? 95}/100 platform moat with ${ecosystemMoney.format(live?.marketplace_arr ?? 1_800_000)} marketplace ARR`}
      tone="gold"
    >
      <div className="grid gap-3 md:grid-cols-5">
        <EcosystemMetricCard label="Installed apps" note="marketplace density" value={(live?.installed_apps ?? 184).toLocaleString()} />
        <EcosystemMetricCard label="API/day" note="platform traffic" value={`${((live?.api_requests_day ?? 2_400_000) / 1_000_000).toFixed(1)}M`} />
        <EcosystemMetricCard label="Developers" note="active builders" value={(live?.active_developers ?? 1_420).toLocaleString()} />
        <EcosystemMetricCard label="Partners" note="active network" value={live?.partners_active ?? 63} />
        <EcosystemMetricCard label="Expansion" note="ecosystem AI" value={`${live?.expansion_score ?? 93}`} />
      </div>
    </EcosystemPanelShell>
  );
}
