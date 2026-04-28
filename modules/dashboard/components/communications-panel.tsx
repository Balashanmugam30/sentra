"use client";

import { useCommunications } from "@/lib/predictions/use-communications";

function formatTimestamp(timestamp: string | undefined) {
  if (!timestamp) {
    return "Waiting for alert orchestration";
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "Waiting for alert orchestration";
  }

  return date.toLocaleString();
}

function getThreatStyles(level: "normal" | "elevated" | "critical") {
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
    color: "var(--sentra-text-muted)",
    background: "var(--surface)",
    border: "var(--sentra-border-subtle)",
  };
}

function getAlertStyles(priority: "normal" | "elevated" | "critical") {
  if (priority === "critical") {
    return {
      borderColor: "rgba(248, 113, 113, 0.28)",
      background: "rgba(127, 29, 29, 0.18)",
      labelColor: "#fca5a5",
    };
  }

  if (priority === "elevated") {
    return {
      borderColor: "rgba(245, 158, 11, 0.24)",
      background: "rgba(120, 53, 15, 0.18)",
      labelColor: "#fcd34d",
    };
  }

  return {
    borderColor: "var(--sentra-border-subtle)",
    background: "var(--surface)",
    labelColor: "var(--sentra-text-soft)",
  };
}

export function CommunicationsPanel() {
  const { data, loading, error } = useCommunications();
  const styles = getThreatStyles(data?.threat_level ?? "normal");

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
              Communication AI
            </p>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--text)]">
              Live Alert Orchestration
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
            {loading ? "Refreshing" : data?.threat_level ?? "normal"}
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
              <h3 className="text-sm font-medium text-[var(--text)]">Occupant Alerts</h3>
              <div className="mt-3 space-y-3">
                {(data?.occupant_alerts ?? []).slice(0, 4).map((alert, index) => {
                  const alertStyles = getAlertStyles(alert.priority);

                  return (
                    <div
                      className="rounded-[18px] border px-4 py-3 text-sm"
                      key={`${alert.zone}-${alert.priority}-${alert.message}-${index}`}
                      style={{
                        borderColor: alertStyles.borderColor,
                        background: alertStyles.background,
                        color: "var(--text)",
                      }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium">{alert.zone}</span>
                        <span
                          className="uppercase tracking-[0.16em]"
                          style={{ color: alertStyles.labelColor }}
                        >
                          {alert.priority}
                        </span>
                      </div>
                      <p className="mt-2" style={{ color: "var(--sentra-text-muted)" }}>
                        {alert.message}
                      </p>
                    </div>
                  );
                })}
                {(data?.occupant_alerts?.length ?? 0) === 0 ? (
                  <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                    No occupant alerts required.
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
              <h3 className="text-sm font-medium text-[var(--text)]">Responder Instructions</h3>
              <div className="mt-3 space-y-3">
                {(data?.responder_messages ?? []).slice(0, 6).map((message, index) => (
                  <div
                    className="rounded-[18px] border px-4 py-3 text-sm"
                    key={`${message.team}-${message.zone}-${index}`}
                    style={{
                      borderColor: "var(--sentra-border-subtle)",
                      background: "var(--surface)",
                      color: "var(--text)",
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium">{message.zone}</span>
                      <span
                        className="uppercase tracking-[0.16em]"
                        style={{ color: "var(--sentra-text-soft)" }}
                      >
                        {message.team}
                      </span>
                    </div>
                    <p className="mt-2" style={{ color: "var(--sentra-text-muted)" }}>
                      {message.message}
                    </p>
                  </div>
                ))}
                {(data?.responder_messages?.length ?? 0) === 0 ? (
                  <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                    No responder instructions issued.
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
              <h3 className="text-sm font-medium text-[var(--text)]">Executive Summary</h3>
              <div className="mt-3 space-y-3">
                {(data?.executive_summary ?? []).length === 0 ? (
                  <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                    No executive summary available.
                  </p>
                ) : (
                  data?.executive_summary?.map((item, index) => (
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
                  ))
                )}
              </div>
            </div>

            <div
              className="rounded-[22px] border p-4"
              style={{
                borderColor: "var(--sentra-border-subtle)",
                background: "var(--surface-soft)",
              }}
            >
              <h3 className="text-sm font-medium text-[var(--text)]">Escalations</h3>
              <div className="mt-3 space-y-3">
                {error ? (
                  <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                    {error}
                  </p>
                ) : (data?.escalations?.length ?? 0) === 0 ? (
                  <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                    No escalation notices at this time.
                  </p>
                ) : (
                  data?.escalations?.map((item, index) => (
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
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
