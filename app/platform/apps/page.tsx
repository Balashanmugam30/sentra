"use client";

import { InstalledApps } from "@/components/platform/installed-apps";
import { PlatformKpi, PlatformShell } from "@/components/platform/platform-shell";
import { ReviewFeed } from "@/components/platform/review-feed";
import { SecurityBadges } from "@/components/platform/security-badges";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useMarketplace } from "@/lib/marketplace/use-marketplace";

export default function PlatformAppsPage() {
  const {
    installed,
    reviews,
    security,
    loading,
    error,
    busyAction,
    lastAction,
    refresh,
    enable,
    disable,
    uninstall,
    testConnection,
    approveSecurity,
  } = useMarketplace();

  return (
    <ProtectedWorkspaceShell>
      <PlatformShell
        eyebrow="Tenant App Management"
        title="Installed integrations control center"
        subtitle="Enable, disable, test, uninstall, and monitor tenant-scoped integrations with version health, usage metrics, permissions, and security approvals."
        loading={loading}
        error={error}
        lastAction={lastAction}
        onRefresh={refresh}
      >
        <div className="grid gap-4 md:grid-cols-4">
          <PlatformKpi label="Active Apps" value={installed.active_integrations} />
          <PlatformKpi label="Installed" value={installed.installations.length} />
          <PlatformKpi label="Addon MRR" value={`$${installed.monthly_addon_value.toLocaleString()}`} />
          <PlatformKpi label="Reviews" value={reviews.review_count} />
        </div>
        <InstalledApps installations={installed.installations} busyAction={busyAction} onEnable={enable} onDisable={disable} onUninstall={uninstall} onTest={testConnection} />
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <SecurityBadges security={security} busyAction={busyAction} onApprove={approveSecurity} />
          <ReviewFeed reviews={reviews} />
        </div>
      </PlatformShell>
    </ProtectedWorkspaceShell>
  );
}

