"use client";

import type { UseGeospatialResult } from "@/lib/geospatial/use-geospatial";

type GeoCommandPanelProps = {
  geo: UseGeospatialResult;
  canManageGeo: boolean;
};

export function GeoCommandPanel({ geo, canManageGeo }: GeoCommandPanelProps) {
  const { busyAction, error, lastUpdated, live, loading, refresh, runScenario, status } = geo;
  const incidentCount = live?.incidents?.length ?? 0;
  const responderCount = live?.responders?.length ?? 0;
  const blockedRouteCount = live?.blocked_routes?.length ?? 0;
  const safeZoneCount = live?.safe_zones?.length ?? 0;
  const hotspotCount = live?.hotspots?.length ?? 0;
  const heatCellCount = live?.heat_cells?.length ?? 0;

  return (
    <section className="rounded-[28px] border border-white/10 bg-[rgba(5,9,18,0.78)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-200/70">
              Geospatial Command Center
            </p>
            <h2 className="text-lg font-semibold text-white">
              Live GIS incident intelligence, responder tracking, safe zones, and corridor awareness
            </h2>
          </div>
          <div className="rounded-full border border-emerald-400/20 bg-emerald-500/12 px-3 py-2 text-xs uppercase tracking-[0.16em] text-emerald-100">
            {loading ? "Syncing map" : `${status} • ${live?.summary_only ? "summary view" : "live geo"}`}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-6">
          {[
            ["Mapped Incidents", String(incidentCount)],
            ["Responders", String(responderCount)],
            ["Blocked Paths", String(blockedRouteCount)],
            ["Safe Zones", String(safeZoneCount)],
            ["Hotspots", String(hotspotCount)],
            ["Heat Cells", String(heatCellCount)],
          ].map(([label, value], index) => (
            <div
              className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-4"
              key={`${label}-${index}`}
            >
              <div className="text-[0.68rem] uppercase tracking-[0.16em] text-cyan-200/60">{label}</div>
              <div className="mt-2 text-sm font-medium text-white">{value}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {canManageGeo ? (
            <>
              <button
                className="rounded-full border border-rose-400/20 bg-rose-400/10 px-4 py-2 text-sm font-medium text-rose-100 disabled:opacity-50"
                disabled={busyAction !== null}
                onClick={() => {
                  void runScenario("fire_zone2");
                }}
                type="button"
              >
                {busyAction === "scenario-fire_zone2" ? "Running..." : "Run Fire Scenario"}
              </button>
              <button
                className="rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-sm font-medium text-amber-100 disabled:opacity-50"
                disabled={busyAction !== null}
                onClick={() => {
                  void runScenario("gas_zone4");
                }}
                type="button"
              >
                {busyAction === "scenario-gas_zone4" ? "Running..." : "Run Gas Scenario"}
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

        {lastUpdated ? (
          <p className="text-xs uppercase tracking-[0.14em] text-white/40">
            Last good sync {new Date(lastUpdated).toLocaleTimeString()}
          </p>
        ) : null}
        {error ? (
          <div className="rounded-[20px] border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {status === "stale" ? "Showing last known map state while reconnecting. " : ""}
            {error}
          </div>
        ) : null}
      </div>
    </section>
  );
}
