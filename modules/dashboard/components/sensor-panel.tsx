"use client";

import { usePerception } from "@/lib/perception/use-perception";
import type { DetectionIncidentType, PerceptionThreatLevel } from "@/lib/perception/types";

function formatTimestamp(timestamp: string | undefined) {
  if (!timestamp) {
    return "Waiting for sensor fusion";
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "Waiting for sensor fusion";
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

function formatIncidentType(type: DetectionIncidentType) {
  return type.replaceAll("_", " ");
}

export function SensorPanel() {
  const { live, detections, loading, error } = usePerception();
  const threatLevel = detections?.threat_level ?? "normal";
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
              Sensor Intelligence Grid
            </p>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--text)]">
              Live Multi-Sensor Threat Detection
            </h2>
            <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
              Generated {formatTimestamp(detections?.generated_at ?? live?.generated_at)}
            </p>
          </div>
          <div
            className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs uppercase tracking-[0.18em]"
            style={{
              borderColor: threatStyles.border,
              background: threatStyles.background,
              color: threatStyles.color,
            }}
          >
            {loading ? "Refreshing" : threatLevel}
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
              <h3 className="text-sm font-medium text-[var(--text)]">Top Sensor Cards</h3>
              <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {(live?.zones ?? []).map((zone, index) => (
                  <div
                    className="rounded-[18px] border px-4 py-3"
                    key={`${zone.zone}-${zone.smoke_index}-${zone.gas_ppm}-${index}`}
                    style={{
                      borderColor: "var(--sentra-border-subtle)",
                      background: "var(--surface)",
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-[var(--text)]">{zone.zone}</span>
                      <span
                        className="text-xs uppercase tracking-[0.16em]"
                        style={{ color: "var(--sentra-text-muted)" }}
                      >
                        {zone.temperature}C
                      </span>
                    </div>
                    <div
                      className="mt-3 grid grid-cols-2 gap-2 text-sm"
                      style={{ color: "var(--sentra-text-muted)" }}
                    >
                      <span>Smoke {zone.smoke_index}</span>
                      <span>Crowd {zone.crowd_density}</span>
                      <span>Gas {zone.gas_ppm}</span>
                      <span>Noise {zone.noise_level}</span>
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
              <h3 className="text-sm font-medium text-[var(--text)]">Detection Cards</h3>
              <div className="mt-3 space-y-3">
                {(detections?.detections ?? []).map((item, index) => (
                  <div
                    className="rounded-[18px] border px-4 py-3"
                    key={`${item.zone}-${item.incident_type}-${item.confidence}-${index}`}
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
                        {item.confidence}%
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-[var(--text)]">
                      {formatIncidentType(item.incident_type)}
                    </div>
                    <div
                      className="mt-2 flex flex-wrap gap-2 text-xs"
                      style={{ color: "var(--sentra-text-muted)" }}
                    >
                      {item.reasons.map((reason, index) => (
                        <span
                          className="rounded-full border px-2 py-1"
                          key={`${reason}-${index}`}
                          style={{
                            borderColor: "var(--sentra-border-subtle)",
                            background: "rgba(255,255,255,0.04)",
                          }}
                        >
                          {reason}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                {(detections?.detections?.length ?? 0) === 0 ? (
                  <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                    No active sensor anomalies detected.
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
              <h3 className="text-sm font-medium text-[var(--text)]">Recommended Actions</h3>
              <div className="mt-3 space-y-3">
                {(detections?.recommended_actions ?? []).map((action, index) => (
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
                {(detections?.recommended_actions?.length ?? 0) === 0 ? (
                  <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                    Continue standard monitoring posture.
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
              <h3 className="text-sm font-medium text-[var(--text)]">Fusion Status</h3>
              <div className="mt-3 space-y-3">
                <div
                  className="rounded-[18px] border px-4 py-3 text-sm"
                  style={{
                    borderColor: "var(--sentra-border-subtle)",
                    background: "var(--surface)",
                    color: "var(--text)",
                  }}
                >
                  {(live?.zones?.length ?? 0)} zones fused into the live sensor grid.
                </div>
                <div
                  className="rounded-[18px] border px-4 py-3 text-sm"
                  style={{
                    borderColor: "var(--sentra-border-subtle)",
                    background: "var(--surface)",
                    color: "var(--text)",
                  }}
                >
                  {error ?? "Detection engine running on deterministic 5-second refresh cadence."}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
