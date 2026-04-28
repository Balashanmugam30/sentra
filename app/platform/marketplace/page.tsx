"use client";

import { AppMarketGrid } from "@/components/platform/app-market-grid";
import { AutomationGallery } from "@/components/platform/automation-gallery";
import { InstallCenter } from "@/components/platform/install-center";
import { NetworkScore } from "@/components/platform/network-score";
import { PlatformKpi, PlatformShell } from "@/components/platform/platform-shell";
import { SecurityBadges } from "@/components/platform/security-badges";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useMarketplace } from "@/lib/marketplace/use-marketplace";

export default function PlatformMarketplacePage() {
  const {
    featured,
    categories,
    summary,
    security,
    automations,
    loading,
    error,
    busyAction,
    lastAction,
    refresh,
    install,
    startTrial,
    approveSecurity,
  } = useMarketplace();

  return (
    <ProtectedWorkspaceShell>
      <PlatformShell
        eyebrow="Marketplace Ecosystem"
        title="Installable crisis intelligence apps"
        subtitle="Discover certified integrations, automation templates, verified vendors, and add-on revenue opportunities across the Sentra platform network."
        loading={loading}
        error={error}
        lastAction={lastAction}
        onRefresh={refresh}
      >
        <div className="grid gap-4 md:grid-cols-4">
          <PlatformKpi label="Marketplace ARR" value={`$${summary.marketplace_arr.toLocaleString()}`} />
          <PlatformKpi label="Network Score" value={summary.network_effect_score} />
          <PlatformKpi label="Featured Apps" value={summary.featured_count} />
          <PlatformKpi label="Certified Apps" value={summary.certified_count} />
        </div>
        <NetworkScore summary={summary} />
        <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <InstallCenter categories={categories} summary={summary} />
          <SecurityBadges security={security} busyAction={busyAction} onApprove={approveSecurity} />
        </div>
        <AppMarketGrid title="Featured and trending apps" apps={featured.apps.slice(0, 9)} busyAction={busyAction} onInstall={install} onTrial={startTrial} />
        <AutomationGallery automations={automations} />
      </PlatformShell>
    </ProtectedWorkspaceShell>
  );
}

