"use client";

import { useDataEmpire } from "@/lib/data-empire/use-data-empire";
import {
  DataEmpireBar,
  DataEmpireMetricCard,
  DataEmpirePanelShell,
} from "@/modules/dashboard/components/data-empire-primitives";

export function TenantIntelligenceVault() {
  const { live, privacy, sources } = useDataEmpire();

  return (
    <DataEmpirePanelShell
      description="Tenant-scoped intelligence vault with RBAC, masking, anonymized learning pools, deletion workflows, export controls, and no cross-tenant leakage."
      eyebrow="Tenant Intelligence Vault"
      title={`${privacy?.privacy_score ?? 96}/100 trust posture protecting ${(live?.unique_datasets ?? 418).toLocaleString()} unique datasets`}
    >
      <div className="grid gap-3 md:grid-cols-4">
        <DataEmpireMetricCard label="Tenant isolation" value={privacy?.tenant_isolation ?? "strict"} />
        <DataEmpireMetricCard label="Encryption" value={privacy?.encryption ?? "AES-256 at rest"} />
        <DataEmpireMetricCard label="Audit logs" value={privacy?.audit_logs ?? "immutable"} />
        <DataEmpireMetricCard label="Learning pools" value={privacy?.anonymized_learning_pools ?? "enabled"} />
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm font-semibold text-white">Privacy controls</p>
          <div className="mt-4 space-y-3">
            {(privacy?.field_masking ?? ["pii", "payment", "health", "location"]).map((field) => (
              <DataEmpireBar key={field} label={`${field} masking`} value={96} />
            ))}
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {sources.slice(0, 4).map((source) => (
            <div className="rounded-[20px] border border-white/10 bg-white/[0.035] p-4" key={source.source_id}>
              <p className="text-sm font-semibold text-white">{source.name}</p>
              <p className="mt-1 text-xs text-white/42">{source.tenant_scope}</p>
              <p className="mt-3 text-xs text-cyan-50/58">{source.privacy_tier}</p>
            </div>
          ))}
        </div>
      </div>
    </DataEmpirePanelShell>
  );
}
