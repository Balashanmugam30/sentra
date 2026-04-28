"use client";

import { PlatformKpi, PlatformShell } from "@/components/platform/platform-shell";
import { RevenueShare } from "@/components/platform/revenue-share";
import { ReviewFeed } from "@/components/platform/review-feed";
import { TopGrossing } from "@/components/platform/top-grossing";
import { TrialFunnel } from "@/components/platform/trial-funnel";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useMarketplace } from "@/lib/marketplace/use-marketplace";

export default function PlatformMarketplaceRevenuePage() {
  const { revenue, reviews, loading, error, busyAction, lastAction, refresh, simulateRevenue } = useMarketplace();
  return (
    <ProtectedWorkspaceShell>
      <PlatformShell
        eyebrow="Marketplace Revenue"
        title="Add-on monetization and partner payouts"
        subtitle="Measure addon MRR, marketplace ARR, take rate, top-grossing apps, partner payouts, trial conversions, and expansion prompts."
        loading={loading}
        error={error}
        lastAction={lastAction}
        onRefresh={refresh}
      >
        <div className="grid gap-4 md:grid-cols-4">
          <PlatformKpi label="Addon MRR" value={`$${revenue.addon_mrr.toLocaleString()}`} />
          <PlatformKpi label="Marketplace ARR" value={`$${revenue.marketplace_arr.toLocaleString()}`} />
          <PlatformKpi label="Take Rate" value={`${revenue.take_rate}%`} />
          <PlatformKpi label="Trial Conv." value={`${revenue.trial_conversion_rate}%`} />
        </div>
        <RevenueShare revenue={revenue} busyAction={busyAction} onSimulate={simulateRevenue} />
        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <TopGrossing revenue={revenue} />
          <TrialFunnel revenue={revenue} />
        </div>
        <ReviewFeed reviews={reviews} />
      </PlatformShell>
    </ProtectedWorkspaceShell>
  );
}

