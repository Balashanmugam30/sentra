"use client";

import { useCommander } from "@/lib/predictions/use-commander";

function formatTimestamp(timestamp: string | undefined) {
  if (!timestamp) {
    return "Waiting for command decisions";
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "Waiting for command decisions";
  }

  return date.toLocaleString();
}

function getModeStyles(mode: "monitor" | "response" | "evacuation" | "lockdown" | "mass-casualty") {
  if (mode === "mass-casualty" || mode === "lockdown") {
    return {
      color: "#fca5a5",
      background: "rgba(127, 29, 29, 0.28)",
      border: "rgba(248, 113, 113, 0.28)",
    };
  }

  if (mode === "evacuation" || mode === "response") {
    return {
      color: "#fcd34d",
      background: "rgba(120, 53, 15, 0.24)",
      border: "rgba(245, 158, 11, 0.24)",
    };
  }

  return {
    color: "var(--sentra-text-muted)",
    background: "var(--surface)",
    border: "var(--sentra-border-subtle)",
  };
}

export function CommanderPanel() {
  const { data, loading, error } = useCommander();
  const styles = getModeStyles(data?.incident_mode ?? "monitor");
  const severityIndex = data?.severity_index ?? 0;

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
              Incident Commander AI
            </p>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--text)]">
              Autonomous Strategic Decisions
            </h2>
            <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
              Generated {formatTimestamp(data?.generated_at)}
            </p>
          </div>
          <div
            className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs uppercase tracking-[0.18em]"
            style={{
              borderColor: styles.border,
              background: styles.background,
              color: styles.color,
            }}
          >
            {loading ? "Refreshing" : data?.incident_mode ?? "monitor"}
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
                <h3 className="text-sm font-medium text-[var(--text)]">Severity Index</h3>
                <span className="text-sm font-medium text-[var(--text)]">{severityIndex}</span>
              </div>
              <div
                className="mt-3 h-3 w-full overflow-hidden rounded-full"
                style={{ background: "rgba(255,255,255,0.08)" }}
              >
                <div
                  className="h-full rounded-full transition-[width] duration-500"
                  style={{
                    width: `${severityIndex}%`,
                    background:
                      severityIndex >= 80
                        ? "linear-gradient(90deg, #ef4444, #fca5a5)"
                        : severityIndex >= 50
                          ? "linear-gradient(90deg, #f59e0b, #fde68a)"
                          : "linear-gradient(90deg, #64748b, #cbd5e1)",
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
              <h3 className="text-sm font-medium text-[var(--text)]">Top Actions</h3>
              <div className="mt-3 space-y-3">
                {(data?.top_actions ?? []).map((action, index) => (
                  <div
                    className="flex items-start gap-3 rounded-[18px] border px-4 py-3 text-sm"
                    key={`${action.priority}-${action.title}-${index}`}
                    style={{
                      borderColor: "var(--sentra-border-subtle)",
                      background: "var(--surface)",
                      color: "var(--text)",
                    }}
                  >
                    <span
                      className="mt-0.5 inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border text-xs font-medium"
                      style={{
                        borderColor: "var(--sentra-border-subtle)",
                        color: "var(--sentra-text-soft)",
                      }}
                    >
                      {action.priority}
                    </span>
                    <span>{action.title}</span>
                  </div>
                ))}
                {(data?.top_actions?.length ?? 0) === 0 ? (
                  <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                    No command actions required yet.
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
              <h3 className="text-sm font-medium text-[var(--text)]">Resource Orders</h3>
              <div className="mt-3 space-y-3">
                {(data?.resource_orders ?? []).map((order, index) => (
                  <div
                    className="rounded-[18px] border px-4 py-3 text-sm"
                    key={`${order}-${index}`}
                    style={{
                      borderColor: "var(--sentra-border-subtle)",
                      background: "var(--surface)",
                      color: "var(--text)",
                    }}
                  >
                    {order}
                  </div>
                ))}
                {(data?.resource_orders?.length ?? 0) === 0 ? (
                  <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                    No reallocation orders at this time.
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
              <h3 className="text-sm font-medium text-[var(--text)]">Strategic Objectives</h3>
              <div className="mt-3 space-y-3">
                {(data?.strategic_objectives ?? []).map((item, index) => (
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
              <h3 className="text-sm font-medium text-[var(--text)]">Next 15 Min Plan</h3>
              <div className="mt-3 space-y-3">
                {(data?.next_15_min_plan ?? []).map((item, index) => (
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
              <h3 className="text-sm font-medium text-[var(--text)]">Executive Status</h3>
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
                    {data?.executive_status ?? "Awaiting executive posture"}
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
