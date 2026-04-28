"use client";

import { useEcosystem } from "@/lib/ecosystem/use-ecosystem";
import { EcosystemBar, EcosystemMetricCard, EcosystemPanelShell } from "@/modules/dashboard/components/ecosystem-panel-primitives";

export function WebhookCommandPanel() {
  const { webhooks } = useEcosystem();

  return (
    <EcosystemPanelShell description="Webhook delivery command center for event volume, retries, failures, dead letters, and delivery health." eyebrow="Webhook Command" title={`${webhooks?.success_rate ?? 99.42}% webhook success`}>
      <div className="grid gap-3 md:grid-cols-5">
        <EcosystemMetricCard label="Deliveries" value={((webhooks?.deliveries ?? 860_000) / 1_000).toFixed(0) + "K"} />
        <EcosystemMetricCard label="Retries" value={(webhooks?.retries ?? 12_600).toLocaleString()} />
        <EcosystemMetricCard label="Failures" value={(webhooks?.failures ?? 4_980).toLocaleString()} />
        <EcosystemMetricCard label="Dead letters" value={webhooks?.dead_letters ?? 42} />
        <EcosystemMetricCard label="Events" value={webhooks?.top_event_types?.length ?? 5} />
      </div>
      <div className="mt-5">
        <EcosystemBar label="Delivery success" value={webhooks?.success_rate ?? 99.42} />
      </div>
    </EcosystemPanelShell>
  );
}
