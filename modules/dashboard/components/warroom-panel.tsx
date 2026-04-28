"use client";

import { useWarRoom } from "@/lib/simulation/use-warroom";

function formatTimestamp(timestamp: string | undefined) {
  if (!timestamp) {
    return "Waiting for war room state";
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "Waiting for war room state";
  }

  return date.toLocaleString();
}

function getStateStyles(level: "normal" | "elevated" | "critical") {
  if (level === "critical") {
    return {
      color: "#fca5a5",
      background: "rgba(127, 29, 29, 0.28)",
      border: "rgba(248, 113, 113, 0.28)",
    };
  }

  if (level === "elevated") {
    return {
      color: "#fcd34d",
      background: "rgba(120, 53, 15, 0.24)",
      border: "rgba(245, 158, 11, 0.24)",
    };
  }

  return {
    color: "#bbf7d0",
    background: "rgba(20, 83, 45, 0.22)",
    border: "rgba(74, 222, 128, 0.22)",
  };
}

export function WarRoomPanel() {
  const { data, loading, error } = useWarRoom();
  const stateStyles = getStateStyles(data?.global_state ?? "normal");

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
              AI War Room
            </p>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--text)]">
              Autonomous Multi-Agent Consensus Engine
            </h2>
            <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
              Generated {formatTimestamp(data?.generated_at)}
            </p>
          </div>
          <div
            className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs uppercase tracking-[0.18em]"
            style={{
              borderColor: stateStyles.border,
              background: stateStyles.background,
              color: stateStyles.color,
            }}
          >
            {loading ? "Refreshing" : data?.global_state ?? "normal"}
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div
              className="rounded-[22px] border p-4"
              style={{
                borderColor: "var(--sentra-border-subtle)",
                background: "var(--surface-soft)",
              }}
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-sm font-medium text-[var(--text)]">Response Score</h3>
                <span className="text-sm font-medium text-[var(--text)]">
                  {data?.response_score ?? 0}
                </span>
              </div>
              <div
                className="mt-3 h-3 w-full overflow-hidden rounded-full"
                style={{ background: "rgba(255,255,255,0.08)" }}
              >
                <div
                  className="h-full rounded-full transition-[width] duration-500"
                  style={{
                    width: `${data?.response_score ?? 0}%`,
                    background:
                      (data?.response_score ?? 0) >= 80
                        ? "linear-gradient(90deg, #22c55e, #86efac)"
                        : (data?.response_score ?? 0) >= 55
                          ? "linear-gradient(90deg, #f59e0b, #fde68a)"
                          : "linear-gradient(90deg, #ef4444, #fca5a5)",
                  }}
                />
              </div>
            </div>

            <div
              className="rounded-[22px] border p-4"
              style={{
                borderColor: "var(--sentra-border-subtle)",
                background: "var(--surface-soft)",
              }}
            >
              <h3 className="text-sm font-medium text-[var(--text)]">Agents</h3>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {(data?.agents ?? []).map((agent, index) => (
                  <div
                    className="rounded-[18px] border px-4 py-3 text-sm"
                    key={`${agent.name}-${agent.confidence}-${index}`}
                    style={{
                      borderColor: "var(--sentra-border-subtle)",
                      background: "var(--surface)",
                      color: "var(--text)",
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium">{agent.name}</span>
                      <span style={{ color: "var(--sentra-text-muted)" }}>
                        {agent.confidence}
                      </span>
                    </div>
                    <div className="mt-2" style={{ color: "var(--sentra-text-muted)" }}>
                      {agent.priority}
                    </div>
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
              <h3 className="text-sm font-medium text-[var(--text)]">Conflicts</h3>
              <div className="mt-3 space-y-3">
                {(data?.conflicts ?? []).map((item, index) => (
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
                {(data?.conflicts?.length ?? 0) === 0 ? (
                  <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                    No agent conflicts detected.
                  </p>
                ) : null}
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
              <h3 className="text-sm font-medium text-[var(--text)]">Consensus Plan</h3>
              <div className="mt-3 space-y-3">
                {(data?.consensus_plan ?? []).map((item, index) => (
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
              <h3 className="text-sm font-medium text-[var(--text)]">Commander Decision</h3>
              <div className="mt-3 space-y-3">
                {error ? (
                  <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                    {error}
                  </p>
                ) : (
                  <div
                    className="rounded-[18px] border px-4 py-3 text-sm"
                    style={{
                      borderColor: "var(--sentra-border-subtle)",
                      background: "var(--surface)",
                      color: "var(--text)",
                    }}
                  >
                    {data?.commander_decision ?? "Awaiting consensus command plan"}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
