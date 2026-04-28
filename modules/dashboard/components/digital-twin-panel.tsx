"use client";

import { useSimulation } from "@/lib/simulation/use-simulation";

function formatTimestamp(timestamp: string | undefined) {
  if (!timestamp) {
    return "Waiting for live twin state";
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "Waiting for live twin state";
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

function getHealthStyles(level: "healthy" | "stressed" | "critical") {
  if (level === "critical") {
    return {
      color: "#fca5a5",
      background: "rgba(127, 29, 29, 0.28)",
      border: "rgba(248, 113, 113, 0.28)",
    };
  }

  if (level === "stressed") {
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

export function DigitalTwinPanel() {
  const { data, loading, error } = useSimulation();
  const modeStyles = getModeStyles(data?.global_mode ?? "normal");
  const healthStyles = getHealthStyles(data?.system_health ?? "healthy");

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
              Digital Twin Core
            </p>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--text)]">
              Live Building State Mirror
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
              {loading ? "Refreshing" : data?.global_mode ?? "normal"}
            </div>
            <div
              className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs uppercase tracking-[0.18em]"
              style={{
                borderColor: healthStyles.border,
                background: healthStyles.background,
                color: healthStyles.color,
              }}
            >
              {data?.system_health ?? "healthy"}
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div
            className="rounded-[22px] border p-4"
            style={{
              borderColor: "var(--sentra-border-subtle)",
              background: "var(--surface-soft)",
            }}
          >
            <h3 className="text-sm font-medium text-[var(--text)]">Zones</h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {(data?.zones ?? []).map((zone, index) => (
                <div
                  className="rounded-[18px] border px-4 py-3 text-sm"
                  key={`${zone.zone}-${zone.status}-${index}`}
                  style={{
                    borderColor: "var(--sentra-border-subtle)",
                    background: "var(--surface)",
                    color: "var(--text)",
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium">{zone.zone}</span>
                    <span
                      className="uppercase tracking-[0.16em]"
                      style={{ color: "var(--sentra-text-soft)" }}
                    >
                      {zone.status}
                    </span>
                  </div>
                  <div className="mt-3 space-y-1" style={{ color: "var(--sentra-text-muted)" }}>
                    <div>Occupancy {zone.occupancy}</div>
                    <div>Risk {zone.risk_score}</div>
                    <div>Safe {zone.safe_score}</div>
                    <div>{zone.fire_threat ? "Fire threat active" : "No fire threat"}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
            <div
              className="rounded-[22px] border p-4"
              style={{
                borderColor: "var(--sentra-border-subtle)",
                background: "var(--surface-soft)",
              }}
            >
              <h3 className="text-sm font-medium text-[var(--text)]">Corridors</h3>
              <div className="mt-3 space-y-3">
                {(data?.corridors ?? []).map((corridor, index) => (
                  <div
                    className="grid grid-cols-[1fr_auto_auto] gap-3 rounded-[18px] border px-4 py-3 text-sm"
                    key={`${corridor.from_zone}-${corridor.to_zone}-${index}`}
                    style={{
                      borderColor: "var(--sentra-border-subtle)",
                      background: "var(--surface)",
                      color: "var(--text)",
                    }}
                  >
                    <span className="font-medium">
                      {corridor.from_zone} to {corridor.to_zone}
                    </span>
                    <span style={{ color: "var(--sentra-text-muted)" }}>
                      {corridor.status}
                    </span>
                    <span style={{ color: "var(--sentra-text-muted)" }}>
                      {corridor.traffic_load}%
                    </span>
                  </div>
                ))}
                {(data?.corridors?.length ?? 0) === 0 ? (
                  <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                    No corridor movement currently active.
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
              <h3 className="text-sm font-medium text-[var(--text)]">Responders</h3>
              <div className="mt-3 space-y-3">
                {error ? (
                  <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                    {error}
                  </p>
                ) : (
                  (data?.responders ?? []).map((responder, index) => (
                    <div
                      className="grid grid-cols-[auto_1fr_auto] gap-3 rounded-[18px] border px-4 py-3 text-sm"
                      key={`${responder.team}-${responder.target_zone}-${index}`}
                      style={{
                        borderColor: "var(--sentra-border-subtle)",
                        background: "var(--surface)",
                        color: "var(--text)",
                      }}
                    >
                      <span className="uppercase tracking-[0.16em]" style={{ color: "var(--sentra-text-soft)" }}>
                        {responder.team}
                      </span>
                      <span className="font-medium">{responder.target_zone}</span>
                      <span style={{ color: "var(--sentra-text-muted)" }}>
                        {responder.status} · {responder.eta_minutes}m
                      </span>
                    </div>
                  ))
                )}
                {(data?.responders?.length ?? 0) === 0 && !error ? (
                  <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                    No active responder movement right now.
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
            <h3 className="text-sm font-medium text-[var(--text)]">Summary</h3>
            <div className="mt-3 space-y-3">
              {(data?.summary ?? []).map((item, index) => (
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
      </div>
    </section>
  );
}
