"use client";

import type { UseGeospatialResult } from "@/lib/geospatial/use-geospatial";

type MapLayerPanelProps = {
  geo: UseGeospatialResult;
};

export function MapLayerPanel({ geo }: MapLayerPanelProps) {
  const { error, focusedZone, focusZone, layers, layerVisibility, busyAction, toggleLayer } = geo;

  return (
    <section className="rounded-[28px] border border-white/10 bg-[rgba(5,9,18,0.74)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <div className="space-y-4">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-200/70">
            Layer Controls
          </p>
          <h2 className="text-lg font-semibold text-white">
            Toggle incidents, responders, heatmap, facilities, routes, safe zones, and sensors
          </h2>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {(layers?.layers ?? []).map((layer, index) => (
            <label
              className="flex items-center justify-between rounded-[18px] border border-white/10 bg-white/5 px-4 py-3"
              key={`${layer.layer_id}-${index}`}
            >
              <div>
                <div className="text-sm font-medium text-white">{layer.label}</div>
                <div className="text-xs uppercase tracking-[0.12em] text-white/55">{layer.count} items</div>
              </div>
              <input
                checked={Boolean(layerVisibility[layer.layer_id])}
                className="h-4 w-4 accent-cyan-300"
                onChange={() => toggleLayer(layer.layer_id)}
                type="checkbox"
              />
            </label>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {["Zone 1", "Zone 2", "Zone 3", "Zone 4", "Zone 5"].map((zone, index) => (
            <button
              className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium uppercase tracking-[0.14em] text-white disabled:opacity-50"
              disabled={busyAction !== null}
              key={`${zone}-${index}`}
              onClick={() => {
                void focusZone(zone);
              }}
              type="button"
            >
              {busyAction === `focus-${zone}` ? `Focusing ${zone}...` : `Focus ${zone}`}
            </button>
          ))}
        </div>

        {focusedZone ? (
          <div className="rounded-[18px] border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-medium text-white">{focusedZone.zone}</div>
            <div className="mt-2 text-sm text-white/70">
              {focusedZone.incidents.length} incidents | {focusedZone.responders.length} responders | {focusedZone.sensors.length} sensors
            </div>
          </div>
        ) : null}

        {error ? <p className="text-sm text-rose-200">{error}</p> : null}
      </div>
    </section>
  );
}
