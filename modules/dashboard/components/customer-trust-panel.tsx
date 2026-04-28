"use client";

import { useCategoryDomination } from "@/lib/category-domination/use-category-domination";
import { CategoryBar, CategoryMetricCard, CategoryPanelShell } from "@/modules/dashboard/components/category-panel-primitives";

export function CustomerTrustPanel() {
  const { trust } = useCategoryDomination();
  const customer = trust?.customer;

  return (
    <CategoryPanelShell
      description="Enterprise trust proof from logos, testimonials, NPS, uptime confidence, renewals, and retention quality."
      eyebrow="Customer Trust Engine"
      title={`${customer?.logos_won ?? 42} enterprise logos with ${customer?.renewal_confidence ?? 91}% renewal confidence`}
    >
      <div className="grid gap-3 md:grid-cols-4">
        <CategoryMetricCard label="NPS" value={customer?.nps ?? 63} />
        <CategoryMetricCard label="Uptime trust" value={`${customer?.uptime_trust ?? 99.94}%`} />
        <CategoryMetricCard label="Renewal confidence" value={`${customer?.renewal_confidence ?? 91}%`} />
        <CategoryMetricCard label="Retention quality" value={customer?.retention_quality ?? "enterprise-grade"} />
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        {(customer?.testimonials ?? []).map((testimonial) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-white/66" key={testimonial}>
            <span className="text-cyan-50/45">Customer proof: </span>
            {testimonial}
          </div>
        ))}
      </div>
      <div className="mt-4">
        <CategoryBar label="Trust compounding" value={customer?.renewal_confidence ?? 91} />
      </div>
    </CategoryPanelShell>
  );
}
