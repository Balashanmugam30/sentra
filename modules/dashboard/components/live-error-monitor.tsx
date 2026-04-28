"use client";

import { usePlatformOps } from "@/lib/platform/use-platform-ops";
import { OpsMetricTile, OpsPanelChrome, opsList, opsNumber, opsString } from "@/modules/dashboard/components/platform-ops-primitives";

export function LiveErrorMonitor() {
  const { errors, live } = usePlatformOps();
  const failingRoutes = opsList<Record<string, unknown>>(errors?.top_failing_routes);
  const alerts = opsList<Record<string, unknown>>(live?.alerts?.alerts);

  return (
    <OpsPanelChrome title="Live Error Monitor" eyebrow="Runtime Exceptions + Auth + AI Route Errors">
      <div className="grid gap-3 md:grid-cols-4">
        <OpsMetricTile label="Failed Requests" value={opsNumber(errors?.failed_requests, 0)} tone={opsNumber(errors?.failed_requests, 0) ? "red" : "cyan"} />
        <OpsMetricTile label="Auth Failures" value={opsNumber(errors?.auth_failures, 0)} />
        <OpsMetricTile label="AI Route Errors" value={opsNumber(errors?.ai_route_errors, 0)} />
        <OpsMetricTile label="Active Alerts" value={alerts.length} tone={alerts.length > 1 ? "gold" : "cyan"} />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {failingRoutes.slice(0, 4).map((route, index) => (
          <article key={`${opsString(route.route, "route")}-${index}`} className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
            <h4 className="font-semibold text-white">{opsString(route.route, "No failing route")}</h4>
            <p className="mt-2 text-sm text-slate-300">Count {opsNumber(route.count, 0)}</p>
          </article>
        ))}
        {!failingRoutes.length ? (
          <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm text-cyan-50">
            No high-severity runtime failures in the current telemetry window.
          </div>
        ) : null}
      </div>
    </OpsPanelChrome>
  );
}

