"use client";

import { useMemo, useState } from "react";

import type { UseGeospatialResult } from "@/lib/geospatial/use-geospatial";

type RoutePanelProps = {
  geo: UseGeospatialResult;
};

export function RoutePanel({ geo }: RoutePanelProps) {
  const { busyAction, computeRoute, error, routePlan } = geo;
  const zones = useMemo(() => ["Zone 1", "Zone 2", "Zone 3", "Zone 4", "Zone 5"], []);
  const [fromZone, setFromZone] = useState("Zone 2");
  const [toZone, setToZone] = useState("Zone 5");
  const [mode, setMode] = useState("evacuation");

  return (
    <section className="rounded-[28px] border border-white/10 bg-[rgba(5,9,18,0.74)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <div className="space-y-4">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-200/70">
            Route Intelligence Panel
          </p>
          <h2 className="text-lg font-semibold text-white">
            Compute safest and fastest corridor plans across active crisis zones
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <label className="space-y-2 text-sm text-white/70">
            <span>From Zone</span>
            <select
              className="w-full rounded-[18px] border border-white/10 bg-white/5 px-3 py-3 text-white"
              onChange={(event) => setFromZone(event.target.value)}
              value={fromZone}
            >
              {zones.map((zone, index) => (
                <option key={`${zone}-${index}`} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm text-white/70">
            <span>To Zone</span>
            <select
              className="w-full rounded-[18px] border border-white/10 bg-white/5 px-3 py-3 text-white"
              onChange={(event) => setToZone(event.target.value)}
              value={toZone}
            >
              {zones.map((zone, index) => (
                <option key={`${zone}-${index}`} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm text-white/70">
            <span>Mode</span>
            <select
              className="w-full rounded-[18px] border border-white/10 bg-white/5 px-3 py-3 text-white"
              onChange={(event) => setMode(event.target.value)}
              value={mode}
            >
              {["evacuation", "responder", "safest", "fastest"].map((item, index) => (
                <option key={`${item}-${index}`} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end">
            <button
              className="w-full rounded-[18px] border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-medium text-cyan-100 disabled:opacity-50"
              disabled={busyAction !== null}
              onClick={() => {
                void computeRoute(fromZone, toZone, mode);
              }}
              type="button"
            >
              {busyAction === "route" ? "Computing..." : "Compute Route"}
            </button>
          </div>
        </div>

        {routePlan ? (
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-4">
              <div className="text-[0.68rem] uppercase tracking-[0.16em] text-cyan-200/60">ETA</div>
              <div className="mt-2 text-sm font-medium text-white">{routePlan.eta_minutes} min</div>
            </div>
            <div className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-4">
              <div className="text-[0.68rem] uppercase tracking-[0.16em] text-cyan-200/60">Risk Score</div>
              <div className="mt-2 text-sm font-medium text-white">{routePlan.risk_score}</div>
            </div>
            <div className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-4">
              <div className="text-[0.68rem] uppercase tracking-[0.16em] text-cyan-200/60">Blocked Segments</div>
              <div className="mt-2 text-sm font-medium text-white">{routePlan.blocked_segments.length}</div>
            </div>
            <div className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-4">
              <div className="text-[0.68rem] uppercase tracking-[0.16em] text-cyan-200/60">Alternatives</div>
              <div className="mt-2 text-sm font-medium text-white">{routePlan.alternatives.length}</div>
            </div>
          </div>
        ) : null}

        {routePlan?.alternatives?.length ? (
          <div className="grid gap-3 md:grid-cols-3">
            {routePlan.alternatives.map((alternative, index) => (
              <div
                className="rounded-[18px] border border-white/10 bg-white/5 p-4"
                key={`${alternative.mode}-${index}`}
              >
                <div className="text-sm font-medium uppercase tracking-[0.14em] text-white">
                  {alternative.mode}
                </div>
                <div className="mt-2 text-sm text-white/70">
                  {alternative.path.join(" -> ")}
                </div>
                <div className="mt-3 text-xs uppercase tracking-[0.12em] text-cyan-200/70">
                  {alternative.eta_minutes} min | risk {alternative.risk_score}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {error ? <p className="text-sm text-rose-200">{error}</p> : null}
      </div>
    </section>
  );
}
