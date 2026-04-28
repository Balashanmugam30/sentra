"use client";

import { useForecastScoped } from "@/lib/analytics/use-forecast";
import type { DecisionState, MutualAidNeed } from "@/lib/analytics/types";

function stateStyles(state: DecisionState | MutualAidNeed) {
  if (state === "emergency" || state === "immediate") {
    return {
      color: "#fca5a5",
      borderColor: "rgba(248, 113, 113, 0.24)",
      background: "rgba(127, 29, 29, 0.18)",
    };
  }
  if (state === "critical" || state === "recommended") {
    return {
      color: "#fcd34d",
      borderColor: "rgba(245, 158, 11, 0.24)",
      background: "rgba(120, 53, 15, 0.18)",
    };
  }
  if (state === "elevated" || state === "consider") {
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

export function BoardroomPanel() {
  const { boardroom, error, loading } = useForecastScoped("forecast-with-boardroom");
  const state = stateStyles(boardroom?.decision_state ?? "stable");
  const aid = stateStyles(boardroom?.mutual_aid_need ?? "none");

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
              Boardroom Decision Center
            </p>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--text)]">
              Leadership Action Intelligence + Business Continuity Direction
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div
              className="rounded-full border px-3 py-2 text-xs uppercase tracking-[0.18em]"
              style={{
                color: state.color,
                borderColor: state.borderColor,
                background: state.background,
              }}
            >
              {loading ? "Refreshing" : boardroom?.decision_state ?? "stable"}
            </div>
            <div
              className="rounded-full border px-3 py-2 text-xs uppercase tracking-[0.18em]"
              style={{
                color: aid.color,
                borderColor: aid.borderColor,
                background: aid.background,
              }}
            >
              mutual aid {boardroom?.mutual_aid_need ?? "none"}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-4">
            <div
              className="rounded-[22px] border p-4"
              style={{
                borderColor: "var(--sentra-border-subtle)",
                background: "var(--surface-soft)",
              }}
            >
              <h3 className="text-sm font-medium text-[var(--text)]">Recommended Actions</h3>
              <div className="mt-3 space-y-3">
                {(boardroom?.recommended_actions ?? []).map((item, index) => (
                  <div
                    className="rounded-[18px] border px-4 py-3"
                    key={`${item.priority}-${index}`}
                    style={{
                      borderColor: "var(--sentra-border-subtle)",
                      background: "var(--surface)",
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-medium text-[var(--text)]">
                        {item.priority}. {item.title}
                      </div>
                      <span
                        className="text-[0.68rem] uppercase tracking-[0.16em]"
                        style={{ color: "var(--sentra-text-soft)" }}
                      >
                        {item.urgency}
                      </span>
                    </div>
                    <div className="mt-2 text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                      {item.impact}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div
                className="rounded-[22px] border p-4"
                style={{
                  borderColor: "var(--sentra-border-subtle)",
                  background: "var(--surface-soft)",
                }}
              >
                <div
                  className="text-[0.68rem] uppercase tracking-[0.16em]"
                  style={{ color: "var(--sentra-text-soft)" }}
                >
                  Best Business Mode
                </div>
                <div className="mt-3 text-lg font-medium capitalize text-[var(--text)]">
                  {boardroom?.best_mode ?? "normal operations"}
                </div>
              </div>

              <div
                className="rounded-[22px] border p-4"
                style={{
                  borderColor: "var(--sentra-border-subtle)",
                  background: "var(--surface-soft)",
                }}
              >
                <div
                  className="text-[0.68rem] uppercase tracking-[0.16em]"
                  style={{ color: "var(--sentra-text-soft)" }}
                >
                  Delay Cost / 15 min
                </div>
                <div className="mt-3 text-lg font-medium text-[var(--text)]">
                  {boardroom?.delay_cost_per_15min ?? "$0"}
                </div>
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
              <h3 className="text-sm font-medium text-[var(--text)]">Business Modes</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {(boardroom?.business_modes ?? []).map((mode, index) => (
                  <span
                    className="rounded-full border px-3 py-1 text-xs uppercase tracking-[0.16em]"
                    key={`${mode}-${index}`}
                    style={{
                      borderColor: mode === boardroom?.best_mode ? "rgba(96, 165, 250, 0.28)" : "var(--sentra-border-subtle)",
                      background: mode === boardroom?.best_mode ? "rgba(30, 64, 175, 0.18)" : "rgba(255,255,255,0.04)",
                      color: mode === boardroom?.best_mode ? "#bfdbfe" : "var(--sentra-text-muted)",
                    }}
                  >
                    {mode}
                  </span>
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
              <h3 className="text-sm font-medium text-[var(--text)]">Top Dependencies</h3>
              <div className="mt-3 space-y-3">
                {(boardroom?.top_dependencies ?? []).map((item, index) => (
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
              <h3 className="text-sm font-medium text-[var(--text)]">Board Advisory Notes</h3>
              <div className="mt-3 space-y-3">
                {(boardroom?.board_message ?? []).map((item, index) => (
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
