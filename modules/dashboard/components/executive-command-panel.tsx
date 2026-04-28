"use client";

import { useExecutive } from "@/lib/analytics/use-executive";
import type {
  AnalyticsGlobalStatus,
  FinancialImpactLevel,
  OperationalContinuity,
} from "@/lib/analytics/types";
import { ReadinessScorecards } from "@/modules/dashboard/components/readiness-scorecards";

function formatTimestamp(timestamp: string | undefined) {
  if (!timestamp) {
    return "Waiting for executive stream";
  }

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "Waiting for executive stream";
  }

  return date.toLocaleString();
}

function statusStyles(status: AnalyticsGlobalStatus) {
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

function impactStyles(level: FinancialImpactLevel) {
  if (level === "severe") {
    return statusStyles("critical");
  }
  if (level === "high") {
    return statusStyles("elevated");
  }
  if (level === "moderate") {
    return {
      color: "#bfdbfe",
      borderColor: "rgba(96, 165, 250, 0.24)",
      background: "rgba(30, 64, 175, 0.16)",
    };
  }
  return {
    color: "#bbf7d0",
    borderColor: "rgba(74, 222, 128, 0.22)",
    background: "rgba(20, 83, 45, 0.2)",
  };
}

function continuityStyles(level: OperationalContinuity) {
  if (level === "disrupted") {
    return statusStyles("critical");
  }
  if (level === "degraded") {
    return statusStyles("elevated");
  }
  return {
    color: "#bfdbfe",
    borderColor: "rgba(96, 165, 250, 0.24)",
    background: "rgba(30, 64, 175, 0.16)",
  };
}

function radial(score: number, color: string) {
  return `conic-gradient(${color} ${score * 3.6}deg, rgba(148, 163, 184, 0.12) 0deg)`;
}

export function ExecutiveCommandPanel() {
  const { executive, readiness, loading, error } = useExecutive();
  const globalStyles = statusStyles(executive?.global_status ?? "normal");
  const impact = impactStyles(executive?.financial_impact_level ?? "low");
  const continuity = continuityStyles(executive?.operational_continuity ?? "stable");

  return (
    <>
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
                Executive Command Dashboard
              </p>
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--text)]">
                Leadership Intelligence + Strategic Readiness
              </h2>
              <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                Refreshed {formatTimestamp(executive?.generated_at)}
              </p>
            </div>
            <div
              className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs uppercase tracking-[0.18em]"
              style={{
                borderColor: globalStyles.borderColor,
                background: globalStyles.background,
                color: globalStyles.color,
              }}
            >
              {loading ? "Refreshing" : executive?.global_status ?? "normal"}
            </div>
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  {
                    label: "Executive Risk Score",
                    value: executive?.executive_risk_score ?? 0,
                    color: "#ef4444",
                  },
                  {
                    label: "Organization Readiness",
                    value: executive?.organization_readiness ?? readiness?.overall_readiness ?? 0,
                    color: "#38bdf8",
                  },
                ].map((item, index) => (
                  <div
                    className="rounded-[24px] border p-5"
                    key={`${item.label}-${index}`}
                    style={{
                      borderColor: "var(--sentra-border-subtle)",
                      background: "var(--surface-soft)",
                    }}
                  >
                    <div className="text-sm font-medium text-[var(--text)]">{item.label}</div>
                    <div className="mt-5 flex items-center justify-center">
                      <div
                        className="relative flex h-32 w-32 items-center justify-center rounded-full"
                        style={{
                          background: radial(item.value, item.color),
                        }}
                      >
                        <div
                          className="flex h-24 w-24 flex-col items-center justify-center rounded-full"
                          style={{
                            background: "rgba(15, 23, 42, 0.92)",
                            border: "1px solid rgba(148, 163, 184, 0.14)",
                          }}
                        >
                          <div className="text-3xl font-semibold tracking-[-0.04em] text-[var(--text)]">
                            {item.value}
                          </div>
                          <div
                            className="mt-1 text-[0.62rem] uppercase tracking-[0.18em]"
                            style={{ color: "var(--sentra-text-soft)" }}
                          >
                            score
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div
                  className="rounded-[22px] border p-4"
                  style={{
                    borderColor: impact.borderColor,
                    background: impact.background,
                  }}
                >
                  <div
                    className="text-[0.68rem] uppercase tracking-[0.16em]"
                    style={{ color: "var(--sentra-text-soft)" }}
                  >
                    Financial Impact
                  </div>
                  <div className="mt-3 text-lg font-medium capitalize" style={{ color: impact.color }}>
                    {executive?.financial_impact_level ?? "low"}
                  </div>
                </div>

                <div
                  className="rounded-[22px] border p-4"
                  style={{
                    borderColor: continuity.borderColor,
                    background: continuity.background,
                  }}
                >
                  <div
                    className="text-[0.68rem] uppercase tracking-[0.16em]"
                    style={{ color: "var(--sentra-text-soft)" }}
                  >
                    Operational Continuity
                  </div>
                  <div className="mt-3 text-lg font-medium capitalize" style={{ color: continuity.color }}>
                    {executive?.operational_continuity ?? "stable"}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div
                className="rounded-[22px] border p-4"
                style={{
                  borderColor: "var(--sentra-border-subtle)",
                  background: "var(--surface-soft)",
                }}
              >
                <h3 className="text-sm font-medium text-[var(--text)]">Top Threats</h3>
                <div className="mt-3 space-y-3">
                  {(executive?.top_threats ?? []).map((threat, index) => (
                    <div
                      className="rounded-[18px] border px-4 py-3"
                      key={`${threat.title}-${threat.severity}-${index}`}
                      style={{
                        borderColor: "var(--sentra-border-subtle)",
                        background: "var(--surface)",
                      }}
                    >
                      <div className="text-sm font-medium text-[var(--text)]">{threat.title}</div>
                      <div
                        className="mt-2 text-[0.68rem] uppercase tracking-[0.16em]"
                        style={{ color: threat.severity === "critical" ? "#fca5a5" : threat.severity === "high" ? "#fcd34d" : "#bfdbfe" }}
                      >
                        {threat.severity}
                      </div>
                    </div>
                  ))}
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
                  <h3 className="text-sm font-medium text-[var(--text)]">Strategic Priorities</h3>
                  <div className="mt-3 space-y-3">
                    {(executive?.strategic_priorities ?? []).map((item, index) => (
                      <div
                        className="rounded-[18px] border px-4 py-3 text-sm"
                        key={`${item}-${index}`}
                        style={{
                          borderColor: "var(--sentra-border-subtle)",
                          background: "var(--surface)",
                          color: "var(--text)",
                        }}
                      >
                        {item}
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
                  <h3 className="text-sm font-medium text-[var(--text)]">Recommended Decisions</h3>
                  <div className="mt-3 space-y-3">
                    {(executive?.recommended_decisions ?? []).map((item, index) => (
                      <div
                        className="rounded-[18px] border px-4 py-3 text-sm"
                        key={`${item}-${index}`}
                        style={{
                          borderColor: "var(--sentra-border-subtle)",
                          background: "var(--surface)",
                          color: "var(--text)",
                        }}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {(executive?.board_summary ?? []).map((item, index) => (
              <span
                className="rounded-full border px-3 py-1 text-xs uppercase tracking-[0.16em]"
                key={`${item}-${index}`}
                style={{
                  borderColor: "var(--sentra-border-subtle)",
                  background: "rgba(255,255,255,0.04)",
                  color: "var(--sentra-text-muted)",
                }}
              >
                {item}
              </span>
            ))}
          </div>

          {error ? (
            <p className="mt-4 text-sm" style={{ color: "var(--sentra-text-muted)" }}>
              {error}
            </p>
          ) : null}
        </div>
      </section>

      <ReadinessScorecards
        overallReadiness={readiness?.overall_readiness ?? 0}
        scorecards={readiness?.scorecards ?? []}
      />
    </>
  );
}
