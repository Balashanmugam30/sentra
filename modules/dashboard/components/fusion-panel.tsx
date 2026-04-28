"use client";

import { useFusion } from "@/lib/perception/use-fusion";
import type { FusionZoneState } from "@/lib/perception/types";

function formatTimestamp(timestamp: string | undefined) {
  if (!timestamp) {
    return "Waiting for fusion state";
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "Waiting for fusion state";
  }

  return date.toLocaleString();
}

function getStateStyles(level: FusionZoneState) {
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

  if (level === "watch") {
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

export function FusionPanel() {
  const { data, loading, error } = useFusion();
  const statusStyles = getStateStyles(data?.global_status ?? "stable");
  const topZones = (data?.zones ?? []).slice(0, 5);

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
              Fusion Intelligence Core
            </p>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--text)]">
              Unified Zone Truth Engine
            </h2>
            <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
              Generated {formatTimestamp(data?.generated_at)}
            </p>
          </div>
          <div
            className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs uppercase tracking-[0.18em]"
            style={{
              borderColor: statusStyles.border,
              background: statusStyles.background,
              color: statusStyles.color,
            }}
          >
            {loading ? "Refreshing" : data?.global_status ?? "stable"}
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div
            className="rounded-[22px] border p-4"
            style={{
              borderColor: "var(--sentra-border-subtle)",
              background: "var(--surface-soft)",
            }}
          >
            <h3 className="text-sm font-medium text-[var(--text)]">Top Ranked Zones</h3>
            <div className="mt-3 space-y-3">
              {topZones.map((zone, index) => (
                <div
                  className="rounded-[18px] border px-4 py-3"
                  key={`${zone.zone}-${zone.fused_score}-${index}`}
                  style={{
                    borderColor: "var(--sentra-border-subtle)",
                    background: "var(--surface)",
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium text-[var(--text)]">{zone.zone}</div>
                      <div className="mt-1 text-xs" style={{ color: "var(--sentra-text-muted)" }}>
                        {zone.state} · confidence {zone.confidence}%
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-[var(--text)]">
                        {zone.fused_score}
                      </div>
                      <div
                        className="text-[0.65rem] uppercase tracking-[0.16em]"
                        style={{ color: "var(--sentra-text-soft)" }}
                      >
                        fused
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 grid gap-2">
                    {[
                      ["Sensor", zone.sensor_score, "#60a5fa"],
                      ["Incident", zone.incident_score, "#f87171"],
                      ["Prediction", zone.prediction_score, "#fbbf24"],
                      ["Memory", zone.memory_score, "#a78bfa"],
                    ].map(([label, value, color], metricIndex) => (
                      <div className="space-y-1" key={`${zone.zone}-${label}-${metricIndex}`}>
                        <div className="flex items-center justify-between text-xs">
                          <span style={{ color: "var(--sentra-text-muted)" }}>{label}</span>
                          <span className="text-[var(--text)]">{value}</span>
                        </div>
                        <div
                          className="h-2 overflow-hidden rounded-full"
                          style={{ background: "rgba(255,255,255,0.08)" }}
                        >
                          <div
                            className="h-full rounded-full transition-[width] duration-500"
                            style={{
                              width: `${value}%`,
                              background: color,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {zone.drivers.map((driver, driverIndex) => (
                      <span
                        className="rounded-full border px-2 py-1 text-xs"
                        key={`${zone.zone}-${driver}-${driverIndex}`}
                        style={{
                          borderColor: "var(--sentra-border-subtle)",
                          color: "var(--sentra-text-muted)",
                          background: "rgba(255,255,255,0.04)",
                        }}
                      >
                        {driver}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
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
              <h3 className="text-sm font-medium text-[var(--text)]">Recommended Focus</h3>
              <div className="mt-3 space-y-3">
                {(data?.recommended_focus ?? []).map((item, index) => (
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
                {(data?.recommended_focus?.length ?? 0) === 0 ? (
                  <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                    {error ?? "No immediate focus shifts required."}
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
              <h3 className="text-sm font-medium text-[var(--text)]">Fusion Confidence</h3>
              <div className="mt-3 space-y-3">
                {topZones.map((zone, index) => (
                  <div
                    className="rounded-[18px] border px-4 py-3"
                    key={`${zone.zone}-confidence-${zone.confidence}-${index}`}
                    style={{
                      borderColor: "var(--sentra-border-subtle)",
                      background: "var(--surface)",
                    }}
                  >
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-medium text-[var(--text)]">{zone.zone}</span>
                      <span style={{ color: "var(--sentra-text-muted)" }}>
                        {zone.confidence}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
