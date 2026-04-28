"use client";

import { useState } from "react";

import { useScenario } from "@/lib/simulation/use-scenario";

const ZONES = ["Zone 1", "Zone 2", "Zone 3", "Zone 4", "Zone 5"] as const;
const EVENT_TYPES = ["fire", "smoke", "electrical"] as const;
const SEVERITIES = [1, 2, 3, 4] as const;

function formatTimestamp(timestamp: string | undefined) {
  if (!timestamp) {
    return "No scenario executed yet";
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "No scenario executed yet";
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

export function ScenarioPanel() {
  const { data, loading, error, simulate } = useScenario();
  const [zone, setZone] = useState<(typeof ZONES)[number]>("Zone 2");
  const [severity, setSeverity] = useState<(typeof SEVERITIES)[number]>(3);
  const [eventType, setEventType] = useState<(typeof EVENT_TYPES)[number]>("fire");
  const modeStyles = getModeStyles(data?.recommended_mode ?? "normal");

  const handleSimulate = async () => {
    await simulate({
      incident_zone: zone,
      severity,
      event_type: eventType,
    });
  };

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
              Scenario Command Lab
            </p>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--text)]">
              What-if Crisis Simulator
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
            {loading ? "Simulating" : data?.recommended_mode ?? "normal"}
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <div
            className="rounded-[22px] border p-4"
            style={{
              borderColor: "var(--sentra-border-subtle)",
              background: "var(--surface-soft)",
            }}
          >
            <h3 className="text-sm font-medium text-[var(--text)]">Scenario Inputs</h3>
            <div className="mt-4 grid gap-3">
              <label className="grid gap-2 text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                Zone
                <select
                  className="rounded-[16px] border px-4 py-3"
                  onChange={(event) => setZone(event.target.value as (typeof ZONES)[number])}
                  style={{
                    borderColor: "var(--sentra-border-subtle)",
                    background: "var(--surface)",
                    color: "var(--text)",
                  }}
                  value={zone}
                >
                  {ZONES.map((item, index) => (
                    <option key={`${item}-${index}`} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                Severity
                <select
                  className="rounded-[16px] border px-4 py-3"
                  onChange={(event) => setSeverity(Number(event.target.value) as (typeof SEVERITIES)[number])}
                  style={{
                    borderColor: "var(--sentra-border-subtle)",
                    background: "var(--surface)",
                    color: "var(--text)",
                  }}
                  value={severity}
                >
                  {SEVERITIES.map((item, index) => (
                    <option key={`${item}-${index}`} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                Event type
                <select
                  className="rounded-[16px] border px-4 py-3"
                  onChange={(event) => setEventType(event.target.value as (typeof EVENT_TYPES)[number])}
                  style={{
                    borderColor: "var(--sentra-border-subtle)",
                    background: "var(--surface)",
                    color: "var(--text)",
                  }}
                  value={eventType}
                >
                  {EVENT_TYPES.map((item, index) => (
                    <option key={`${item}-${index}`} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <button
                className="mt-2 rounded-[18px] border px-4 py-3 text-sm font-medium transition-colors"
                onClick={() => {
                  void handleSimulate();
                }}
                style={{
                  borderColor: "var(--border)",
                  background: "var(--surface)",
                  color: "var(--text)",
                }}
                type="button"
              >
                {loading ? "Running simulation" : "Simulate"}
              </button>
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
              <div className="grid gap-3 sm:grid-cols-3">
                <div
                  className="rounded-[18px] border px-4 py-3 text-sm"
                  style={{
                    borderColor: "var(--sentra-border-subtle)",
                    background: "var(--surface)",
                    color: "var(--text)",
                  }}
                >
                  <div style={{ color: "var(--sentra-text-soft)" }}>Mode</div>
                  <div className="mt-1 font-medium">
                    {data?.recommended_mode ?? "normal"}
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
                  <div style={{ color: "var(--sentra-text-soft)" }}>Severity index</div>
                  <div className="mt-1 font-medium">
                    {data?.severity_index ?? 0}
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
                  <div style={{ color: "var(--sentra-text-soft)" }}>Resource load</div>
                  <div className="mt-1 font-medium">
                    {data?.resource_load ?? "low"}
                  </div>
                </div>
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
                <h3 className="text-sm font-medium text-[var(--text)]">Impact Chain</h3>
                <div className="mt-3 space-y-3">
                  {error ? (
                    <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                      {error}
                    </p>
                  ) : (
                    (data?.impact_chain ?? []).map((item, index) => (
                      <div
                        className="rounded-[18px] border px-4 py-3 text-sm"
                        key={`${item.minute}-${item.event}-${index}`}
                        style={{
                          borderColor: "var(--sentra-border-subtle)",
                          background: "var(--surface)",
                          color: "var(--text)",
                        }}
                      >
                        <div style={{ color: "var(--sentra-text-soft)" }}>
                          +{item.minute}m
                        </div>
                        <div className="mt-1">{item.event}</div>
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
                <h3 className="text-sm font-medium text-[var(--text)]">Affected Zones</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(data?.affected_zones ?? []).map((item, index) => (
                    <span
                      className="rounded-full border px-3 py-2 text-xs uppercase tracking-[0.16em]"
                      key={`${item}-${index}`}
                      style={{
                        borderColor: "var(--sentra-border-subtle)",
                        background: "var(--surface)",
                        color: "var(--sentra-text-muted)",
                      }}
                    >
                      {item}
                    </span>
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
              <h3 className="text-sm font-medium text-[var(--text)]">Recommended Actions</h3>
              <div className="mt-3 space-y-3">
                {(data?.recommended_actions ?? []).map((item, index) => (
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
                {(data?.recommended_actions?.length ?? 0) === 0 && !error ? (
                  <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                    Run a scenario to view projected actions.
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
