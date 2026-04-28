"use client";

import { usePlatformOps } from "@/lib/platform/use-platform-ops";
import { OpsMetricTile, OpsPanelChrome, opsList, opsNumber, opsRecord, opsString } from "@/modules/dashboard/components/platform-ops-primitives";

export function PerformanceInspector() {
  const { performance } = usePlatformOps();
  const cache = opsRecord(performance?.cache);
  const slowest = opsList<Record<string, unknown>>(performance?.slowest_routes);

  return (
    <OpsPanelChrome title="Performance Inspector" eyebrow="Slow Routes + Cache + Request Pressure">
      <div className="grid gap-3 md:grid-cols-4">
        <OpsMetricTile label="Requests/min" value={opsNumber(performance?.requests_last_min, 0)} />
        <OpsMetricTile label="Cache Entries" value={opsNumber(cache.entries, 0)} />
        <OpsMetricTile label="Cache Hits" value={opsNumber(cache.hits, 0)} tone="gold" />
        <OpsMetricTile label="Singleflight Waits" value={opsNumber(cache.singleflight_waits, 0)} />
      </div>
      <div className="space-y-3">
        {slowest.slice(0, 5).map((route, index) => (
          <article key={`${opsString(route.route, "route")}-${index}`} className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h4 className="font-semibold text-white">{opsString(route.route, "Route")}</h4>
              <span className="text-sm text-cyan-100">{opsNumber(route.avg_latency_ms, 0)}ms avg</span>
            </div>
            <p className="mt-2 text-sm text-slate-300">Max {opsNumber(route.max_latency_ms, 0)}ms across {opsNumber(route.count, 0)} samples.</p>
          </article>
        ))}
      </div>
    </OpsPanelChrome>
  );
}

