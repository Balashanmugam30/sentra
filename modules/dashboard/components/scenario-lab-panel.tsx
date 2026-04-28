"use client";

import { useScenarioLab } from "@/lib/analytics/use-scenario-lab";
import type {
  AnalyticsCardStatus,
  ScenarioLabOptionResult,
  ScenarioWinner,
} from "@/lib/analytics/types";

function winnerStyles(winner: ScenarioWinner) {
  if (winner === "tie") {
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

function scoreTone(score: number): AnalyticsCardStatus {
  if (score >= 80) {
    return "excellent";
  }
  if (score >= 60) {
    return "good";
  }
  if (score >= 40) {
    return "watch";
  }
  return "critical";
}

function toneStyles(status: AnalyticsCardStatus) {
  if (status === "critical") {
    return {
      color: "#fca5a5",
      borderColor: "rgba(248, 113, 113, 0.24)",
      background: "rgba(127, 29, 29, 0.18)",
    };
  }
  if (status === "watch") {
    return {
      color: "#fcd34d",
      borderColor: "rgba(245, 158, 11, 0.24)",
      background: "rgba(120, 53, 15, 0.18)",
    };
  }
  if (status === "good") {
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

function OptionCard({
  title,
  option,
}: {
  title: string;
  option: ScenarioLabOptionResult | null;
}) {
  const scoreState = toneStyles(scoreTone(option?.overall_score ?? 0));

  return (
    <div
      className="rounded-[24px] border p-5"
      style={{
        borderColor: "var(--sentra-border-subtle)",
        background: "var(--surface-soft)",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div
            className="text-[0.68rem] uppercase tracking-[0.18em]"
            style={{ color: "var(--sentra-text-soft)" }}
          >
            {title}
          </div>
          <div className="mt-2 text-lg font-medium text-[var(--text)]">
            {option?.title ?? "Select scenario"}
          </div>
        </div>
        <span
          className="rounded-full border px-3 py-1 text-xs uppercase tracking-[0.16em]"
          style={{
            color: scoreState.color,
            borderColor: scoreState.borderColor,
            background: scoreState.background,
          }}
        >
          score {option?.overall_score ?? 0}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {[
          ["Casualty Risk", `${option?.casualty_risk ?? 0}`],
          ["Containment", `${option?.containment_probability ?? 0}%`],
          ["Recovery ETA", `${option?.recovery_eta_minutes ?? 0} min`],
          ["Downtime", `${option?.downtime_minutes ?? 0} min`],
          ["Financial Impact", option?.financial_impact ?? "low"],
          ["Reputation Risk", option?.reputation_risk ?? "low"],
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
              className="text-[0.64rem] uppercase tracking-[0.16em]"
              style={{ color: "var(--sentra-text-soft)" }}
            >
              {label}
            </div>
            <div className="mt-2 text-sm font-medium capitalize text-[var(--text)]">
              {value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ScenarioLabPanel() {
  const {
    presets,
    result,
    optionA,
    optionB,
    loading,
    comparing,
    error,
    setOptionA,
    setOptionB,
    compare,
  } = useScenarioLab();

  const winner = winnerStyles(result?.winner ?? "tie");

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
              Executive Scenario Lab
            </p>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--text)]">
              Comparative Decision Intelligence Before Leadership Acts
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[520px]">
            <select
              className="rounded-[16px] border px-4 py-3 text-sm outline-none"
              value={optionA}
              onChange={(event) => setOptionA(event.target.value)}
              style={{
                borderColor: "var(--sentra-border-subtle)",
                background: "rgba(15, 23, 42, 0.78)",
                color: "var(--text)",
              }}
            >
              {presets.map((preset, index) => (
                <option key={`${preset.id}-${index}`} value={preset.id}>
                  Option A · {preset.title}
                </option>
              ))}
            </select>
            <select
              className="rounded-[16px] border px-4 py-3 text-sm outline-none"
              value={optionB}
              onChange={(event) => setOptionB(event.target.value)}
              style={{
                borderColor: "var(--sentra-border-subtle)",
                background: "rgba(15, 23, 42, 0.78)",
                color: "var(--text)",
              }}
            >
              {presets.map((preset, index) => (
                <option key={`${preset.id}-${index}`} value={preset.id}>
                  Option B · {preset.title}
                </option>
              ))}
            </select>
            <button
              className="rounded-[16px] border px-4 py-3 text-sm font-medium transition"
              onClick={() => {
                void compare();
              }}
              style={{
                borderColor: "rgba(96, 165, 250, 0.26)",
                background: "rgba(30, 64, 175, 0.18)",
                color: "#dbeafe",
              }}
              type="button"
            >
              {loading || comparing ? "Comparing strategies" : "Compare Decisions"}
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-[1fr_0.7fr_1fr]">
          <OptionCard title="Option A" option={result?.comparison?.option_a ?? null} />

          <div className="space-y-4">
            <div
              className="rounded-[24px] border p-5"
              style={{
                borderColor: winner.borderColor,
                background: winner.background,
              }}
            >
              <div
                className="text-[0.68rem] uppercase tracking-[0.18em]"
                style={{ color: "var(--sentra-text-soft)" }}
              >
                Winner
              </div>
              <div className="mt-3 text-xl font-semibold capitalize" style={{ color: winner.color }}>
                {result?.winner === "tie"
                  ? "Tie"
                  : result?.winner === "option_a"
                    ? "Option A"
                    : "Option B"}
              </div>
              <div className="mt-3 text-sm text-[var(--text)]">
                {result?.recommended_choice ?? "Awaiting comparison"}
              </div>
            </div>

            <div
              className="rounded-[24px] border p-5"
              style={{
                borderColor: "var(--sentra-border-subtle)",
                background: "var(--surface-soft)",
              }}
            >
              <h3 className="text-sm font-medium text-[var(--text)]">Decision Reasoning</h3>
              <div className="mt-3 space-y-3">
                {(result?.decision_reasoning ?? []).map((item, index) => (
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

          <OptionCard title="Option B" option={result?.comparison?.option_b ?? null} />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
          <div
            className="rounded-[24px] border p-5"
            style={{
              borderColor: "var(--sentra-border-subtle)",
              background: "var(--surface-soft)",
            }}
          >
            <h3 className="text-sm font-medium text-[var(--text)]">Executive Summary</h3>
            <div className="mt-3 space-y-3">
              {(result?.executive_summary ?? []).map((item, index) => (
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
            className="rounded-[24px] border p-5"
            style={{
              borderColor: "var(--sentra-border-subtle)",
              background: "var(--surface-soft)",
            }}
          >
            <h3 className="text-sm font-medium text-[var(--text)]">Scenario Categories</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {presets.map((preset, index) => (
                <span
                  className="rounded-full border px-3 py-1 text-xs uppercase tracking-[0.16em]"
                  key={`${preset.id}-${index}`}
                  style={{
                    borderColor:
                      preset.id === optionA || preset.id === optionB
                        ? "rgba(96, 165, 250, 0.28)"
                        : "var(--sentra-border-subtle)",
                    background:
                      preset.id === optionA || preset.id === optionB
                        ? "rgba(30, 64, 175, 0.18)"
                        : "rgba(255,255,255,0.04)",
                    color:
                      preset.id === optionA || preset.id === optionB
                        ? "#bfdbfe"
                        : "var(--sentra-text-muted)",
                  }}
                >
                  {preset.category.replaceAll("_", " ")}
                </span>
              ))}
            </div>
            {error ? (
              <p className="mt-4 text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                {error}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
