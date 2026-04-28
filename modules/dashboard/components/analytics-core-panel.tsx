"use client";

import { useAnalytics } from "@/lib/analytics/use-analytics";
import type { AnalyticsGlobalStatus } from "@/lib/analytics/types";
import { KpiStrip } from "@/modules/dashboard/components/kpi-strip";

function formatTimestamp(timestamp: string | undefined) {
  if (!timestamp) {
    return "Waiting for analytics stream";
  }

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "Waiting for analytics stream";
  }

  return date.toLocaleString();
}

function getStatusStyles(status: AnalyticsGlobalStatus) {
  if (status === "critical") {
    return {
      color: "#fca5a5",
      borderColor: "rgba(248, 113, 113, 0.28)",
      background: "rgba(127, 29, 29, 0.26)",
    };
  }

  if (status === "elevated") {
    return {
      color: "#fcd34d",
      borderColor: "rgba(245, 158, 11, 0.24)",
      background: "rgba(120, 53, 15, 0.18)",
    };
  }

  return {
    color: "#bbf7d0",
    borderColor: "rgba(74, 222, 128, 0.22)",
    background: "rgba(20, 83, 45, 0.2)",
  };
}

export function AnalyticsCorePanel() {
  const { data, cards, loading, error } = useAnalytics();
  const statusStyles = getStatusStyles(data?.global_status ?? "normal");

  return (
    <section
      className="relative w-full overflow-hidden rounded-[28px] border px-6 py-5 backdrop-blur-xl"
      style={{
        borderColor: "var(--border)",
        background: "var(--surface)",
        boxShadow: "var(--sentra-shadow-panel)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-[1px] rounded-[27px]"
        style={{
          border: "1px solid var(--border)",
          background: "var(--surface-soft)",
        }}
      />

      <div className="relative z-10">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p
              className="text-[0.7rem] uppercase tracking-[0.26em]"
              style={{ color: "var(--sentra-text-soft)" }}
            >
              Executive Analytics Core
            </p>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--text)]">
              Live Operational KPIs + Performance Intelligence
            </h2>
            <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
              Refreshed {formatTimestamp(data?.generated_at)}
            </p>
          </div>
          <div
            className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs uppercase tracking-[0.18em]"
            style={{
              borderColor: statusStyles.borderColor,
              background: statusStyles.background,
              color: statusStyles.color,
            }}
          >
            {loading ? "Refreshing" : data?.global_status ?? "normal"}
          </div>
        </div>

        <div className="mt-6">
          <KpiStrip cards={cards} />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-4">
            <div
              className="rounded-[22px] border p-4"
              style={{
                borderColor: "var(--sentra-border-subtle)",
                background: "var(--surface-soft)",
              }}
            >
              <h3 className="text-sm font-medium text-[var(--text)]">Summary Metrics</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {[
                  ["Active Incidents", data?.summary?.active_incidents ?? 0],
                  ["Critical Incidents", data?.summary?.critical_incidents ?? 0],
                  ["Resolved Today", data?.summary?.resolved_today ?? 0],
                  ["Alerts Sent", data?.summary?.alerts_sent ?? 0],
                  ["Zones Impacted", data?.summary?.zones_impacted ?? 0],
                  ["Containment", `${data?.kpis?.containment_success_rate ?? 0}%`],
                ].map(([label, value], index) => (
                  <div
                    className="rounded-[18px] border px-4 py-3"
                    key={`${label}-${index}`}
                    style={{
                      borderColor: "var(--sentra-border-subtle)",
                      background: "var(--surface)",
                    }}
                  >
                    <div
                      className="text-[0.68rem] uppercase tracking-[0.16em]"
                      style={{ color: "var(--sentra-text-soft)" }}
                    >
                      {label}
                    </div>
                    <div className="mt-2 text-lg font-medium text-[var(--text)]">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div
              className="rounded-[22px] border p-4"
              style={{
                borderColor: "var(--sentra-border-subtle)",
                background: "var(--surface-soft)",
              }}
            >
              <h3 className="text-sm font-medium text-[var(--text)]">Top Risks</h3>
              <div className="mt-3 space-y-3">
                {(data?.top_risks ?? []).map((risk, index) => (
                  <div
                    className="rounded-[18px] border px-4 py-3 text-sm"
                    key={`${risk}-${index}`}
                    style={{
                      borderColor: "var(--sentra-border-subtle)",
                      background: "var(--surface)",
                      color: "var(--text)",
                    }}
                  >
                    {risk}
                  </div>
                ))}
              </div>
            </div>

            <div
              className="rounded-[22px] border p-4"
              style={{
                borderColor: "var(--sentra-border-subtle)",
                background: "var(--surface-soft)",
              }}
            >
              <h3 className="text-sm font-medium text-[var(--text)]">Recommended Next Actions</h3>
              <div className="mt-3 space-y-3">
                {(data?.next_actions ?? []).map((action, index) => (
                  <div
                    className="rounded-[18px] border px-4 py-3 text-sm"
                    key={`${action}-${index}`}
                    style={{
                      borderColor: "var(--sentra-border-subtle)",
                      background: "var(--surface)",
                      color: "var(--text)",
                    }}
                  >
                    {action}
                  </div>
                ))}
                {error ? (
                  <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                    {error}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
