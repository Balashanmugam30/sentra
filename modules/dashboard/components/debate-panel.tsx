"use client";

import { useDebate } from "@/lib/agents/use-debate";
import type { CouncilGlobalState, DebateScenario } from "@/lib/agents/types";

const scenarios: DebateScenario[] = [
  "critical_fire",
  "gas_leak",
  "mass_panic",
  "resource_shortage",
  "comms_breakdown",
  "dual_incident",
];

function formatTimestamp(timestamp: string | undefined) {
  if (!timestamp) {
    return "Waiting for debate state";
  }
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "Waiting for debate state";
  }
  return date.toLocaleString();
}

function stateStyles(level: CouncilGlobalState | string) {
  if (level === "emergency" || level === "critical") {
    return {
      color: "#fca5a5",
      borderColor: "rgba(248, 113, 113, 0.28)",
      background: "rgba(127, 29, 29, 0.26)",
    };
  }
  if (level === "elevated" || level === "active") {
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

export function DebatePanel() {
  const { live, loading, error, lastAction, refresh, resetDebate, runScenario } = useDebate();
  const globalStyles = stateStyles(live?.global_state ?? "stable");
  const debateStyles = stateStyles(live?.active_debate?.status ?? "idle");

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
              AI Debate &amp; Consensus Chamber
            </p>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--text)]">
              Multi-agent critique, negotiation rounds, and final consensus planning
            </h2>
            <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
              Refreshed {formatTimestamp(live?.generated_at)}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <span
              className="rounded-full border px-3 py-2 text-xs uppercase tracking-[0.18em]"
              style={{
                color: globalStyles.color,
                borderColor: globalStyles.borderColor,
                background: globalStyles.background,
              }}
            >
              {loading ? "Refreshing" : live?.global_state ?? "stable"}
            </span>
            <span
              className="rounded-full border px-3 py-2 text-xs uppercase tracking-[0.18em]"
              style={{
                color: debateStyles.color,
                borderColor: debateStyles.borderColor,
                background: debateStyles.background,
              }}
            >
              {live?.active_debate?.status ?? "idle"}
            </span>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-4">
          {[
            ["Scenario", live?.active_debate?.scenario ?? "none"],
            ["Consensus Score", `${live?.consensus_score ?? 0}%`],
            ["Conflict Count", live?.active_debate?.conflict_count ?? 0],
            ["Rounds", live?.active_debate?.rounds ?? 0],
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

        <div className="mt-6 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-4">
            <div
              className="rounded-[24px] border p-5"
              style={{
                borderColor: "var(--sentra-border-subtle)",
                background: "var(--surface-soft)",
              }}
            >
              <h3 className="text-sm font-medium text-[var(--text)]">Conflicts</h3>
              <div className="mt-4 space-y-3">
                {(live?.conflicts ?? []).map((conflict, index) => (
                  <div
                    className="rounded-[20px] border p-4"
                    key={`${conflict.conflict_type}-${index}`}
                    style={{
                      borderColor: "rgba(245, 158, 11, 0.24)",
                      background: "var(--surface)",
                    }}
                  >
                    <div className="text-sm font-medium text-[var(--text)]">{conflict.title}</div>
                    <div className="mt-2 text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                      {conflict.description}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {conflict.parties.map((party, partyIndex) => (
                        <span
                          className="rounded-full border px-3 py-1 text-xs uppercase tracking-[0.16em]"
                          key={`${conflict.conflict_type}-party-${partyIndex}`}
                          style={{
                            borderColor: "var(--sentra-border-subtle)",
                            background: "rgba(255,255,255,0.04)",
                            color: "var(--sentra-text-muted)",
                          }}
                        >
                          {party}
                        </span>
                      ))}
                    </div>
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
              <h3 className="text-sm font-medium text-[var(--text)]">Final Consensus Plan</h3>
              <div className="mt-4 space-y-3">
                {(live?.final_plan ?? []).map((item, index) => (
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

          <div className="space-y-4">
            <div
              className="rounded-[24px] border p-5"
              style={{
                borderColor: "var(--sentra-border-subtle)",
                background: "var(--surface-soft)",
              }}
            >
              <h3 className="text-sm font-medium text-[var(--text)]">Participants</h3>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {(live?.participants ?? []).map((participant, index) => (
                  <div
                    className="rounded-[20px] border p-4"
                    key={`${participant.agent_id}-${index}`}
                    style={{
                      borderColor: "var(--sentra-border-subtle)",
                      background: "var(--surface)",
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-medium text-[var(--text)]">{participant.name}</div>
                      <div className="text-xs uppercase tracking-[0.16em]" style={{ color: "var(--sentra-text-soft)" }}>
                        {participant.final_vote}
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-[var(--text)]">
                      <div>Initial: {participant.initial_position}</div>
                      <div className="mt-2">Revised: {participant.revised_position}</div>
                    </div>
                    <div className="mt-3 text-xs" style={{ color: "var(--sentra-text-muted)" }}>
                      Confidence {participant.confidence_before}% → {participant.confidence_after}%
                    </div>
                    {participant.concerns.length ? (
                      <div className="mt-3 space-y-2">
                        {participant.concerns.map((item, concernIndex) => (
                          <div
                            className="rounded-[14px] border px-3 py-2 text-xs"
                            key={`${participant.agent_id}-concern-${concernIndex}`}
                            style={{
                              borderColor: "var(--sentra-border-subtle)",
                              background: "var(--surface-soft)",
                              color: "var(--sentra-text-muted)",
                            }}
                          >
                            {item}
                          </div>
                        ))}
                      </div>
                    ) : null}
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
              <div className="flex flex-wrap gap-2">
                {scenarios.map((scenario, index) => (
                  <button
                    className="rounded-full border px-4 py-2 text-sm font-medium"
                    key={`${scenario}-${index}`}
                    onClick={() => {
                      void runScenario(scenario);
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
              <div className="mt-4 text-sm text-[var(--text)]">{live?.executive_note}</div>
              <div className="mt-2 text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                Recommended next action: {live?.recommended_next_action ?? "none"}
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  className="rounded-full border px-4 py-2 text-sm font-medium"
                  onClick={() => {
                    void resetDebate();
                  }}
                  style={{
                    borderColor: "rgba(148, 163, 184, 0.28)",
                    background: "rgba(255,255,255,0.04)",
                    color: "var(--sentra-text-muted)",
                  }}
                  type="button"
                >
                  Reset
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
                <p className="mt-2 text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                  {error}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
