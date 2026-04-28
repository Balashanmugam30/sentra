"use client";

import type { UsePublicSafetyResult } from "@/lib/public-safety/use-public-safety";

type PublicSafetyPanelProps = {
  publicSafety: UsePublicSafetyResult;
  canManagePublicSafety: boolean;
};

export function PublicSafetyPanel({
  publicSafety,
  canManagePublicSafety,
}: PublicSafetyPanelProps) {
  const { busyAction, error, lastUpdated, live, loading, refresh, runScenario, status } =
    publicSafety;

  return (
    <section className="rounded-[28px] border border-white/10 bg-[rgba(5,9,18,0.78)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-200/70">
              Public Safety Command Center
            </p>
            <h2 className="text-lg font-semibold text-white">
              City traffic, transit pressure, dispatch corridors, utility resilience, and civic mobility intelligence
            </h2>
          </div>
          <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs uppercase tracking-[0.16em] text-cyan-100">
            {loading ? "Syncing civic grid" : `${status} • ${live?.city_mode ?? "campus"} mode`}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          {[
            ["Traffic Pressure", String(live?.global_pressure ?? 0)],
            ["Transit Status", `${live?.transit?.filter((line) => line.status !== "running").length ?? 0} affected`],
            ["Utility Health", live?.utilities?.power_status ?? "--"],
            ["Crowd Mobility", `${live?.mobility?.pedestrian_pressure ?? 0}`],
            ["Priority Routes", String(live?.dispatch?.length ?? 0)],
          ].map(([label, value], index) => (
            <div className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-4" key={`${label}-${index}`}>
              <div className="text-[0.68rem] uppercase tracking-[0.16em] text-cyan-200/60">{label}</div>
              <div className="mt-2 text-sm font-medium text-white">{value}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {canManagePublicSafety ? (
            <>
              <button
                className="rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-sm font-medium text-amber-100 disabled:opacity-50"
                disabled={busyAction !== null}
                onClick={() => {
                  void runScenario("traffic_jam_gate");
                }}
                type="button"
              >
                {busyAction === "scenario-traffic_jam_gate" ? "Running..." : "Run Traffic Jam"}
              </button>
              <button
                className="rounded-full border border-rose-400/20 bg-rose-400/10 px-4 py-2 text-sm font-medium text-rose-100 disabled:opacity-50"
                disabled={busyAction !== null}
                onClick={() => {
                  void runScenario("city_power_outage");
                }}
                type="button"
              >
                {busyAction === "scenario-city_power_outage" ? "Running..." : "Run Power Outage"}
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

        {live?.public_alerts?.length ? (
          <div className="flex flex-wrap gap-2">
            {live.public_alerts.map((alert, index) => (
              <span
                className="rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-xs uppercase tracking-[0.14em] text-amber-100"
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
            {status === "stale" ? "Showing last known public-safety state while reconnecting. " : ""}
            {error}
          </div>
        ) : null}
      </div>
    </section>
  );
}
