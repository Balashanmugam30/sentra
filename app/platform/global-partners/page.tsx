"use client";

import { FranchisePanel } from "@/components/platform/franchise-panel";
import { GlobalLeaderboard } from "@/components/platform/global-leaderboard";
import { OemContracts } from "@/components/platform/oem-contracts";
import { PartnerTierGrid } from "@/components/platform/partner-tier-grid";
import { PlatformKpi, PlatformShell } from "@/components/platform/platform-shell";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { formatMoney } from "@/lib/channel/runtime";
import { useChannel } from "@/lib/channel/use-channel";

export default function PlatformGlobalPartnersPage() {
  const { summary, partners, revenue, oem, certifications, loading, error, busyAction, lastAction, refresh, upgradePartner } = useChannel();

  return (
    <ProtectedWorkspaceShell>
      <PlatformShell
        eyebrow="Global Partner Network"
        title="Implementation, OEM, and franchise expansion"
        subtitle="Track country partners, certified integrators, OEM embeds, franchise operators, coverage gaps, and co-sell opportunities across the global Sentra ecosystem."
        loading={loading}
        error={error}
        lastAction={lastAction}
        onRefresh={refresh}
      >
        <div className="grid gap-4 md:grid-cols-4">
          <PlatformKpi label="Active Partners" value={summary.active_partners} />
          <PlatformKpi label="Coverage" value={partners.coverage_countries.length} />
          <PlatformKpi label="Forecast ARR" value={formatMoney(revenue.forecast_arr)} />
          <PlatformKpi label="OEM Seats" value={oem.seats.toLocaleString()} />
        </div>
        <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <GlobalLeaderboard partners={partners} revenue={revenue} />
          <FranchisePanel partners={partners} />
        </div>
        <PartnerTierGrid partners={partners} certifications={certifications} busyAction={busyAction} onUpgrade={upgradePartner} />
        <OemContracts oem={oem} />
      </PlatformShell>
    </ProtectedWorkspaceShell>
  );
}

