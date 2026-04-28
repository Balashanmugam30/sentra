"use client";

import type { UseSocResult } from "@/lib/soc/use-soc";

function threatTone(level: string) {
  if (level === "critical") {
    return "text-rose-200 border-rose-400/30 bg-rose-500/15";
  }
  if (level === "high") {
    return "text-amber-100 border-amber-400/30 bg-amber-500/15";
  }
  if (level === "medium") {
    return "text-sky-100 border-sky-400/30 bg-sky-500/15";
  }
  return "text-emerald-100 border-emerald-400/30 bg-emerald-500/15";
}

type SocPanelProps = {
  soc: UseSocResult;
};

export function SocPanel({ soc }: SocPanelProps) {
  const { busyAction, error, lastUpdated, live, loading, refresh, runScan, status, testAttack } = soc;

  return (
    <section className="rounded-[28px] border border-white/10 bg-[rgba(5,9,18,0.78)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-200/70">
              Security Operations Center
            </p>
            <h2 className="text-lg font-semibold text-white">
              Live threat posture, observability telemetry, and automated security response
            </h2>
          </div>
          <div
            className={`rounded-full border px-3 py-2 text-xs uppercase tracking-[0.16em] ${threatTone(
              live?.threat_level ?? "low",
            )}`}
          >
            {loading ? "Scanning" : `${status} • ${live?.threat_level ?? "low"} threat`}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-6">
          {[
            ["Open Incidents", String(live?.open_incidents ?? 0)],
            ["Detections Today", String(live?.detections_today ?? 0)],
            ["Health Score", String(live?.health_score ?? 0)],
            ["Requests / Min", String(live?.requests_per_minute ?? 0)],
            ["Blocked Attempts", String(live?.blocked_actions ?? 0)],
            ["Top Alerts", String(live?.top_alerts?.length ?? 0)],
          ].map(([label, value], index) => (
            <div
              className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-4"
              key={`${label}-${index}`}
            >
              <div className="text-[0.68rem] uppercase tracking-[0.16em] text-cyan-200/60">
                {label}
              </div>
              <div className="mt-2 text-sm font-medium text-white">{value}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-100 disabled:opacity-50"
            disabled={busyAction !== null}
            onClick={() => {
              void runScan();
            }}
            type="button"
          >
            {busyAction === "scan" ? "Scanning..." : "Live Scan"}
          </button>
          {!live?.summary_only ? (
            <>
              <button
                className="rounded-full border border-rose-400/20 bg-rose-400/10 px-4 py-2 text-sm font-medium text-rose-100 disabled:opacity-50"
                disabled={busyAction !== null}
                onClick={() => {
                  void testAttack("brute_force");
                }}
                type="button"
              >
                {busyAction === "test-brute_force" ? "Running..." : "Simulate Brute Force"}
              </button>
              <button
                className="rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-sm font-medium text-amber-100 disabled:opacity-50"
                disabled={busyAction !== null}
                onClick={() => {
                  void testAttack("latency_spike");
                }}
                type="button"
              >
                {busyAction === "test-latency_spike" ? "Running..." : "Simulate Latency Spike"}
              </button>
            </>
          ) : null}
          <button
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            disabled={busyAction !== null}
            onClick={() => {
              void refresh();
            }}
            type="button"
          >
            Refresh
          </button>
        </div>

        {live?.top_alerts?.length ? (
          <div className="flex flex-wrap gap-2">
            {live.top_alerts.map((alert, index) => (
              <span
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.14em] text-slate-100"
                key={`${alert}-${index}`}
              >
                {alert}
              </span>
            ))}
          </div>
        ) : null}

        {lastUpdated ? (
          <p className="text-xs uppercase tracking-[0.14em] text-white/40">
            Last good sync {new Date(lastUpdated).toLocaleTimeString()}
          </p>
        ) : null}
        {error ? (
          <div className="rounded-[20px] border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {status === "stale" ? "Showing last known SOC state while reconnecting. " : ""}
            {error}
          </div>
        ) : null}
      </div>
    </section>
  );
}
