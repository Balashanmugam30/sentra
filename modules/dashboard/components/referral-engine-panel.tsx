"use client";

import { useRevenueGrowth } from "@/lib/revenue-growth/use-revenue-growth";
import { RevenueActionButton, RevenueMetricCard, RevenuePanelShell, revenueMoney } from "@/modules/dashboard/components/revenue-panel-primitives";

export function ReferralEnginePanel() {
  const { busyAction, launchReferralCampaign, referralPrograms } = useRevenueGrowth();
  const totalRevenue = referralPrograms.reduce((sum, program) => sum + program.revenue_generated, 0);

  return (
    <RevenuePanelShell
      action={
        <RevenueActionButton busy={busyAction === "referral"} onClick={() => void launchReferralCampaign()}>
          {busyAction === "referral" ? "Launching..." : "Launch Campaign"}
        </RevenueActionButton>
      }
      description="Multi-tier referral and partner loops convert customers, agencies, and enterprise champions into acquisition channels."
      eyebrow="Referral Engine"
      title={`${revenueMoney.format(totalRevenue || 322_000)} referral revenue influenced`}
      tone="gold"
    >
      <div className="grid gap-3 lg:grid-cols-3">
        {referralPrograms.map((program) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4" key={program.program_id}>
            <p className="text-sm font-semibold text-white">{program.name}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-cyan-50/48">{program.tier}</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <RevenueMetricCard label="Accepted" value={program.referrals_accepted.toLocaleString()} />
              <RevenueMetricCard label="Revenue" value={revenueMoney.format(program.revenue_generated)} />
            </div>
            <p className="mt-3 text-xs leading-5 text-white/50">Top ambassador: {program.top_ambassador}</p>
          </div>
        ))}
      </div>
    </RevenuePanelShell>
  );
}
