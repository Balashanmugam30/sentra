"use client";

import { BrandBuilder } from "@/components/platform/brand-builder";
import { ExpansionScore } from "@/components/platform/expansion-score";
import { OemContracts } from "@/components/platform/oem-contracts";
import { PlatformKpi, PlatformShell } from "@/components/platform/platform-shell";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { formatMoney } from "@/lib/channel/runtime";
import { useChannel } from "@/lib/channel/use-channel";

export default function PlatformWhiteLabelPage() {
  const { summary, whitelabel, oem, loading, error, busyAction, lastAction, refresh, createBrand } = useChannel();

  return (
    <ProtectedWorkspaceShell>
      <PlatformShell
        eyebrow="White-label OS"
        title="Launch Sentra-powered branded editions"
        subtitle="Control branded portals, custom domains, language packs, OEM licensing, and white-label ARR from one global distribution layer."
        loading={loading}
        error={error}
        lastAction={lastAction}
        onRefresh={refresh}
      >
        <div className="grid gap-4 md:grid-cols-4">
          <PlatformKpi label="White-label ARR" value={formatMoney(summary.white_label_arr)} />
          <PlatformKpi label="Active Brands" value={whitelabel.active_brands} />
          <PlatformKpi label="Licensed Seats" value={whitelabel.license_seats.toLocaleString()} />
          <PlatformKpi label="OEM Commit" value={formatMoney(summary.oem_commitment)} />
        </div>
        <ExpansionScore summary={summary} />
        <BrandBuilder whitelabel={whitelabel} busyAction={busyAction} onCreateBrand={() => createBrand("SafeOps Partner Command")} />
        <OemContracts oem={oem} />
      </PlatformShell>
    </ProtectedWorkspaceShell>
  );
}

