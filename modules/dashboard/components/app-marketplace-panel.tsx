"use client";

import { useEcosystem } from "@/lib/ecosystem/use-ecosystem";
import {
  EcosystemActionButton,
  EcosystemBar,
  EcosystemMetricCard,
  EcosystemPanelShell,
  ecosystemMoney,
} from "@/modules/dashboard/components/ecosystem-panel-primitives";

export function AppMarketplacePanel() {
  const { apps, busyAction, installApp } = useEcosystem();
  const topArr = Math.max(...apps.map((app) => app.marketplace_arr), 1);

  return (
    <EcosystemPanelShell
      action={
        <EcosystemActionButton busy={busyAction === "install-servicenow"} onClick={() => void installApp("servicenow")}>
          {busyAction === "install-servicenow" ? "Installing..." : "Install ServiceNow"}
        </EcosystemActionButton>
      }
      description="App-store grade ecosystem catalog with verified crisis operations integrations and retention lift metrics."
      eyebrow="App Marketplace"
      title="Third-party apps increase retention and addon ARR"
    >
      <div className="grid gap-3 lg:grid-cols-3">
        {apps.slice(0, 9).map((app) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4" key={`${app.app_id}-${app.status}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">{app.name}</p>
                <p className="mt-1 text-xs text-white/42">{app.category}</p>
              </div>
              <span className="rounded-full border border-cyan-200/16 bg-cyan-200/8 px-3 py-1 text-xs font-semibold text-cyan-50">
                {app.status}
              </span>
            </div>
            <div className="mt-4">
              <EcosystemBar label="Marketplace ARR" max={topArr} value={app.marketplace_arr} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <EcosystemMetricCard label="ARR" value={ecosystemMoney.format(app.marketplace_arr)} />
              <EcosystemMetricCard label="Lift" value={`${app.retention_lift}%`} />
            </div>
          </div>
        ))}
      </div>
    </EcosystemPanelShell>
  );
}
