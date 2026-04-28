"use client";

import type { UsePublicSafetyResult } from "@/lib/public-safety/use-public-safety";

type DispatchPanelProps = {
  publicSafety: UsePublicSafetyResult;
  canManagePublicSafety: boolean;
};

export function DispatchPanel({
  publicSafety,
  canManagePublicSafety,
}: DispatchPanelProps) {
  const { busyAction, prioritizeRoute, priorityRoute } = publicSafety;
  const dispatch = publicSafety.live?.dispatch ?? [];

  return (
    <section className="rounded-[28px] border border-white/10 bg-[rgba(5,9,18,0.78)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-200/70">
              Emergency Dispatch Panel
            </p>
            <h2 className="text-lg font-semibold text-white">
              Ambulance, fire, and police priority corridors with signal-preemption readiness
            </h2>
          </div>
          {canManagePublicSafety ? (
            <button
              className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-100 disabled:opacity-50"
              disabled={busyAction !== null}
              onClick={() => {
                void prioritizeRoute("ambulance", "Zone 1", "Zone 4");
              }}
              type="button"
            >
              {busyAction === "priority-ambulance" ? "Computing..." : "Prioritize Ambulance Route"}
            </button>
          ) : null}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {dispatch.map((route, index) => (
            <div className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-4" key={`${route.route_id}-${route.vehicle_type}-${index}`}>
              <div className="text-[0.68rem] uppercase tracking-[0.16em] text-cyan-200/60">{route.vehicle_type}</div>
              <div className="mt-2 text-sm font-medium text-white">
                {route.from_zone} to {route.to_zone}
              </div>
              <div className="mt-2 text-xs uppercase tracking-[0.14em] text-white/70">
                {route.status} • ETA {route.eta_minutes}m • {route.green_signal_ready ? "green signal" : "standard flow"}
              </div>
            </div>
          ))}
        </div>

        {priorityRoute ? (
          <div className="rounded-[20px] border border-emerald-400/20 bg-emerald-500/10 px-4 py-4 text-sm text-emerald-50">
            <div className="font-medium">
              {priorityRoute.vehicle_type} route: {priorityRoute.priority_route.join(" -> ")}
            </div>
            <div className="mt-2 text-xs uppercase tracking-[0.14em] text-emerald-100/80">
              ETA {priorityRoute.eta_minutes}m • {priorityRoute.green_signal_ready ? "signal priority ready" : "manual corridor prep"}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
