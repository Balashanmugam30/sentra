"use client";

import { useEvacuation } from "@/lib/predictions/use-evacuation";

function formatTimestamp(timestamp: string | undefined) {
  if (!timestamp) {
    return "Waiting for evacuation guidance";
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "Waiting for evacuation guidance";
  }

  return date.toLocaleString();
}

function getStatusStyles(status: "stable" | "caution" | "critical") {
  if (status === "critical") {
    return {
      color: "#fca5a5",
      background: "rgba(127, 29, 29, 0.28)",
      border: "rgba(248, 113, 113, 0.28)",
    };
  }

  if (status === "caution") {
    return {
      color: "#fcd34d",
      background: "rgba(120, 53, 15, 0.24)",
      border: "rgba(245, 158, 11, 0.24)",
    };
  }

  return {
    color: "var(--sentra-text-muted)",
    background: "var(--surface)",
    border: "var(--sentra-border-subtle)",
  };
}

export function EvacuationPanel() {
  const { data, loading, error } = useEvacuation();
  const styles = getStatusStyles(data?.global_status ?? "stable");

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
              Evacuation Intelligence
            </p>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--text)]">
              Safe Zone Guidance
            </h2>
            <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
              Generated {formatTimestamp(data?.generated_at)}
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
            {loading ? "Refreshing" : data?.global_status ?? "stable"}
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
              <h3 className="text-sm font-medium text-[var(--text)]">Top Safe Zones</h3>
              <div className="mt-3 space-y-3">
                {(data?.recommended_safe_zones ?? []).slice(0, 3).map((zone, index) => (
                  <div
                    className="grid grid-cols-[1fr_auto_auto] gap-3 rounded-[18px] border px-4 py-3 text-sm"
                    key={`${zone.zone}-${zone.capacity_score}-${zone.safety_score}-${index}`}
                    style={{
                      borderColor: "var(--sentra-border-subtle)",
                      background: "var(--surface)",
                      color: "var(--text)",
                    }}
                  >
                    <span className="font-medium">{zone.zone}</span>
                    <span style={{ color: "var(--sentra-text-muted)" }}>
                      Cap {zone.capacity_score}
                    </span>
                    <span style={{ color: "var(--sentra-text-muted)" }}>
                      Safe {zone.safety_score}
                    </span>
                  </div>
                ))}
                {(data?.recommended_safe_zones?.length ?? 0) === 0 ? (
                  <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                    No safe-zone recommendations yet.
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
              <h3 className="text-sm font-medium text-[var(--text)]">Best Routes</h3>
              <div className="mt-3 space-y-3">
                {(data?.routes ?? []).slice(0, 3).map((route, index) => (
                  <div
                    className="grid grid-cols-[1fr_auto_auto] gap-3 rounded-[18px] border px-4 py-3 text-sm"
                    key={`${route.from_zone}-${route.to_zone}-${route.priority}-${index}`}
                    style={{
                      borderColor: "var(--sentra-border-subtle)",
                      background: "var(--surface)",
                      color: "var(--text)",
                    }}
                  >
                    <span className="font-medium">
                      {route.from_zone} → {route.to_zone}
                    </span>
                    <span style={{ color: "var(--sentra-text-muted)" }}>
                      ETA {route.eta_minutes}m
                    </span>
                    <span className="uppercase" style={{ color: "var(--sentra-text-soft)" }}>
                      {route.priority}
                    </span>
                  </div>
                ))}
                {(data?.routes?.length ?? 0) === 0 ? (
                  <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                    No evacuation routes required.
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
              <h3 className="text-sm font-medium text-[var(--text)]">Blocked Zones</h3>
              <div className="mt-3 space-y-3">
                {(data?.blocked_zones ?? []).map((zone, index) => (
                  <div
                    className="rounded-[18px] border px-4 py-3 text-sm"
                    key={`${zone.zone}-${zone.reason}-${index}`}
                    style={{
                      borderColor: "var(--sentra-border-subtle)",
                      background: "var(--surface)",
                      color: "var(--text)",
                    }}
                  >
                    <div className="font-medium">{zone.zone}</div>
                    <div style={{ color: "var(--sentra-text-muted)" }}>{zone.reason}</div>
                  </div>
                ))}
                {(data?.blocked_zones?.length ?? 0) === 0 ? (
                  <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                    No blocked zones right now.
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
              <h3 className="text-sm font-medium text-[var(--text)]">Alerts</h3>
              <div className="mt-3 space-y-3">
                {error ? (
                  <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                    {error}
                  </p>
                ) : (data?.alerts?.length ?? 0) === 0 ? (
                  <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                    No evacuation alerts yet.
                  </p>
                ) : (
                  data?.alerts?.map((alert, index) => (
                    <div
                      className="rounded-[18px] border px-4 py-3 text-sm"
                      key={`${alert}-${index}`}
                      style={{
                        borderColor: "var(--sentra-border-subtle)",
                        background: "var(--surface)",
                        color: "var(--text)",
                      }}
                    >
                      {alert}
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
