"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

import {
  Button,
  GlassCard,
  GlassPanel,
  MetricCard,
  StatusBadge,
} from "@/components/ui";
import { useAnalyticsHub } from "@/lib/analytics/use-analytics";
import { useLiveDataEngine } from "@/lib/realtime/use-live-data";
import { ExecutiveAnalyticsCommandCenter } from "@/components/analytics/premium-charts";
import { LiveOperationsCharts } from "@/modules/charts/live-operations-charts";

export function OperationalAnalyticsWorkspace() {
  useLiveDataEngine();
  const { summary, loading, error, refresh } = useAnalyticsHub();

  const readinessScore = useMemo(() => {
    return summary?.analytics_supremacy_score ?? 94;
  }, [summary]);

  const lossPreventedFormatted = useMemo(() => {
    if (!summary) return "$2.1M";
    const metric = Object.values(summary.metrics)
      .flat()
      .find((item) => item.metric_id === "MET-ROI");
    const val = metric?.value ?? 2100000;
    return `$${(val / 1000000).toFixed(1)}M`;
  }, [summary]);

  return (
    <div className="sentra-analytics-workspace mx-auto flex w-full max-w-[1560px] flex-col gap-6 px-4 pb-12 pt-4 md:px-6 lg:px-8">
      {/* Top Header */}
      <GlassPanel tier="elevated" className="flex flex-col gap-5 p-6 md:p-8">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-cyan-300">
                Executive & Operational Analytics
              </span>
              <StatusBadge status="safe" size="sm" pulse variant="glass">
                Telemetry Active
              </StatusBadge>
              <StatusBadge status="intelligence" size="sm" variant="glass">
                Demo / Simulation
              </StatusBadge>
            </div>
            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-white md:text-5xl">
              Operations & Risk Telemetry
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-white/60 md:text-base">
              Predictive risk indexing, avoided downtime metrics, multi-hazard trend lines, and scenario planning models.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              disabled={loading}
              onClick={() => void refresh()}
              title="Refresh Analytics Dataset"
            >
              {loading ? "Refreshing..." : "↻ Refresh Telemetry"}
            </Button>
          </div>
        </div>
      </GlassPanel>

      {/* Top KPI row */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricCard
          label="Readiness Index"
          value={`${readinessScore}%`}
          status="safe"
          trend="up"
          trendLabel="+3.2% vs 7-day average"
        />
        <MetricCard
          label="Loss Prevented"
          value={lossPreventedFormatted}
          status="intelligence"
          trend="up"
          trendLabel="Annualized projected ROI"
        />
        <MetricCard
          label="Response Acceleration"
          value="61%"
          status="safe"
          trend="up"
          trendLabel="AI dispatch latency reduction"
        />
        <MetricCard
          label="Model Precision"
          value="96.4%"
          status="intelligence"
          trend="neutral"
          trendLabel="Zero false negative incidents"
        />
      </div>

      {/* Main Analytics Command Center */}
      <ExecutiveAnalyticsCommandCenter
        error={error}
        loading={loading}
        onRefresh={() => void refresh()}
        summary={summary}
      />

      {/* Live Operations Charts */}
      <section className="mt-2">
        <LiveOperationsCharts />
      </section>
    </div>
  );
}
