"use client";

import { useAcks } from "@/lib/communications/use-acks";
import type {
  AckStatusInput,
  CommLevel,
  CommN8nStatus,
} from "@/lib/communications/types";

function formatTimestamp(timestamp: string | undefined) {
  if (!timestamp) {
    return "Waiting for acknowledgement state";
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "Waiting for acknowledgement state";
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

export function AckPanel() {
  const {
    data,
    loading,
    error,
    lastBulk,
    lastResponse,
    refresh,
    submitQuickResponse,
    bulkInject,
  } = useAcks();
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
              Live Response Feedback Center
            </p>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--text)]">
              Two-Way Crisis Status Network
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
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ["Sent", data?.totals?.alerts_sent ?? 0],
                  ["Acknowledged", data?.totals?.acknowledged ?? 0],
                  ["Help", data?.totals?.need_help ?? 0],
                  ["Trapped", data?.totals?.trapped ?? 0],
                  ["Evacuated", data?.totals?.evacuated ?? 0],
                  ["Pending", data?.totals?.pending ?? 0],
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
                    <div className="mt-2 text-lg font-medium text-[var(--text)]">
                      {value}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                {[
                  ["SAFE", "SAFE"],
                  ["NEED HELP", "NEED_HELP"],
                  ["TRAPPED", "TRAPPED"],
                  ["EVACUATED", "EVACUATED"],
                ].map(([label, value], index) => (
                  <button
                    className="rounded-full border px-4 py-2 text-sm font-medium transition-colors"
                    key={`${label}-${value}-${index}`}
                    onClick={() => {
                      void submitQuickResponse(value as AckStatusInput);
                    }}
                    style={{
                      borderColor: "rgba(148, 163, 184, 0.28)",
                      background: "rgba(255,255,255,0.05)",
                      color: "var(--text)",
                    }}
                    type="button"
                  >
                    {label}
                  </button>
                ))}
                <button
                  className="rounded-full border px-4 py-2 text-sm font-medium transition-colors"
                  onClick={() => {
                    void bulkInject();
                  }}
                  style={{
                    borderColor: "rgba(148, 163, 184, 0.28)",
                    background: "rgba(255,255,255,0.03)",
                    color: "var(--sentra-text-muted)",
                  }}
                  type="button"
                >
                  Inject Bulk Responses
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

              {lastResponse ? (
                <p className="mt-3 text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                  Last response: {lastResponse.status} - {lastResponse.ack_id}
                </p>
              ) : null}
              {lastBulk ? (
                <p className="mt-2 text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                  Last bulk test: created {lastBulk.created}
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
              <h3 className="text-sm font-medium text-[var(--text)]">
                Recent Responses
              </h3>
              <div className="mt-3 space-y-3">
                {(data?.responses ?? []).map((response, index) => (
                  <div
                    className="rounded-[18px] border px-4 py-3"
                    key={`${response.id}-${response.received_at}-${index}`}
                    style={{
                      borderColor: "var(--sentra-border-subtle)",
                      background: "var(--surface)",
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium text-[var(--text)]">
                          {response.zone} - {response.role}
                        </div>
                        <div
                          className="mt-1 text-xs"
                          style={{ color: "var(--sentra-text-muted)" }}
                        >
                          {response.status} -{" "}
                          {new Date(response.received_at).toLocaleString()}
                        </div>
                      </div>
                      <span
                        className="text-[0.65rem] uppercase tracking-[0.16em]"
                        style={{ color: "var(--sentra-text-soft)" }}
                      >
                        {response.priority}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-[var(--text)]">
                      {response.message}
                    </div>
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
              <h3 className="text-sm font-medium text-[var(--text)]">Hotspot Zones</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {(data?.hotspots ?? []).map((zone, index) => (
                  <span
                    className="rounded-full border px-3 py-1 text-xs uppercase tracking-[0.16em]"
                    key={`${zone}-${index}`}
                    style={{
                      borderColor: "var(--sentra-border-subtle)",
                      color: "var(--sentra-text-muted)",
                      background: "rgba(255,255,255,0.04)",
                    }}
                  >
                    {zone}
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
              <h3 className="text-sm font-medium text-[var(--text)]">
                Recommended Actions
              </h3>
              <div className="mt-3 space-y-3">
                {(data?.recommended_actions ?? []).map((action, index) => (
                  <div
                    className="rounded-[18px] border px-4 py-3 text-sm"
                    key={`${action}-${index}`}
                    style={{
                      borderColor: "var(--sentra-border-subtle)",
                      background: "var(--surface)",
                      color: "var(--text)",
                    }}
                  >
                    {action}
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
