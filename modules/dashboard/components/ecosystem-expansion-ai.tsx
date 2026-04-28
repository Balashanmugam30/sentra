"use client";

import { useEcosystem } from "@/lib/ecosystem/use-ecosystem";
import { EcosystemMetricCard, EcosystemPanelShell } from "@/modules/dashboard/components/ecosystem-panel-primitives";

export function EcosystemExpansionAi() {
  const { recommendations } = useEcosystem();

  return (
    <EcosystemPanelShell description="AI recommendations for integrations, partner regions, API tiers, churn-prevention apps, and OEM expansion loops." eyebrow="Ecosystem Expansion AI" title="The platform knows which ecosystem move compounds next">
      <div className="grid gap-3 lg:grid-cols-2">
        {recommendations.map((recommendation) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4" key={recommendation.recommendation_id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">{recommendation.title}</p>
                <p className="mt-2 text-sm leading-6 text-white/55">{recommendation.reason}</p>
              </div>
              <span className="rounded-full border border-amber-200/22 bg-amber-200/10 px-3 py-1 text-xs font-semibold text-amber-50">
                {recommendation.priority}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <EcosystemMetricCard label="Impact" value={recommendation.estimated_impact} />
              <EcosystemMetricCard label="Confidence" value={`${recommendation.confidence}%`} />
            </div>
            <p className="mt-3 text-xs uppercase tracking-[0.18em] text-cyan-50/50">{recommendation.cta}</p>
          </div>
        ))}
      </div>
    </EcosystemPanelShell>
  );
}
