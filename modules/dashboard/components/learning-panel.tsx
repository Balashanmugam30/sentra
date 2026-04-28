"use client";

import { useLearning } from "@/lib/agents/use-learning";
import type { ConfidenceTrend, LearningScenario, LearningState } from "@/lib/agents/types";

const scenarios: LearningScenario[] = [
  "critical_fire",
  "gas_leak",
  "mass_panic",
  "resource_shortage",
  "dual_incident",
  "citywide_pressure",
];

function formatTimestamp(timestamp: string | undefined) {
  if (!timestamp) {
    return "Waiting for learning state";
  }
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "Waiting for learning state";
  }
  return date.toLocaleString();
}

function stateStyles(state: LearningState | string) {
  if (state === "adaptive") {
    return {
      color: "#bfdbfe",
      borderColor: "rgba(96, 165, 250, 0.24)",
      background: "rgba(30, 64, 175, 0.18)",
    };
  }
  if (state === "mature") {
    return {
      color: "#bbf7d0",
      borderColor: "rgba(74, 222, 128, 0.2)",
      background: "rgba(20, 83, 45, 0.18)",
    };
  }
  if (state === "learning") {
    return {
      color: "#fcd34d",
      borderColor: "rgba(245, 158, 11, 0.24)",
      background: "rgba(120, 53, 15, 0.18)",
    };
  }
  return {
    color: "#cbd5e1",
    borderColor: "rgba(148, 163, 184, 0.18)",
    background: "rgba(51, 65, 85, 0.18)",
  };
}

function trendGlyph(trend: ConfidenceTrend) {
  if (trend === "up") {
    return "↑";
  }
  if (trend === "down") {
    return "↓";
  }
  return "→";
}

export function LearningPanel() {
  const { live, loading, error, lastAction, refresh, resetLearning, runCycle } = useLearning();
  const styles = stateStyles(live?.global_learning_state ?? "cold");

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
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p
              className="text-[0.7rem] uppercase tracking-[0.26em]"
              style={{ color: "var(--sentra-text-soft)" }}
            >
              Adaptive Strategic Learning Engine
            </p>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--text)]">
              Decision improvement memory for strategy performance, agent calibration, and policy updates
            </h2>
            <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
              Refreshed {formatTimestamp(live?.generated_at)}
            </p>
          </div>

          <div
            className="rounded-full border px-4 py-2 text-sm font-medium capitalize"
            style={{
              color: styles.color,
              borderColor: styles.borderColor,
              background: styles.background,
            }}
          >
            {loading ? "Refreshing learning" : live?.global_learning_state ?? "cold"}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-5">
          {[
            ["Episodes", live?.episodes_tracked ?? 0],
            ["Improvement", `${live?.improvement_index ?? 0}%`],
            ["Best Strategy", (live?.best_strategy ?? "none yet").replaceAll("_", " ")],
            ["Best Score", live?.best_strategy_score ?? 0],
            ["Worst Strategy", (live?.worst_strategy ?? "none yet").replaceAll("_", " ")],
          ].map(([label, value], index) => (
            <div
              className="rounded-[22px] border px-4 py-4"
              key={`${label}-${index}`}
              style={{
                borderColor: "var(--sentra-border-subtle)",
                background: "var(--surface-soft)",
              }}
            >
              <div className="text-[0.68rem] uppercase tracking-[0.16em]" style={{ color: "var(--sentra-text-soft)" }}>
                {label}
              </div>
              <div className="mt-3 text-lg font-medium capitalize text-[var(--text)]">{value}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-[1.02fr_0.98fr]">
          <div
            className="rounded-[24px] border p-5"
            style={{
              borderColor: "var(--sentra-border-subtle)",
              background: "var(--surface-soft)",
            }}
          >
            <h3 className="text-sm font-medium text-[var(--text)]">Agent calibration</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {(live?.agent_calibration ?? []).map((item, index) => (
                <div
                  className="rounded-[20px] border p-4"
                  key={`${item.agent}-${index}`}
                  style={{
                    borderColor: "var(--sentra-border-subtle)",
                    background: "var(--surface)",
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-medium text-[var(--text)]">{item.agent}</div>
                    <div className="text-sm font-medium" style={{ color: "var(--sentra-text-muted)" }}>
                      {item.current_accuracy}% {trendGlyph(item.confidence_trend)}
                    </div>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${item.current_accuracy}%`,
                        background:
                          item.confidence_trend === "down"
                            ? "linear-gradient(90deg, rgba(248,113,113,0.9), rgba(239,68,68,0.7))"
                            : item.confidence_trend === "up"
                            ? "linear-gradient(90deg, rgba(96,165,250,0.9), rgba(59,130,246,0.7))"
                            : "linear-gradient(90deg, rgba(148,163,184,0.9), rgba(100,116,139,0.7))",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div
              className="rounded-[24px] border p-5"
              style={{
                borderColor: "var(--sentra-border-subtle)",
                background: "var(--surface-soft)",
              }}
            >
              <h3 className="text-sm font-medium text-[var(--text)]">Learned patterns</h3>
              <div className="mt-4 space-y-2">
                {(live?.learned_patterns ?? []).map((item, index) => (
                  <div
                    className="rounded-[16px] border px-3 py-2 text-sm"
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
              className="rounded-[24px] border p-5"
              style={{
                borderColor: "var(--sentra-border-subtle)",
                background: "var(--surface-soft)",
              }}
            >
              <h3 className="text-sm font-medium text-[var(--text)]">Policy updates</h3>
              <div className="mt-4 space-y-2">
                {(live?.recommended_policy_updates ?? []).map((item, index) => (
                  <div
                    className="rounded-[16px] border px-3 py-2 text-sm"
                    key={`${item}-${index}`}
                    style={{
                      borderColor: "rgba(96, 165, 250, 0.2)",
                      background: "rgba(30, 64, 175, 0.12)",
                      color: "#dbeafe",
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div
          className="mt-6 rounded-[24px] border p-5"
          style={{
            borderColor: "var(--sentra-border-subtle)",
            background: "var(--surface-soft)",
          }}
        >
          <div className="flex flex-wrap gap-2">
            {scenarios.map((scenario, index) => (
              <button
                className="rounded-full border px-4 py-2 text-sm font-medium"
                key={`${scenario}-${index}`}
                onClick={() => {
                  void runCycle(scenario);
                }}
                style={{
                  borderColor: "rgba(148, 163, 184, 0.18)",
                  background: "rgba(255,255,255,0.04)",
                  color: "var(--text)",
                }}
                type="button"
              >
                {scenario.replaceAll("_", " ")}
              </button>
            ))}
          </div>

          <div className="mt-4 text-sm text-[var(--text)]">{live?.executive_summary}</div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              className="rounded-full border px-4 py-2 text-sm font-medium"
              onClick={() => {
                void resetLearning();
              }}
              style={{
                borderColor: "rgba(148, 163, 184, 0.28)",
                background: "rgba(255,255,255,0.04)",
                color: "var(--sentra-text-muted)",
              }}
              type="button"
            >
              Reset Learning
            </button>
            <button
              className="rounded-full border px-4 py-2 text-sm font-medium"
              onClick={() => {
                void refresh();
              }}
              style={{
                borderColor: "rgba(96, 165, 250, 0.26)",
                background: "rgba(30, 64, 175, 0.18)",
                color: "#dbeafe",
              }}
              type="button"
            >
              Refresh
            </button>
          </div>

          {lastAction ? (
            <p className="mt-3 text-sm" style={{ color: "var(--sentra-text-muted)" }}>
              Last action: {lastAction}
            </p>
          ) : null}
          {error ? (
            <p className="mt-2 text-sm" style={{ color: "#fca5a5" }}>
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
