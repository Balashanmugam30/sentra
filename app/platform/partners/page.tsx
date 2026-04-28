"use client";

import { PartnerGrid } from "@/components/platform/partner-grid";
import { PlatformKpi, PlatformShell } from "@/components/platform/platform-shell";
import { VendorBoard } from "@/components/platform/vendor-board";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useMarketplace } from "@/lib/marketplace/use-marketplace";

export default function PlatformPartnersPage() {
  const { vendors, partners, loading, error, busyAction, lastAction, refresh, applyVendor } = useMarketplace();
  return (
    <ProtectedWorkspaceShell>
      <PlatformShell
        eyebrow="Partner Marketplace"
        title="Certified vendor and co-sell ecosystem"
        subtitle="Track implementation firms, channel partners, verified vendors, response SLAs, certification badges, and co-sell pipeline growth."
        loading={loading}
        error={error}
        lastAction={lastAction}
        onRefresh={refresh}
      >
        <div className="grid gap-4 md:grid-cols-4">
          <PlatformKpi label="Vendor Revenue" value={`$${vendors.revenue_generated.toLocaleString()}`} />
          <PlatformKpi label="Certified Vendors" value={vendors.certified_vendors} />
          <PlatformKpi label="Co-Sell Pipeline" value={`$${partners.co_sell_pipeline.toLocaleString()}`} />
          <PlatformKpi label="Consultants" value={partners.certified_consultants} />
        </div>
        <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <VendorBoard vendors={vendors} busyAction={busyAction} onApply={() => applyVendor("Sentra Verified Partner")} />
          <PartnerGrid partners={partners} />
        </div>
      </PlatformShell>
    </ProtectedWorkspaceShell>
  );
}

