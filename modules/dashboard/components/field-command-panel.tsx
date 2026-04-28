"use client";

import { useField } from "@/lib/field/use-field";
import type { FieldGlobalState } from "@/lib/field/types";

function formatTimestamp(timestamp: string | undefined) {
  if (!timestamp) {
    return "Waiting for field command";
  }
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "Waiting for field command";
  }
  return date.toLocaleString();
}

function stateStyles(state: FieldGlobalState) {
  if (state === "critical") {
    return {
      color: "#fca5a5",
      background: "rgba(127, 29, 29, 0.28)",
      border: "rgba(248, 113, 113, 0.28)",
    };
  }
  if (state === "overloaded") {
    return {
      color: "#fcd34d",
      background: "rgba(120, 53, 15, 0.24)",
      border: "rgba(245, 158, 11, 0.24)",
    };
  }
  if (state === "active_response" || state === "mobilizing") {
    return {
      color: "#bfdbfe",
      background: "rgba(30, 64, 175, 0.18)",
      border: "rgba(96, 165, 250, 0.24)",
    };
  }
  return {
    color: "#bbf7d0",
    background: "rgba(20, 83, 45, 0.22)",
    border: "rgba(74, 222, 128, 0.22)",
  };
}

export function FieldCommandPanel() {
  const { live, loading, error, lastAction, createDemoDispatch, refresh } = useField();
  const styles = stateStyles(live?.global_field_state ?? "normal");

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
              Field Responder Command Center
            </p>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--text)]">
              Mobile mission control for firefighters, medics, security, and facility teams
            </h2>
            <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
              Updated {formatTimestamp(live?.generated_at)}
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
            {loading ? "Refreshing" : live?.global_field_state ?? "normal"}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-6">
          {[
            ["Online", live?.online_responders ?? 0],
            ["Offline", live?.offline_responders ?? 0],
            ["Pending", live?.tasks_pending ?? 0],
            ["Active", live?.tasks_active ?? 0],
            ["Backup Requests", live?.backup_requests_open ?? 0],
            ["Zones Covered", live?.zones_covered ?? 0],
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

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_0.92fr]">
          <div
            className="rounded-[22px] border p-4"
            style={{
              borderColor: "var(--sentra-border-subtle)",
              background: "var(--surface-soft)",
            }}
          >
            <h3 className="text-sm font-medium text-[var(--text)]">Field recommendations</h3>
            <div className="mt-3 space-y-3">
              {(live?.recommended_actions ?? []).map((action, index) => (
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
            </div>
          </div>

          <div
            className="rounded-[22px] border p-4"
            style={{
              borderColor: "var(--sentra-border-subtle)",
              background: "var(--surface-soft)",
            }}
          >
            <h3 className="text-sm font-medium text-[var(--text)]">Command actions</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                className="rounded-full border px-4 py-3 text-sm font-medium"
                onClick={() => {
                  void createDemoDispatch();
                }}
                style={{
                  borderColor: "rgba(96, 165, 250, 0.26)",
                  background: "rgba(30, 64, 175, 0.18)",
                  color: "#dbeafe",
                }}
                type="button"
              >
                Create Demo Dispatch
              </button>
              <button
                className="rounded-full border px-4 py-3 text-sm font-medium"
                onClick={() => {
                  void refresh();
                }}
                style={{
                  borderColor: "rgba(148, 163, 184, 0.24)",
                  background: "rgba(255,255,255,0.04)",
                  color: "var(--text)",
                }}
                type="button"
              >
                Refresh
              </button>
            </div>
            <div className="mt-4 text-sm" style={{ color: "var(--sentra-text-muted)" }}>
              {live?.summary}
            </div>
            {lastAction ? (
              <div className="mt-3 text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                Last action: {lastAction}
              </div>
            ) : null}
            {error ? (
              <div className="mt-2 text-sm" style={{ color: "#fca5a5" }}>
                {error}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

