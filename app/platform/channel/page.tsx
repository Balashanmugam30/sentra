"use client";

import { CommissionCenter } from "@/components/platform/commission-center";
import { PartnerTierGrid } from "@/components/platform/partner-tier-grid";
import { PlatformKpi, PlatformShell } from "@/components/platform/platform-shell";
import { RegionalPipeline } from "@/components/platform/regional-pipeline";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { formatMoney } from "@/lib/channel/runtime";
import { useChannel } from "@/lib/channel/use-channel";

export default function PlatformChannelPage() {
  const {
    summary,
    partners,
    resellers,
    revenue,
    pipeline,
    certifications,
    loading,
    error,
    busyAction,
    lastAction,
    refresh,
    upgradePartner,
    payCommission,
    updatePipeline,
  } = useChannel();

  return (
    <ProtectedWorkspaceShell>
      <PlatformShell
        eyebrow="Channel OS"
        title="Resellers, commissions, and partner revenue"
        subtitle="Operate reseller tiers, implementation certifications, support SLAs, commissions, and regional weighted pipeline with investor-grade channel intelligence."
        loading={loading}
        error={error}
        lastAction={lastAction}
        onRefresh={refresh}
      >
        <div className="grid gap-4 md:grid-cols-4">
          <PlatformKpi label="Channel Score" value={summary.channel_score} />
          <PlatformKpi label="Partner ARR" value={formatMoney(summary.partner_arr)} />
          <PlatformKpi label="Reseller MRR" value={formatMoney(resellers.reseller_mrr)} />
          <PlatformKpi label="Open Deals" value={resellers.open_deals} />
        </div>
        <PartnerTierGrid partners={partners} certifications={certifications} busyAction={busyAction} onUpgrade={upgradePartner} />
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <RegionalPipeline pipeline={pipeline} busyAction={busyAction} onAdvance={updatePipeline} />
          <CommissionCenter revenue={revenue} busyAction={busyAction} onPay={payCommission} />
        </div>
      </PlatformShell>
    </ProtectedWorkspaceShell>
  );
}

