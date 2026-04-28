"use client";

import { useEcosystem } from "@/lib/ecosystem/use-ecosystem";
import {
  EcosystemActionButton,
  EcosystemMetricCard,
  EcosystemPanelShell,
} from "@/modules/dashboard/components/ecosystem-panel-primitives";

export function DeveloperPlatformPanel() {
  const { busyAction, createApiKey, developers } = useEcosystem();

  return (
    <EcosystemPanelShell
      action={
        <EcosystemActionButton busy={busyAction === "api-key"} onClick={() => void createApiKey()}>
          {busyAction === "api-key" ? "Creating..." : "Create API Key"}
        </EcosystemActionButton>
      }
      description="API keys, OAuth apps, sandboxes, SDK downloads, and documentation quality for the developer economy."
      eyebrow="Developer Platform"
      title={`${(developers?.developers_active ?? 1_420).toLocaleString()} active developers building on Sentra`}
    >
      <div className="grid gap-3 md:grid-cols-6">
        <EcosystemMetricCard label="API keys" value={developers?.api_keys ?? 86} />
        <EcosystemMetricCard label="OAuth apps" value={developers?.oauth_apps ?? 34} />
        <EcosystemMetricCard label="Sandboxes" value={developers?.sandbox_tenants ?? 112} />
        <EcosystemMetricCard label="Developers" value={(developers?.developers_active ?? 1_420).toLocaleString()} />
        <EcosystemMetricCard label="SDK downloads" value={(developers?.sdk_downloads ?? 8_900).toLocaleString()} />
        <EcosystemMetricCard label="Docs score" value={`${developers?.docs_score ?? 94}`} />
      </div>
    </EcosystemPanelShell>
  );
}
