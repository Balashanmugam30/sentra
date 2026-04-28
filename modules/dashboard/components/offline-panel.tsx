"use client";

import { useOffline } from "@/lib/offline/use-offline";
import type { OfflineMode } from "@/lib/offline/types";

function formatTimestamp(timestamp: string | null | undefined) {
  if (!timestamp) {
    return "Waiting for offline state";
  }
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "Waiting for offline state";
  }
  return date.toLocaleString();
}

function modeStyles(mode: OfflineMode) {
  if (mode === "offline_local") {
    return {
      color: "#fca5a5",
      background: "rgba(127, 29, 29, 0.28)",
      border: "rgba(248, 113, 113, 0.28)",
    };
  }
  if (mode === "degraded") {
    return {
      color: "#fcd34d",
      background: "rgba(120, 53, 15, 0.24)",
      border: "rgba(245, 158, 11, 0.24)",
    };
  }
  if (mode === "recovery_sync") {
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

export function OfflinePanel() {
  const {
    live,
    cache,
    loading,
    error,
    lastAction,
    activate,
    deactivate,
    refresh,
    simulateOutage,
    storeDemoEvent,
    syncNow,
  } = useOffline();
  const styles = modeStyles(live?.mode ?? "online");

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
              Offline Resilience Control Center
            </p>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--text)]">
              Local-first survival mode for WAN loss, degraded cloud, and reconnect recovery
            </h2>
            <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
              Snapshot {formatTimestamp(cache?.last_snapshot_at ?? live?.generated_at)}
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
            {loading ? "Refreshing" : live?.mode ?? "online"}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-6">
          {[
            ["Internet", live?.internet_status ?? "up"],
            ["Backend", live?.backend_status ?? "healthy"],
            ["Cache Ready", live?.cached_assets_ready ? "yes" : "no"],
            ["Queue", live?.offline_queue_count ?? 0],
            ["Pending Sync", live?.pending_sync_count ?? 0],
            ["Autonomy", `${live?.estimated_autonomy_minutes ?? 0}m`],
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
              <div className="mt-3 text-lg font-medium capitalize text-[var(--text)]">{value}</div>
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
            <h3 className="text-sm font-medium text-[var(--text)]">Recommended actions</h3>
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
            <div className="mt-4 text-sm" style={{ color: "var(--sentra-text-muted)" }}>
              {live?.summary}
            </div>
          </div>

          <div
            className="rounded-[22px] border p-4"
            style={{
              borderColor: "var(--sentra-border-subtle)",
              background: "var(--surface-soft)",
            }}
          >
            <h3 className="text-sm font-medium text-[var(--text)]">Control actions</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                className="rounded-full border px-4 py-3 text-sm font-medium"
                onClick={() => {
                  void simulateOutage("internet_loss");
                }}
                style={{
                  borderColor: "rgba(248, 113, 113, 0.24)",
                  background: "rgba(127, 29, 29, 0.16)",
                  color: "#fecaca",
                }}
                type="button"
              >
                Simulate Internet Loss
              </button>
              <button
                className="rounded-full border px-4 py-3 text-sm font-medium"
                onClick={() => {
                  void activate();
                }}
                style={{
                  borderColor: "rgba(251, 191, 36, 0.24)",
                  background: "rgba(146, 64, 14, 0.16)",
                  color: "#fde68a",
                }}
                type="button"
              >
                Activate Offline Mode
              </button>
              <button
                className="rounded-full border px-4 py-3 text-sm font-medium"
                onClick={() => {
                  void syncNow();
                }}
                style={{
                  borderColor: "rgba(96, 165, 250, 0.24)",
                  background: "rgba(30, 64, 175, 0.16)",
                  color: "#dbeafe",
                }}
                type="button"
              >
                Sync Now
              </button>
              <button
                className="rounded-full border px-4 py-3 text-sm font-medium"
                onClick={() => {
                  void deactivate();
                }}
                style={{
                  borderColor: "rgba(74, 222, 128, 0.22)",
                  background: "rgba(20, 83, 45, 0.2)",
                  color: "#bbf7d0",
                }}
                type="button"
              >
                Return Online
              </button>
              <button
                className="rounded-full border px-4 py-3 text-sm font-medium"
                onClick={() => {
                  void storeDemoEvent();
                }}
                style={{
                  borderColor: "rgba(148, 163, 184, 0.18)",
                  background: "rgba(255,255,255,0.04)",
                  color: "var(--text)",
                }}
                type="button"
              >
                Store Demo Event
              </button>
              <button
                className="rounded-full border px-4 py-3 text-sm font-medium"
                onClick={() => {
                  void refresh();
                }}
                style={{
                  borderColor: "rgba(148, 163, 184, 0.18)",
                  background: "rgba(255,255,255,0.04)",
                  color: "var(--sentra-text-muted)",
                }}
                type="button"
              >
                Refresh
              </button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                ["Maps", cache?.maps_cached ? "cached" : "missing"],
                ["Zones", cache?.zones_cached ? "cached" : "missing"],
                ["Tasks", cache?.tasks_cached ? "cached" : "missing"],
                ["Devices", cache?.devices_cached ? "cached" : "missing"],
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
                    className="text-[0.64rem] uppercase tracking-[0.16em]"
                    style={{ color: "var(--sentra-text-soft)" }}
                  >
                    {label}
                  </div>
                  <div className="mt-2 text-sm capitalize text-[var(--text)]">{value}</div>
                </div>
              ))}
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

