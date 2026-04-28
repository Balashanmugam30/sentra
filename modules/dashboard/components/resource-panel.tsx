"use client";

import { useResources } from "@/lib/predictions/use-resources";
import { useLiveDataStore } from "@/lib/realtime/live-data-store";

function formatTimestamp(timestamp: string | undefined) {
  if (!timestamp) {
    return "Waiting for deployment guidance";
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "Waiting for deployment guidance";
  }

  return date.toLocaleString();
}

function getLoadStyles(load: "normal" | "elevated" | "overloaded") {
  if (load === "overloaded") {
    return {
      color: "#fca5a5",
      background: "rgba(127, 29, 29, 0.28)",
      border: "rgba(248, 113, 113, 0.28)",
    };
  }

  if (load === "elevated") {
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

export function ResourcePanel() {
  const { data, loading, error } = useResources();
  const liveResources = useLiveDataStore((state) => state.resources);
  const styles = getLoadStyles(data?.global_load ?? "normal");

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
              Resource Deployment AI
            </p>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--text)]">
              Live Response Allocation
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
            {loading ? "Refreshing" : data?.global_load ?? "normal"}
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            <div
              className="rounded-[22px] border p-4"
              style={{
                borderColor: "var(--sentra-border-subtle)",
                background: "var(--surface-soft)",
              }}
            >
              <h3 className="text-sm font-medium text-[var(--text)]">Live Allocation</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {liveResources.slice(0, 6).map((resource) => (
                  <div
                    className="rounded-[18px] border px-4 py-3 text-sm"
                    key={resource.id}
                    style={{
                      borderColor: "var(--sentra-border-subtle)",
                      background: "var(--surface)",
                      color: "var(--text)",
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium">{resource.label}</span>
                      <span className="text-xs uppercase tracking-[0.16em]" style={{ color: "var(--sentra-text-soft)" }}>
                        reserve {resource.reserve}%
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-3" style={{ color: "var(--sentra-text-muted)" }}>
                      <span>{resource.deployed} deployed</span>
                      <span>{resource.available} available</span>
                      <span>{resource.fatigue}% fatigue</span>
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
              <h3 className="text-sm font-medium text-[var(--text)]">Available Units</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {data ? (
                  Object.entries(data.available_units).map(([unit, count], index) => (
                    <div
                      className="rounded-[18px] border px-4 py-3 text-sm"
                      key={`${unit}-${index}`}
                      style={{
                        borderColor: "var(--sentra-border-subtle)",
                        background: "var(--surface)",
                        color: "var(--text)",
                      }}
                    >
                      <div className="uppercase tracking-[0.16em]" style={{ color: "var(--sentra-text-soft)" }}>
                        {unit.replace("_", " ")}
                      </div>
                      <div className="mt-1 text-lg font-medium">{count}</div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                    Waiting for unit availability.
                  </p>
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
              <h3 className="text-sm font-medium text-[var(--text)]">Shortages</h3>
              <div className="mt-3 space-y-3">
                {error ? (
                  <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                    {error}
                  </p>
                ) : (data?.shortages?.length ?? 0) === 0 ? (
                  <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                    No resource shortages detected.
                  </p>
                ) : (
                  data?.shortages?.map((shortage, index) => (
                      <div
                        className="rounded-[18px] border px-4 py-3 text-sm"
                        key={`${shortage}-${index}`}
                      style={{
                        borderColor: "var(--sentra-border-subtle)",
                        background: "var(--surface)",
                        color: "var(--text)",
                      }}
                    >
                      {shortage}
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
              <h3 className="text-sm font-medium text-[var(--text)]">Top Deployments</h3>
              <div className="mt-3 space-y-3">
                {(data?.deployments ?? []).slice(0, 4).map((deployment, index) => (
                  <div
                    className="rounded-[18px] border px-4 py-3 text-sm"
                    key={`${deployment.zone}-${deployment.priority}-${deployment.eta_minutes}-${index}`}
                    style={{
                      borderColor: "var(--sentra-border-subtle)",
                      background: "var(--surface)",
                      color: "var(--text)",
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium">{deployment.zone}</span>
                      <span
                        className="uppercase tracking-[0.16em]"
                        style={{ color: "var(--sentra-text-soft)" }}
                      >
                        {deployment.priority}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-3" style={{ color: "var(--sentra-text-muted)" }}>
                      <span>F {deployment.fire_teams}</span>
                      <span>M {deployment.medical_teams}</span>
                      <span>S {deployment.security_teams}</span>
                      <span>{deployment.drone_support ? "Drone" : "No drone"}</span>
                      <span>ETA {deployment.eta_minutes}m</span>
                      <span>Contain {deployment.containment_eta_minutes}m</span>
                    </div>
                  </div>
                ))}
                {(data?.deployments?.length ?? 0) === 0 ? (
                  <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                    No active deployments recommended.
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
              <h3 className="text-sm font-medium text-[var(--text)]">Recommendations</h3>
              <div className="mt-3 space-y-3">
                {(data?.recommendations?.length ?? 0) === 0 ? (
                  <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                    No deployment recommendations yet.
                  </p>
                ) : (
                  data?.recommendations?.map((recommendation, index) => (
                      <div
                        className="rounded-[18px] border px-4 py-3 text-sm"
                        key={`${recommendation}-${index}`}
                      style={{
                        borderColor: "var(--sentra-border-subtle)",
                        background: "var(--surface)",
                        color: "var(--text)",
                      }}
                    >
                      {recommendation}
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
