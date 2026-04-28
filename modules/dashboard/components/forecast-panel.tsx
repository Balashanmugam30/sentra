"use client";

import { useForecastScoped } from "@/lib/analytics/use-forecast";
import type { FinancialImpactLevel, ForecastContinuity, ReputationRiskLevel } from "@/lib/analytics/types";

function formatTimestamp(timestamp: string | undefined) {
  if (!timestamp) {
    return "Waiting for predictive forecast";
  }

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "Waiting for predictive forecast";
  }

  return date.toLocaleString();
}

function continuityStyles(value: ForecastContinuity) {
  if (value === "critical") {
    return {
      color: "#fca5a5",
      borderColor: "rgba(248, 113, 113, 0.24)",
      background: "rgba(127, 29, 29, 0.18)",
    };
  }
  if (value === "degraded") {
    return {
      color: "#fcd34d",
      borderColor: "rgba(245, 158, 11, 0.24)",
      background: "rgba(120, 53, 15, 0.18)",
    };
  }
  if (value === "strained") {
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

function toneStyles(value: FinancialImpactLevel | ReputationRiskLevel) {
  if (value === "severe" || value === "high") {
    return continuityStyles("critical");
  }
  if (value === "moderate" || value === "medium") {
    return continuityStyles("degraded");
  }
  return continuityStyles("stable");
}

export function ForecastPanel() {
  const { forecast, loading, error } = useForecastScoped("forecast-only");

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
              Predictive Executive Intelligence
            </p>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--text)]">
              Forward Risk, Continuity, and Recovery Outlook
            </h2>
            <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
              Refreshed {formatTimestamp(forecast?.generated_at)}
            </p>
          </div>
          <div className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
            {loading ? "Refreshing forecast" : `Recovery ETA ${forecast?.recovery_eta_minutes ?? 0} min`}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {(forecast?.time_windows ?? []).map((window, index) => {
            const styles = continuityStyles(window.continuity);
            return (
              <div
                className="rounded-[22px] border p-4"
                key={`${window.minute}-${index}`}
                style={{
                  borderColor: "var(--sentra-border-subtle)",
                  background: "var(--surface-soft)",
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium text-[var(--text)]">+{window.minute} min</div>
                    <div className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[var(--text)]">
                      {window.risk_score}
                    </div>
                    <div className="mt-2 text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                      {window.expected_disruption}
                    </div>
                  </div>
                  <span
                    className="rounded-full border px-3 py-1 text-[0.68rem] uppercase tracking-[0.16em]"
                    style={{
                      color: styles.color,
                      borderColor: styles.borderColor,
                      background: styles.background,
                    }}
                  >
                    {window.continuity}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-[1fr_1fr]">
          <div
            className="rounded-[22px] border p-4"
            style={{
              borderColor: "var(--sentra-border-subtle)",
              background: "var(--surface-soft)",
            }}
          >
            <h3 className="text-sm font-medium text-[var(--text)]">Probability Metrics</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {[
                ["Containment", `${forecast?.metrics?.containment_probability ?? 0}%`],
                ["Escalation", `${forecast?.metrics?.escalation_probability ?? 0}%`],
                ["Evac Completion", `${forecast?.metrics?.evac_completion_probability ?? 0}%`],
                ["Resource Recovery", `${forecast?.metrics?.resource_recovery_probability ?? 0}%`],
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

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["Financial Exposure", forecast?.financial_exposure ?? "low"],
                ["Reputation Risk", forecast?.reputation_risk ?? "low"],
              ].map(([label, value], index) => {
                const styles = toneStyles(value as FinancialImpactLevel | ReputationRiskLevel);
                return (
                  <div
                    className="rounded-[22px] border p-4"
                    key={`${label}-${index}`}
                    style={{
                      borderColor: styles.borderColor,
                      background: styles.background,
                    }}
                  >
                    <div
                      className="text-[0.68rem] uppercase tracking-[0.16em]"
                      style={{ color: "var(--sentra-text-soft)" }}
                    >
                      {label}
                    </div>
                    <div className="mt-3 text-lg font-medium capitalize" style={{ color: styles.color }}>
                      {value}
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              className="rounded-[22px] border p-4"
              style={{
                borderColor: "var(--sentra-border-subtle)",
                background: "var(--surface-soft)",
              }}
            >
              <h3 className="text-sm font-medium text-[var(--text)]">Executive Summary</h3>
              <div className="mt-3 space-y-3">
                {(forecast?.executive_summary ?? []).map((item, index) => (
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
