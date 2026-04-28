"use client";

import { useAgents } from "@/lib/agents/use-agents";
import type { AgentScenario, CouncilGlobalState } from "@/lib/agents/types";

function formatTimestamp(timestamp: string | undefined) {
  if (!timestamp) {
    return "Waiting for council state";
  }
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "Waiting for council state";
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
  if (level === "elevated") {
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

const scenarioButtons: AgentScenario[] = [
  "critical_fire",
  "gas_leak",
  "mass_panic",
  "resource_shortage",
  "comms_breakdown",
];

export function AICouncilPanel() {
  const { live, loading, error, lastAction, refresh, resetCouncil, runScenario } = useAgents();
  const globalStyles = stateStyles(live?.global_state ?? "stable");

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
              Persistent AI Command Council
            </p>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--text)]">
              Specialist command agents with persistent memory, alignment, and joint planning
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
            <button
              className="rounded-full border px-4 py-2 text-sm font-medium"
              onClick={() => {
                void resetCouncil();
              }}
              style={{
                borderColor: "rgba(148, 163, 184, 0.28)",
                background: "rgba(255,255,255,0.04)",
                color: "var(--sentra-text-muted)",
              }}
              type="button"
            >
              Reset Council
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
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            ["Council Health", `${live?.council_health ?? 0}%`],
            ["Alignment Score", `${live?.alignment_score ?? 0}%`],
            ["Active Specialists", live?.agents?.length ?? 0],
          ].map(([label, value], index) => (
            <div
              className="rounded-[22px] border px-4 py-4"
              key={`${label}-${index}`}
              style={{
                borderColor: "var(--sentra-border-subtle)",
                background: "var(--surface-soft)",
              }}
            >
              <div
                className="text-[0.68rem] uppercase tracking-[0.16em]"
                style={{ color: "var(--sentra-text-soft)" }}
              >
                {label}
              </div>
              <div className="mt-3 text-lg font-medium text-[var(--text)]">{value}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div
            className="rounded-[24px] border p-5"
            style={{
              borderColor: "var(--sentra-border-subtle)",
              background: "var(--surface-soft)",
            }}
          >
            <h3 className="text-sm font-medium text-[var(--text)]">Specialist Agents</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {(live?.agents ?? []).map((agent, index) => {
                const cardStyles = stateStyles(agent.status);
                return (
                  <div
                    className="rounded-[20px] border p-4"
                    key={`${agent.agent_id}-${index}`}
                    style={{
                      borderColor: cardStyles.borderColor,
                      background: "var(--surface)",
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium text-[var(--text)]">{agent.name}</div>
                        <div
                          className="mt-1 text-[0.68rem] uppercase tracking-[0.16em]"
                          style={{ color: "var(--sentra-text-soft)" }}
                        >
                          {agent.domain.replaceAll("_", " ")}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span
                          className="rounded-full border px-2 py-1 text-[0.6rem] uppercase tracking-[0.16em]"
                          style={{
                            color: cardStyles.color,
                            borderColor: cardStyles.borderColor,
                            background: cardStyles.background,
                          }}
                        >
                          {agent.status}
                        </span>
                        <span className="text-xs uppercase tracking-[0.16em]" style={{ color: "var(--sentra-text-soft)" }}>
                          {agent.confidence}%
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 text-sm text-[var(--text)]">
                      {agent.top_recommendation}
                    </div>
                    <div className="mt-3 text-xs uppercase tracking-[0.16em]" style={{ color: "var(--sentra-text-soft)" }}>
                      Stance {agent.stance} {agent.priority_zone ? `· ${agent.priority_zone}` : ""}
                    </div>
                    <div className="mt-3 space-y-2">
                      {agent.reasoning_drivers.map((driver, driverIndex) => (
                        <div
                          className="rounded-[14px] border px-3 py-2 text-xs"
                          key={`${agent.agent_id}-driver-${driverIndex}`}
                          style={{
                            borderColor: "var(--sentra-border-subtle)",
                            background: "var(--surface-soft)",
                            color: "var(--sentra-text-muted)",
                          }}
                        >
                          {driver}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
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
              <h3 className="text-sm font-medium text-[var(--text)]">Joint Plan</h3>
              <div className="mt-4 space-y-3">
                {(live?.recommended_joint_plan ?? []).map((item, index) => (
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
              <h3 className="text-sm font-medium text-[var(--text)]">Shared Risks</h3>
              <div className="mt-4 space-y-3">
                {(live?.shared_risks ?? []).map((item, index) => (
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

        <div className="mt-6 rounded-[24px] border p-5" style={{ borderColor: "var(--sentra-border-subtle)", background: "var(--surface-soft)" }}>
          <div className="flex flex-wrap gap-2">
            {scenarioButtons.map((scenario, index) => (
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
          <p className="mt-4 text-sm" style={{ color: "var(--sentra-text-muted)" }}>
            {live?.command_summary ?? "Council summary will appear once specialists synchronize."}
          </p>
          {lastAction ? (
            <p className="mt-2 text-sm" style={{ color: "var(--sentra-text-muted)" }}>
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
    </section>
  );
}
