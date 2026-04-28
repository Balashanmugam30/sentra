"use client";

import { ChannelAlerts } from "@/components/platform/channel-alerts";
import { ChannelMap } from "@/components/platform/channel-map";
import { CountryLaunchBoard } from "@/components/platform/country-launch-board";
import { ExpansionScore } from "@/components/platform/expansion-score";
import { LegalReadiness } from "@/components/platform/legal-readiness";
import { PlatformKpi, PlatformShell } from "@/components/platform/platform-shell";
import { PricingEngine } from "@/components/platform/pricing-engine";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { formatMoney } from "@/lib/channel/runtime";
import { useChannel } from "@/lib/channel/use-channel";

export default function PlatformExpansionPage() {
  const { summary, countries, pricing, pipeline, loading, error, busyAction, lastAction, refresh, launchCountry } = useChannel();

  return (
    <ProtectedWorkspaceShell>
      <PlatformShell
        eyebrow="Global Expansion OS"
        title="Country launch and regional readiness control"
        subtitle="Choose launch countries, inspect legal readiness, tune regional pricing, and forecast channel ARR before committing global expansion capital."
        loading={loading}
        error={error}
        lastAction={lastAction}
        onRefresh={refresh}
      >
        <div className="grid gap-4 md:grid-cols-4">
          <PlatformKpi label="Launch Readiness" value={`${summary.launch_readiness_average}%`} />
          <PlatformKpi label="Countries Ready" value={summary.countries_ready} />
          <PlatformKpi label="Weighted ARR" value={formatMoney(pipeline.weighted_forecast)} />
          <PlatformKpi label="Pricing Fit" value={`${pricing.average_pricing_fit}%`} />
        </div>
        <ExpansionScore summary={summary} />
        <ChannelMap countries={countries} summary={summary} busyAction={busyAction} onLaunch={launchCountry} />
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <CountryLaunchBoard countries={countries} />
          <ChannelAlerts summary={summary} />
        </div>
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <PricingEngine pricing={pricing} />
          <LegalReadiness countries={countries} pricing={pricing} />
        </div>
      </PlatformShell>
    </ProtectedWorkspaceShell>
  );
}

