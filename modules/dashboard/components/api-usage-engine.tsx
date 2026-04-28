"use client";

import { useEcosystem } from "@/lib/ecosystem/use-ecosystem";
import { EcosystemBar, EcosystemMetricCard, EcosystemPanelShell, ecosystemMoney } from "@/modules/dashboard/components/ecosystem-panel-primitives";

export function ApiUsageEngine() {
  const { apiUsage } = useEcosystem();

  return (
    <EcosystemPanelShell description="Usage-based platform expansion engine for API volume, latency, rate limits, top customers, and API revenue." eyebrow="API Usage Engine" title={`${((apiUsage?.requests_day ?? 2_400_000) / 1_000_000).toFixed(1)}M API requests/day`}>
      <div className="grid gap-3 md:grid-cols-5">
        <EcosystemMetricCard label="Requests/day" value={`${((apiUsage?.requests_day ?? 2_400_000) / 1_000_000).toFixed(1)}M`} />
        <EcosystemMetricCard label="Webhook/day" value={`${((apiUsage?.webhook_events_day ?? 860_000) / 1_000).toFixed(0)}K`} />
        <EcosystemMetricCard label="Avg latency" value={`${apiUsage?.avg_latency_ms ?? 118}ms`} />
        <EcosystemMetricCard label="P95" value={`${apiUsage?.p95_latency_ms ?? 242}ms`} />
        <EcosystemMetricCard label="Usage MRR" value={ecosystemMoney.format(apiUsage?.usage_revenue_mrr ?? 72_000)} />
      </div>
      <div className="mt-5 rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
        <EcosystemBar label="Rate-limit pressure" max={500} value={apiUsage?.rate_limit_blocks ?? 128} />
        <p className="mt-3 text-sm text-white/55">Top API customers: {(apiUsage?.top_api_customers ?? ["Bala University", "GovSecure South"]).join(", ")}.</p>
      </div>
    </EcosystemPanelShell>
  );
}
