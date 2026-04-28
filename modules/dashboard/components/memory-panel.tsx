"use client";

import { useMemory } from "@/lib/predictions/use-memory";

function formatTimestamp(timestamp: string | undefined) {
  if (!timestamp) {
    return "Waiting for adaptive memory";
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "Waiting for adaptive memory";
  }

  return date.toLocaleString();
}

export function MemoryPanel() {
  const { data, loading, error } = useMemory();
  const memory = data.memory;
  const learning = data.learning;

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
              Adaptive AI Memory
            </p>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--text)]">
              Continuous Learning Engine
            </h2>
            <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
              Generated {formatTimestamp(memory?.generated_at ?? learning?.generated_at)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div
              className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs uppercase tracking-[0.18em]"
              style={{
                borderColor: "var(--sentra-border-subtle)",
                background: "var(--surface)",
                color: "var(--sentra-text-muted)",
              }}
            >
              {loading ? "Refreshing" : `${memory?.total_incidents_observed ?? 0} learned`}
            </div>
            <div
              className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs uppercase tracking-[0.18em]"
              style={{
                borderColor: "rgba(74, 222, 128, 0.22)",
                background: "rgba(20, 83, 45, 0.22)",
                color: "#bbf7d0",
              }}
            >
              {learning?.confidence ?? 0}% confidence
            </div>
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
              <h3 className="text-sm font-medium text-[var(--text)]">Hotspot Zones</h3>
              <div className="mt-3 space-y-3">
                {(memory?.hotspot_zones ?? []).map((item, index) => (
                  <div
                    className="grid grid-cols-[1fr_auto] gap-3 rounded-[18px] border px-4 py-3 text-sm"
                    key={`${item.zone}-${item.score}-${index}`}
                    style={{
                      borderColor: "var(--sentra-border-subtle)",
                      background: "var(--surface)",
                      color: "var(--text)",
                    }}
                  >
                    <span className="font-medium">{item.zone}</span>
                    <span style={{ color: "var(--sentra-text-muted)" }}>{item.score}</span>
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
              <h3 className="text-sm font-medium text-[var(--text)]">Trusted Safe Zones</h3>
              <div className="mt-3 space-y-3">
                {(memory?.trusted_safe_zones ?? []).map((item, index) => (
                  <div
                    className="grid grid-cols-[1fr_auto] gap-3 rounded-[18px] border px-4 py-3 text-sm"
                    key={`${item.zone}-${item.reliability}-${index}`}
                    style={{
                      borderColor: "var(--sentra-border-subtle)",
                      background: "var(--surface)",
                      color: "var(--text)",
                    }}
                  >
                    <span className="font-medium">{item.zone}</span>
                    <span style={{ color: "var(--sentra-text-muted)" }}>
                      Rel {item.reliability}
                    </span>
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
              <h3 className="text-sm font-medium text-[var(--text)]">Adaptive Actions</h3>
              <div className="mt-3 space-y-3">
                {error ? (
                  <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                    {error}
                  </p>
                ) : (
                  (learning?.adaptive_actions ?? []).map((item, index) => (
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

          <div className="space-y-4">
            <div
              className="rounded-[22px] border p-4"
              style={{
                borderColor: "var(--sentra-border-subtle)",
                background: "var(--surface-soft)",
              }}
            >
              <h3 className="text-sm font-medium text-[var(--text)]">Best Historical Routes</h3>
              <div className="mt-3 space-y-3">
                {(memory?.historical_route_success ?? []).map((item, index) => (
                  <div
                    className="grid grid-cols-[1fr_auto] gap-3 rounded-[18px] border px-4 py-3 text-sm"
                    key={`${item.from_zone}-${item.to_zone}-${item.success_rate}-${index}`}
                    style={{
                      borderColor: "var(--sentra-border-subtle)",
                      background: "var(--surface)",
                      color: "var(--text)",
                    }}
                  >
                    <span className="font-medium">
                      {item.from_zone} to {item.to_zone}
                    </span>
                    <span style={{ color: "var(--sentra-text-muted)" }}>
                      {item.success_rate}%
                    </span>
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
              <h3 className="text-sm font-medium text-[var(--text)]">Resource Effectiveness</h3>
              <div className="mt-3 space-y-3">
                {(memory?.resource_effectiveness ?? []).map((item, index) => (
                  <div
                    className="rounded-[18px] border px-4 py-3 text-sm"
                    key={`${item.zone}-${item.best_unit}-${item.impact_score}-${index}`}
                    style={{
                      borderColor: "var(--sentra-border-subtle)",
                      background: "var(--surface)",
                      color: "var(--text)",
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium">{item.zone}</span>
                      <span style={{ color: "var(--sentra-text-muted)" }}>
                        {item.impact_score}
                      </span>
                    </div>
                    <div className="mt-1" style={{ color: "var(--sentra-text-muted)" }}>
                      Best unit: {item.best_unit}
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
              <h3 className="text-sm font-medium text-[var(--text)]">Learning Status</h3>
              <div
                className="mt-3 rounded-[18px] border px-4 py-3 text-sm"
                style={{
                  borderColor: "var(--sentra-border-subtle)",
                  background: "var(--surface)",
                  color: "var(--text)",
                }}
              >
                {memory?.learning_status ?? "active"} · based on {learning?.based_on_events ?? 0} events
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
