"use client";

import { useCoordinator } from "@/lib/predictions/use-coordinator";

function formatTimestamp(timestamp: string | undefined) {
  if (!timestamp) {
    return "Waiting for coordinated strategy";
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "Waiting for coordinated strategy";
  }

  return date.toLocaleString();
}

function getHealthStyles(level: "normal" | "elevated" | "critical") {
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

function getModeStyles(mode: "stabilize" | "evacuation" | "lockdown" | "containment") {
  if (mode === "lockdown") {
    return {
      color: "#fca5a5",
      background: "rgba(127, 29, 29, 0.28)",
      border: "rgba(248, 113, 113, 0.28)",
    };
  }

  if (mode === "evacuation" || mode === "containment") {
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

export function CoordinatorPanel() {
  const { data, loading, error } = useCoordinator();
  const modeStyles = getModeStyles(data?.global_mode ?? "stabilize");
  const healthStyles = getHealthStyles(data?.system_health ?? "normal");

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
              Coordination AI
            </p>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--text)]">
              Unified Strategic Orchestrator
            </h2>
            <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
              Generated {formatTimestamp(data?.generated_at)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div
              className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs uppercase tracking-[0.18em]"
              style={{
                borderColor: modeStyles.border,
                background: modeStyles.background,
                color: modeStyles.color,
              }}
            >
              {loading ? "Refreshing" : data?.global_mode ?? "stabilize"}
            </div>
            <div
              className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs uppercase tracking-[0.18em]"
              style={{
                borderColor: healthStyles.border,
                background: healthStyles.background,
                color: healthStyles.color,
              }}
            >
              {data?.system_health ?? "normal"}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-4">
            <div
              className="rounded-[22px] border p-4"
              style={{
                borderColor: "var(--sentra-border-subtle)",
                background: "var(--surface-soft)",
              }}
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-sm font-medium text-[var(--text)]">Cross-Agent Score</h3>
                <span className="text-sm font-medium text-[var(--text)]">
                  {data?.cross_agent_score ?? 0}
                </span>
              </div>
              <div
                className="mt-3 h-3 w-full overflow-hidden rounded-full"
                style={{ background: "rgba(255,255,255,0.08)" }}
              >
                <div
                  className="h-full rounded-full transition-[width] duration-500"
                  style={{
                    width: `${data?.cross_agent_score ?? 0}%`,
                    background:
                      (data?.cross_agent_score ?? 0) >= 80
                        ? "linear-gradient(90deg, #22c55e, #86efac)"
                        : (data?.cross_agent_score ?? 0) >= 55
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
              <h3 className="text-sm font-medium text-[var(--text)]">Conflicts Detected</h3>
              <div className="mt-3 space-y-3">
                {(data?.conflicts_detected ?? []).map((conflict, index) => (
                  <div
                    className="rounded-[18px] border px-4 py-3 text-sm"
                    key={`${conflict.source}-${index}`}
                    style={{
                      borderColor: "var(--sentra-border-subtle)",
                      background: "var(--surface)",
                      color: "var(--text)",
                    }}
                  >
                    <div className="uppercase tracking-[0.16em]" style={{ color: "var(--sentra-text-soft)" }}>
                      {conflict.source}
                    </div>
                    <div className="mt-1">{conflict.issue}</div>
                  </div>
                ))}
                {(data?.conflicts_detected?.length ?? 0) === 0 ? (
                  <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                    No cross-agent conflicts detected.
                  </p>
                ) : null}
              </div>
            </div>

            <div
              className="rounded-[22px] border p-4"
              style={{
                borderColor: "var(--sentra-border-subtle)",
                background: "var(--surface-soft)",
              }}
            >
              <h3 className="text-sm font-medium text-[var(--text)]">Priority Stack</h3>
              <div className="mt-3 space-y-3">
                {(data?.priority_stack ?? []).map((item, index) => (
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
              className="rounded-[22px] border p-4"
              style={{
                borderColor: "var(--sentra-border-subtle)",
                background: "var(--surface-soft)",
              }}
            >
              <h3 className="text-sm font-medium text-[var(--text)]">Coordinated Actions</h3>
              <div className="mt-3 space-y-3">
                {(data?.coordinated_actions ?? []).map((item, index) => (
                  <div
                    className="rounded-[18px] border px-4 py-3 text-sm"
                    key={`${item.agent}-${index}`}
                    style={{
                      borderColor: "var(--sentra-border-subtle)",
                      background: "var(--surface)",
                      color: "var(--text)",
                    }}
                  >
                    <div className="uppercase tracking-[0.16em]" style={{ color: "var(--sentra-text-soft)" }}>
                      {item.agent}
                    </div>
                    <div className="mt-1">{item.action}</div>
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
              <h3 className="text-sm font-medium text-[var(--text)]">Next Phase Recommendation</h3>
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
                    {data?.recommended_next_phase ?? "Awaiting coordination outcome"}
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
