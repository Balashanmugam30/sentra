"use client";

import { useEcosystem } from "@/lib/ecosystem/use-ecosystem";
import { EcosystemBar, EcosystemMetricCard, EcosystemPanelShell } from "@/modules/dashboard/components/ecosystem-panel-primitives";

export function IntegrationCommandPanel() {
  const { integrations, live } = useEcosystem();

  return (
    <EcosystemPanelShell description="Operational health for connected systems, token expiry, sync failures, latency, and critical integration risk." eyebrow="Integration Command Center" title={`${live?.active_integrations ?? 91} active integrations under command`}>
      <div className="grid gap-3 lg:grid-cols-2">
        {integrations.slice(0, 8).map((integration) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4" key={integration.integration_id}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">{integration.name}</p>
                <p className="mt-1 text-xs text-white/42">{integration.category}</p>
              </div>
              {integration.critical ? <span className="rounded-full border border-amber-200/20 bg-amber-200/10 px-3 py-1 text-xs text-amber-50">critical</span> : null}
            </div>
            <div className="mt-4">
              <EcosystemBar label="Sync health" value={integration.sync_health} />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <EcosystemMetricCard label="Failures" value={integration.failed_syncs} />
              <EcosystemMetricCard label="Latency" value={`${integration.latency_ms}ms`} />
              <EcosystemMetricCard label="Token" value={`${integration.token_expires_in_days}d`} />
            </div>
          </div>
        ))}
      </div>
    </EcosystemPanelShell>
  );
}
