"use client";

import { useRoleMessages } from "@/lib/communications/use-role-messages";
import type { CommLevel, CommN8nStatus } from "@/lib/communications/types";

function formatTimestamp(timestamp: string | undefined) {
  if (!timestamp) {
    return "Waiting for role messaging";
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "Waiting for role messaging";
  }

  return date.toLocaleString();
}

function getLevelStyles(level: CommLevel) {
  if (level === "critical") {
    return {
      color: "#fca5a5",
      background: "rgba(127, 29, 29, 0.28)",
      border: "rgba(248, 113, 113, 0.28)",
    };
  }

  if (level === "high") {
    return {
      color: "#fcd34d",
      background: "rgba(120, 53, 15, 0.24)",
      border: "rgba(245, 158, 11, 0.24)",
    };
  }

  if (level === "elevated") {
    return {
      color: "#fde68a",
      background: "rgba(146, 64, 14, 0.16)",
      border: "rgba(251, 191, 36, 0.2)",
    };
  }

  return {
    color: "#bbf7d0",
    background: "rgba(20, 83, 45, 0.22)",
    border: "rgba(74, 222, 128, 0.22)",
  };
}

function getN8nStyles(status: CommN8nStatus) {
  if (status === "connected") {
    return {
      color: "#93c5fd",
      background: "rgba(30, 64, 175, 0.2)",
      border: "rgba(96, 165, 250, 0.24)",
    };
  }

  if (status === "disabled") {
    return {
      color: "#cbd5e1",
      background: "rgba(51, 65, 85, 0.2)",
      border: "rgba(148, 163, 184, 0.18)",
    };
  }

  return {
    color: "#bbf7d0",
    background: "rgba(20, 83, 45, 0.22)",
    border: "rgba(74, 222, 128, 0.22)",
  };
}

export function RoleMessagingPanel() {
  const { data, loading, error, lastTest, refresh, sendTest } = useRoleMessages();
  const levelStyles = getLevelStyles(data?.global_level ?? "normal");
  const n8nStyles = getN8nStyles(data?.n8n_status ?? "ready");

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
              Role Messaging Center
            </p>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--text)]">
              Audience-Specific Crisis Communications
            </h2>
            <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
              Generated {formatTimestamp(data?.generated_at)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div
              className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs uppercase tracking-[0.18em]"
              style={{
                borderColor: levelStyles.border,
                background: levelStyles.background,
                color: levelStyles.color,
              }}
            >
              {loading ? "Refreshing" : data?.global_level ?? "normal"}
            </div>
            <div
              className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs uppercase tracking-[0.18em]"
              style={{
                borderColor: n8nStyles.border,
                background: n8nStyles.background,
                color: n8nStyles.color,
              }}
            >
              n8n {data?.n8n_status ?? "ready"}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-4">
            <div
              className="rounded-[22px] border p-4"
              style={{
                borderColor: "var(--sentra-border-subtle)",
                background: "var(--surface-soft)",
              }}
            >
              <div className="flex flex-wrap gap-2">
                {(data?.roles_active ?? []).map((role, index) => (
                  <span
                    className="rounded-full border px-3 py-1 text-xs uppercase tracking-[0.16em]"
                    key={`${role}-${index}`}
                    style={{
                      borderColor: "var(--sentra-border-subtle)",
                      color: "var(--sentra-text-muted)",
                      background: "rgba(255,255,255,0.04)",
                    }}
                  >
                    {role}
                  </span>
                ))}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  ["Queued", data?.delivery_summary?.queued ?? 0],
                  ["Sent", data?.delivery_summary?.sent ?? 0],
                  ["Failed", data?.delivery_summary?.failed ?? 0],
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
                      className="text-[0.7rem] uppercase tracking-[0.18em]"
                      style={{ color: "var(--sentra-text-soft)" }}
                    >
                      {label}
                    </div>
                    <div className="mt-2 text-lg font-medium text-[var(--text)]">{value}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  className="rounded-full border px-4 py-2 text-sm font-medium transition-colors"
                  onClick={() => {
                    void sendTest();
                  }}
                  style={{
                    borderColor: "rgba(148, 163, 184, 0.28)",
                    background: "rgba(255,255,255,0.05)",
                    color: "var(--text)",
                  }}
                  type="button"
                >
                  Send Role Test
                </button>
                <button
                  className="rounded-full border px-4 py-2 text-sm font-medium transition-colors"
                  onClick={() => {
                    void refresh();
                  }}
                  style={{
                    borderColor: "rgba(148, 163, 184, 0.28)",
                    background: "rgba(255,255,255,0.03)",
                    color: "var(--sentra-text-muted)",
                  }}
                  type="button"
                >
                  Refresh
                </button>
              </div>

              {lastTest ? (
                <p className="mt-3 text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                  Last role test: {lastTest.status} · {lastTest.receipt_id}
                </p>
              ) : null}
            </div>

            <div
              className="rounded-[22px] border p-4"
              style={{
                borderColor: "var(--sentra-border-subtle)",
                background: "var(--surface-soft)",
              }}
            >
              <h3 className="text-sm font-medium text-[var(--text)]">Message Cards</h3>
              <div className="mt-3 space-y-3">
                {(data?.messages ?? []).map((message, index) => (
                  <div
                    className="rounded-[18px] border px-4 py-3"
                    key={`${message.role}-${message.zone}-${index}`}
                    style={{
                      borderColor: "var(--sentra-border-subtle)",
                      background: "var(--surface)",
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium text-[var(--text)]">{message.title}</div>
                        <div className="mt-1 text-xs" style={{ color: "var(--sentra-text-muted)" }}>
                          {message.role} · {message.zone}
                        </div>
                      </div>
                      <span
                        className="text-[0.65rem] uppercase tracking-[0.16em]"
                        style={{ color: "var(--sentra-text-soft)" }}
                      >
                        {message.priority}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-[var(--text)]">{message.message}</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.channels.map((channel, channelIndex) => (
                        <span
                          className="rounded-full border px-2 py-1 text-xs uppercase tracking-[0.14em]"
                          key={`${channel}-${channelIndex}`}
                          style={{
                            borderColor: "var(--sentra-border-subtle)",
                            background: "rgba(255,255,255,0.04)",
                            color: "var(--sentra-text-muted)",
                          }}
                        >
                          {channel}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div
            className="rounded-[22px] border p-4"
            style={{
              borderColor: "var(--sentra-border-subtle)",
              background: "var(--surface-soft)",
            }}
          >
            <h3 className="text-sm font-medium text-[var(--text)]">Escalation Queue</h3>
            <div className="mt-3 space-y-3">
              {(data?.next_escalations ?? []).map((item, index) => (
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
    </section>
  );
}
