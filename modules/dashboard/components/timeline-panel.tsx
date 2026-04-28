"use client";

import { useState } from "react";

import { useTimeline } from "@/lib/simulation/use-timeline";

const TIMELINE_MINUTES = [0, 5, 10, 15] as const;

function formatTimestamp(timestamp: string | undefined) {
  if (!timestamp) {
    return "Waiting for forward forecast";
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "Waiting for forward forecast";
  }

  return date.toLocaleString();
}

function getModeStyles(mode: "normal" | "caution" | "evacuation" | "lockdown" | "critical") {
  if (mode === "critical" || mode === "lockdown") {
    return {
      color: "#fca5a5",
      background: "rgba(127, 29, 29, 0.28)",
      border: "rgba(248, 113, 113, 0.28)",
    };
  }

  if (mode === "evacuation" || mode === "caution") {
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

export function TimelinePanel() {
  const { data, loading, error } = useTimeline();
  const [selectedMinute, setSelectedMinute] = useState<0 | 5 | 10 | 15>(0);

  const selectedSnapshot =
    data?.snapshots?.find((snapshot) => snapshot.minute === selectedMinute) ?? null;
  const modeStyles = getModeStyles(selectedSnapshot?.global_mode ?? "normal");
  const topRiskZones = [...(selectedSnapshot?.zones ?? [])]
    .sort((left, right) => right.risk_score - left.risk_score)
    .slice(0, 3);

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
              Twin Timeline Forecast
            </p>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--text)]">
              15 Minute Forward Simulation
            </h2>
            <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
              Generated {formatTimestamp(data?.generated_at)}
            </p>
          </div>
          <div
            className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs uppercase tracking-[0.18em]"
            style={{
              borderColor: modeStyles.border,
              background: modeStyles.background,
              color: modeStyles.color,
            }}
          >
            {loading ? "Refreshing" : selectedSnapshot?.global_mode ?? "normal"}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {TIMELINE_MINUTES.map((minute, index) => {
            const active = minute === selectedMinute;

            return (
              <button
                className="rounded-full border px-4 py-2 text-xs uppercase tracking-[0.18em] transition-colors"
                key={`${minute}-${index}`}
                onClick={() => setSelectedMinute(minute)}
                style={{
                  borderColor: active ? "var(--border)" : "var(--sentra-border-subtle)",
                  background: active ? "var(--surface)" : "var(--surface-soft)",
                  color: active ? "var(--text)" : "var(--sentra-text-muted)",
                }}
                type="button"
              >
                {minute === 0 ? "Now" : `+${minute}m`}
              </button>
            );
          })}
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
              <div className="grid gap-3 sm:grid-cols-3">
                <div
                  className="rounded-[18px] border px-4 py-3 text-sm"
                  style={{
                    borderColor: "var(--sentra-border-subtle)",
                    background: "var(--surface)",
                    color: "var(--text)",
                  }}
                >
                  <div style={{ color: "var(--sentra-text-soft)" }}>Global mode</div>
                  <div className="mt-1 font-medium">
                    {selectedSnapshot?.global_mode ?? "normal"}
                  </div>
                </div>
                <div
                  className="rounded-[18px] border px-4 py-3 text-sm"
                  style={{
                    borderColor: "var(--sentra-border-subtle)",
                    background: "var(--surface)",
                    color: "var(--text)",
                  }}
                >
                  <div style={{ color: "var(--sentra-text-soft)" }}>Active responders</div>
                  <div className="mt-1 font-medium">
                    {selectedSnapshot?.active_responders ?? 0}
                  </div>
                </div>
                <div
                  className="rounded-[18px] border px-4 py-3 text-sm"
                  style={{
                    borderColor: "var(--sentra-border-subtle)",
                    background: "var(--surface)",
                    color: "var(--text)",
                  }}
                >
                  <div style={{ color: "var(--sentra-text-soft)" }}>Congestion count</div>
                  <div className="mt-1 font-medium">
                    {selectedSnapshot?.corridor_loads ?? 0}
                  </div>
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
              <h3 className="text-sm font-medium text-[var(--text)]">Top Risk Zones</h3>
              <div className="mt-3 space-y-3">
                {topRiskZones.map((zone, index) => (
                  <div
                    className="grid grid-cols-[1fr_auto_auto] gap-3 rounded-[18px] border px-4 py-3 text-sm"
                    key={`${zone.zone}-${zone.risk_score}-${index}`}
                    style={{
                      borderColor: "var(--sentra-border-subtle)",
                      background: "var(--surface)",
                      color: "var(--text)",
                    }}
                  >
                    <span className="font-medium">{zone.zone}</span>
                    <span style={{ color: "var(--sentra-text-muted)" }}>
                      Risk {zone.risk_score}
                    </span>
                    <span style={{ color: "var(--sentra-text-muted)" }}>
                      {zone.status}
                    </span>
                  </div>
                ))}
                {topRiskZones.length === 0 ? (
                  <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                    No timeline snapshot available yet.
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
              <h3 className="text-sm font-medium text-[var(--text)]">Forecast Summary</h3>
              <div className="mt-3 space-y-3">
                {error ? (
                  <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                    {error}
                  </p>
                ) : (
                  (data?.forecast_summary ?? []).map((item, index) => (
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
