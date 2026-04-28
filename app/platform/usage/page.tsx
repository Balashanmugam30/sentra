"use client";

import { DeveloperScore } from "@/components/platform/developer-score";
import { PlatformKpi, PlatformShell } from "@/components/platform/platform-shell";
import { RateLimitBoard } from "@/components/platform/rate-limit-board";
import { TopCustomers } from "@/components/platform/top-customers";
import { UsageChart } from "@/components/platform/usage-chart";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { usePlatform } from "@/lib/platform/use-platform";

export default function PlatformUsagePage() {
  const { summary, usage, rateLimits, loading, error, lastAction, refresh } = usePlatform();
  return (
    <ProtectedWorkspaceShell>
      <PlatformShell
        eyebrow="Platform Usage Analytics"
        title="API consumption and monetization signals"
        subtitle="Track daily and monthly traffic, top endpoints, plan pressure, high-usage tenants, latency health, and revenue expansion opportunities."
        loading={loading}
        error={error}
        lastAction={lastAction}
        onRefresh={refresh}
      >
        <div className="grid gap-4 md:grid-cols-4">
          <PlatformKpi label="Daily API Traffic" value={usage.daily_requests.toLocaleString()} />
          <PlatformKpi label="Monthly Traffic" value={usage.monthly_requests.toLocaleString()} />
          <PlatformKpi label="Error Rate" value={`${usage.error_percent}%`} />
          <PlatformKpi label="Revenue Potential" value={`$${usage.revenue_potential.toLocaleString()}`} />
        </div>
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <UsageChart usage={usage} />
          <TopCustomers usage={usage} />
        </div>
        <RateLimitBoard rateLimits={rateLimits} />
        <DeveloperScore summary={summary} />
      </PlatformShell>
    </ProtectedWorkspaceShell>
  );
}

