"use client";

import { useInjector } from "@/lib/perception/use-injector";
import type { PerceptionThreatLevel } from "@/lib/perception/types";

function formatTimestamp(timestamp: string | undefined) {
  if (!timestamp) {
    return "Waiting for first scan";
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "Waiting for first scan";
  }

  return date.toLocaleString();
}

function getThreatStyles(level: PerceptionThreatLevel) {
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

export function AutoResponsePanel() {
  const { data, loading, error, refresh, runManualScan } = useInjector();
  const threatLevel = data?.threat_level ?? "normal";
  const threatStyles = getThreatStyles(threatLevel);

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
              Autonomous Response Engine
            </p>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--text)]">
              Sensor-to-Incident Auto Escalation
            </h2>
            <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
              Last scan {formatTimestamp(data?.generated_at)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div
              className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs uppercase tracking-[0.18em]"
              style={{
                borderColor: "rgba(74, 222, 128, 0.22)",
                background: "rgba(20, 83, 45, 0.22)",
                color: "#bbf7d0",
              }}
            >
              Auto mode active
            </div>
            <div
              className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs uppercase tracking-[0.18em]"
              style={{
                borderColor: threatStyles.border,
                background: threatStyles.background,
                color: threatStyles.color,
              }}
            >
              {loading ? "Scanning" : threatLevel}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-4">
            <div
              className="rounded-[22px] border p-4"
              style={{
                borderColor: "var(--sentra-border-subtle)",
                background: "var(--surface-soft)",
              }}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["Detections Found", data?.detections_found ?? 0],
                  ["Incidents Created", data?.incidents_created ?? 0],
                  ["Incidents Skipped", data?.incidents_skipped ?? 0],
                  ["Engine State", loading ? "SCANNING" : "ACTIVE"],
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
                    void runManualScan();
                  }}
                  style={{
                    borderColor: "rgba(148, 163, 184, 0.28)",
                    background: "rgba(255,255,255,0.05)",
                    color: "var(--text)",
                  }}
                  type="button"
                >
                  Run Manual Scan
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
            </div>

            <div
              className="rounded-[22px] border p-4"
              style={{
                borderColor: "var(--sentra-border-subtle)",
                background: "var(--surface-soft)",
              }}
            >
              <h3 className="text-sm font-medium text-[var(--text)]">Skipped</h3>
              <div className="mt-3 space-y-3">
                {(data?.skipped ?? []).map((item, index) => (
                  <div
                    className="rounded-[18px] border px-4 py-3 text-sm"
                    key={`${item.zone}-${item.reason}-${index}`}
                    style={{
                      borderColor: "var(--sentra-border-subtle)",
                      background: "var(--surface)",
                      color: "var(--text)",
                    }}
                  >
                    <span className="font-medium">{item.zone}</span>
                    <span style={{ color: "var(--sentra-text-muted)" }}> · {item.reason}</span>
                  </div>
                ))}
                {(data?.skipped?.length ?? 0) === 0 ? (
                  <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                    No duplicate suppressions in the latest scan.
                  </p>
                ) : null}
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
            <h3 className="text-sm font-medium text-[var(--text)]">Created Incident Feed</h3>
            <div className="mt-3 space-y-3">
              {(data?.created ?? []).map((item, index) => (
                <div
                  className="rounded-[18px] border px-4 py-3"
                  key={`${item.zone}-${item.incident_type}-${item.reason}-${index}`}
                  style={{
                    borderColor: "var(--sentra-border-subtle)",
                    background: "var(--surface)",
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-[var(--text)]">{item.zone}</span>
                    <span
                      className="text-xs uppercase tracking-[0.16em]"
                      style={{ color: "var(--sentra-text-muted)" }}
                    >
                      Severity {item.severity}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-[var(--text)]">{item.incident_type}</div>
                  <div className="mt-2 text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                    {item.reason}
                  </div>
                </div>
              ))}
              {(data?.created?.length ?? 0) === 0 ? (
                <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                  {error ?? "No new incidents were injected during the latest scan."}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
