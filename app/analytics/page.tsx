"use client";

import { ExecutiveAnalyticsCommandCenter } from "@/components/analytics/premium-charts";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useAnalyticsHub } from "@/lib/analytics/use-analytics";
import { useLiveDataEngine } from "@/lib/realtime/use-live-data";
import { LiveOperationsCharts } from "@/modules/charts/live-operations-charts";

export default function AnalyticsSupremacyPage() {
  useLiveDataEngine();
  const { summary, loading, error, refresh } = useAnalyticsHub();

  return (
    <ProtectedWorkspaceShell>
      <main className="sentra-analytics-shell px-5 py-8 text-[var(--text)] md:px-8">
        <div className="relative z-10 mx-auto max-w-[1520px]">
          <ExecutiveAnalyticsCommandCenter
            error={error}
            loading={loading}
            onRefresh={() => void refresh()}
            summary={summary}
          />
          <section className="mt-6">
            <LiveOperationsCharts />
          </section>
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}
