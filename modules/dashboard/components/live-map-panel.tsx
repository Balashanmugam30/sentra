"use client";

import dynamic from "next/dynamic";

import type { GeoLiveResponse, GeoRouteResponse } from "@/lib/geospatial/types";
import type { UseGeospatialResult } from "@/lib/geospatial/use-geospatial";

type MapSurfaceProps = {
  live: GeoLiveResponse | null;
  layerVisibility: Record<string, boolean>;
  routePlan: GeoRouteResponse | null;
};

function getMapCenter(live: GeoLiveResponse | null, routePlan: GeoRouteResponse | null): [number, number] {
  const firstRoutePoint = routePlan?.route_polyline?.[0];
  const firstHotspot = live?.hotspots?.[0];
  if (firstRoutePoint && typeof firstRoutePoint[0] === "number" && typeof firstRoutePoint[1] === "number") {
    return [firstRoutePoint[0], firstRoutePoint[1]];
  }
  if (firstHotspot) {
    return [firstHotspot.coordinate.lat, firstHotspot.coordinate.lng];
  }
  return [11.0168, 76.9558];
}

function GoogleMapsCommandSurface({ live, routePlan }: Omit<MapSurfaceProps, "layerVisibility">) {
  const googleMapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [lat, lng] = getMapCenter(live, routePlan);
  const markers = (live?.incidents ?? [])
    .slice(0, 8)
    .map((incident) => `&markers=color:red%7C${incident.coordinate.lat},${incident.coordinate.lng}`)
    .join("");
  const routePath = routePlan?.route_polyline?.length
    ? `&path=color:0x7dd3fcff|weight:5|${routePlan.route_polyline
        .slice(0, 24)
        .map((point) => `${point[0]},${point[1]}`)
        .join("|")}`
    : "";
  const style = [
    "style=element:geometry|color:0x05070b",
    "style=element:labels.text.stroke|color:0x05070b",
    "style=element:labels.text.fill|color:0x94a3b8",
    "style=feature:road|element:geometry|color:0x111827",
    "style=feature:water|element:geometry|color:0x020617",
    "style=feature:poi|visibility:off",
  ].join("&");
  const src = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=16&size=1200x640&scale=2&${style}${markers}${routePath}&key=${googleMapsKey ?? ""}`;

  return (
    <div className="relative h-[540px] overflow-hidden rounded-[24px] border border-white/10 bg-[#05070b]">
      <div className="absolute inset-0 bg-cover bg-center opacity-90" style={{ backgroundImage: `url("${src}")` }} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_18%,rgba(125,211,252,0.1),transparent_28%),linear-gradient(180deg,rgba(5,7,11,0.08),rgba(5,7,11,0.42))]" />
      <div className="absolute left-4 top-4 rounded-2xl border border-cyan-200/18 bg-black/42 px-4 py-3 text-sm text-cyan-50 backdrop-blur-xl">
        Google Maps dark command layer active
      </div>
      <div className="absolute inset-x-4 bottom-4 grid gap-3 md:grid-cols-3">
        {(live?.incidents ?? []).slice(0, 3).map((incident) => (
          <div className="rounded-2xl border border-white/10 bg-black/42 p-3 text-sm backdrop-blur-xl" key={incident.incident_id}>
            <p className="font-semibold text-white">{incident.zone}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/44">
              {incident.type} severity {incident.severity}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

const CrisisLeafletMap = dynamic<MapSurfaceProps>(
  async () => {
    const {
      Circle,
      CircleMarker,
      MapContainer,
      Polygon,
      Polyline,
      Popup,
      TileLayer,
    } = await import("react-leaflet");

    return function CrisisLeafletMapImpl({ live, layerVisibility, routePlan }: MapSurfaceProps) {
      const [centerLat, centerLng] = getMapCenter(live, routePlan);
      const firstHotspot = live?.hotspots?.[0];
      const secondHotspot = live?.hotspots?.[1];
      const center = [centerLat, centerLng] as [number, number];

      return (
        <MapContainer center={center} className="h-[540px] w-full rounded-[24px]" scrollWheelZoom zoom={16}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {live?.environment_overlay && firstHotspot ? (
            <Circle
              center={[
                firstHotspot.coordinate.lat + 0.00025,
                firstHotspot.coordinate.lng + (live.environment_overlay.wind_direction.includes("E") ? 0.0007 : -0.0007),
              ]}
              color="transparent"
              fillColor="#94a3b8"
              fillOpacity={Math.min(0.18, live.environment_overlay.smoke_risk / 500)}
              radius={60 + live.environment_overlay.smoke_risk * 1.5}
              stroke={false}
            />
          ) : null}

          {live?.environment_overlay && secondHotspot && live.environment_overlay.flood_risk >= 60 ? (
            <Circle
              center={[secondHotspot.coordinate.lat, secondHotspot.coordinate.lng]}
              color="#38bdf8"
              fillColor="#38bdf8"
              fillOpacity={0.12}
              radius={90 + live.environment_overlay.flood_risk * 1.2}
            />
          ) : null}

          {live?.osint_overlay?.hotspots?.map((hotspot, index) => (
            <Circle
              center={[hotspot.lat, hotspot.lng]}
              color={hotspot.severity === "critical" ? "#ef4444" : hotspot.severity === "high" ? "#f97316" : "#a78bfa"}
              fillColor={hotspot.severity === "critical" ? "#ef4444" : hotspot.severity === "high" ? "#f97316" : "#a78bfa"}
              fillOpacity={0.12}
              key={`${hotspot.hotspot_id}-${hotspot.lat}-${hotspot.lng}-${index}`}
              radius={hotspot.severity === "critical" ? 120 : hotspot.severity === "high" ? 95 : 70}
            >
              <Popup>{hotspot.label}</Popup>
            </Circle>
          ))}

          {layerVisibility.heatmap
            ? live?.heat_cells?.map((cell, index) => (
                <Circle
                  center={[cell.center.lat, cell.center.lng]}
                  color="transparent"
                  fillColor={cell.source === "incident" ? "#f97316" : cell.source === "hotspot" ? "#ef4444" : "#facc15"}
                  fillOpacity={Math.min(0.32, cell.intensity / 300)}
                  key={`${cell.cell_id}-${cell.center.lat}-${cell.center.lng}-${index}`}
                  radius={cell.radius_m}
                  stroke={false}
                />
              ))
            : null}

          {layerVisibility.safe_zones
            ? live?.safe_zones?.map((zone, index) => (
                <Circle
                  center={[zone.coordinate.lat, zone.coordinate.lng]}
                  color="#22c55e"
                  fillColor="#22c55e"
                  fillOpacity={0.18}
                  key={`${zone.safe_zone_id}-${zone.zone}-${index}`}
                  radius={80}
                >
                  <Popup>{zone.name}</Popup>
                </Circle>
              ))
            : null}

          {layerVisibility.routes
            ? (
                <>
                  {live?.public_safety_overlay?.traffic_segments?.map((segment, index) => (
                    <Polyline
                      color={
                        segment.blocked
                          ? "#ef4444"
                          : segment.congestion_score >= 75
                            ? "#f97316"
                            : segment.congestion_score >= 45
                              ? "#facc15"
                              : "#22c55e"
                      }
                      key={`${segment.segment_id}-${segment.from_zone}-${segment.to_zone}-${index}`}
                      positions={segment.polyline as [number, number][]}
                      weight={4}
                    >
                      <Popup>
                        {segment.from_zone} to {segment.to_zone} • congestion {segment.congestion_score}
                      </Popup>
                    </Polyline>
                  ))}
                  {live?.blocked_routes?.map((route, index) => (
                    <Polyline
                      color="#ef4444"
                      dashArray="10 8"
                      key={`${route.segment_id}-${route.from_zone}-${route.to_zone}-${index}`}
                      positions={route.polyline as [number, number][]}
                      weight={5}
                    >
                      <Popup>{route.from_zone} to {route.to_zone} blocked</Popup>
                    </Polyline>
                  ))}
                  {live?.public_safety_overlay?.dispatch_routes?.map((route, index) => (
                    <Polyline
                      color={route.green_signal_ready ? "#34d399" : "#38bdf8"}
                      dashArray="12 10"
                      key={`${route.route_id}-${route.vehicle_type}-${index}`}
                      positions={route.polyline as [number, number][]}
                      weight={5}
                    >
                      <Popup>{route.vehicle_type} corridor • ETA {route.eta_minutes}m</Popup>
                    </Polyline>
                  ))}
                </>
              )
            : null}

          {layerVisibility.incidents
            ? live?.incidents?.map((incident, index) => (
                <CircleMarker
                  center={[incident.coordinate.lat, incident.coordinate.lng]}
                  color={incident.severity >= 5 ? "#ef4444" : incident.severity >= 4 ? "#f97316" : "#facc15"}
                  fillColor={incident.severity >= 5 ? "#ef4444" : incident.severity >= 4 ? "#f97316" : "#facc15"}
                  fillOpacity={0.9}
                  key={`${incident.incident_id}-${incident.zone}-${incident.type}-${index}`}
                  radius={9}
                >
                  <Popup>{incident.zone} {incident.type}</Popup>
                </CircleMarker>
              ))
            : null}

          {layerVisibility.responders
            ? live?.responders?.map((responder, index) => (
                <CircleMarker
                  center={[responder.coordinate.lat, responder.coordinate.lng]}
                  color="#38bdf8"
                  fillColor="#38bdf8"
                  fillOpacity={0.95}
                  key={`${responder.responder_id}-${responder.current_zone}-${index}`}
                  radius={7}
                >
                  <Popup>{responder.call_sign} {responder.current_zone}</Popup>
                </CircleMarker>
              ))
            : null}

          {layerVisibility.sensors
            ? live?.sensors?.map((sensor, index) => (
                <CircleMarker
                  center={[sensor.coordinate.lat, sensor.coordinate.lng]}
                  color={sensor.alert_level === "critical" ? "#ef4444" : sensor.alert_level === "watch" ? "#facc15" : "#94a3b8"}
                  fillColor={sensor.alert_level === "critical" ? "#ef4444" : sensor.alert_level === "watch" ? "#facc15" : "#94a3b8"}
                  fillOpacity={0.85}
                  key={`${sensor.device_id}-${sensor.zone}-${sensor.alert_level}-${index}`}
                  radius={6}
                >
                  <Popup>{sensor.device_id}</Popup>
                </CircleMarker>
              ))
            : null}

          {layerVisibility.facilities
            ? live?.facilities?.map((asset, index) => (
                <CircleMarker
                  center={[asset.coordinate.lat, asset.coordinate.lng]}
                  color="#a78bfa"
                  fillColor="#a78bfa"
                  fillOpacity={0.75}
                  key={`${asset.asset_id}-${asset.zone}-${asset.asset_type}-${index}`}
                  radius={5}
                >
                  <Popup>{asset.name}</Popup>
                </CircleMarker>
              ))
            : null}

          {routePlan ? (
            <Polyline color="#34d399" dashArray="12 10" positions={routePlan.route_polyline as [number, number][]} weight={6} />
          ) : null}

          {live?.environment_overlay && firstHotspot ? (
            <Polyline
              color="#fb923c"
              dashArray="8 8"
              positions={[
                [firstHotspot.coordinate.lat, firstHotspot.coordinate.lng],
                [
                  firstHotspot.coordinate.lat + (live.environment_overlay.wind_direction.includes("N") ? 0.0012 : -0.0003),
                  firstHotspot.coordinate.lng + (live.environment_overlay.wind_direction.includes("E") ? 0.0012 : -0.0003),
                ],
              ]}
              weight={4}
            />
          ) : null}

          {live?.hotspots?.map((hotspot, index) => (
            <Polygon
              color="transparent"
              fillColor="#f43f5e"
              fillOpacity={layerVisibility.heatmap ? 0 : 0.08}
              key={`hotspot-ring-${hotspot.zone}-${hotspot.coordinate.lat}-${hotspot.coordinate.lng}-${index}`}
              positions={[
                [hotspot.coordinate.lat + 0.0006, hotspot.coordinate.lng - 0.0006],
                [hotspot.coordinate.lat + 0.0006, hotspot.coordinate.lng + 0.0006],
                [hotspot.coordinate.lat - 0.0006, hotspot.coordinate.lng + 0.0006],
                [hotspot.coordinate.lat - 0.0006, hotspot.coordinate.lng - 0.0006],
              ]}
            />
          ))}
        </MapContainer>
      );
    };
  },
  {
    ssr: false,
    loading: () => (
      <div className="sentra-panel-skeleton flex h-[540px] items-center justify-center rounded-[24px] border border-white/10 bg-white/5 text-sm text-white/70">
        Syncing live crisis map
      </div>
    ),
  },
);

type LiveMapPanelProps = {
  geo: UseGeospatialResult;
};

export function LiveMapPanel({ geo }: LiveMapPanelProps) {
  const { error, layerVisibility, live, routePlan } = geo;
  const googleMapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const useGoogleMaps = Boolean(googleMapsKey && googleMapsKey !== "REPLACE_ME");

  return (
    <section className="rounded-[28px] border border-white/10 bg-[rgba(5,9,18,0.78)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <div className="space-y-4">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-200/70">
            Live Crisis Map
          </p>
          <h2 className="text-lg font-semibold text-white">
            OpenStreetMap-powered live command surface with incidents, responders, sensors, and route overlays
          </h2>
        </div>
        {live?.environment_overlay ? (
          <div className="flex flex-wrap gap-2">
            {[
              `Wind ${Math.round(live.environment_overlay.wind_kph ?? 0)} kph ${live.environment_overlay.wind_direction ?? "--"}`,
              `Rain ${Math.round(live.environment_overlay.rain_mm ?? 0)} mm`,
              `AQI ${live.environment_overlay.aqi ?? "--"}`,
              `Visibility ${live.environment_overlay.visibility_km ?? "--"} km`,
            ].map((item, index) => (
              <span
                className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.14em] text-cyan-100"
                key={`${item}-${index}`}
              >
                {item}
              </span>
            ))}
          </div>
        ) : null}
        {live?.public_safety_overlay ? (
          <div className="flex flex-wrap gap-2">
            {[
              `Traffic pressure ${live.public_safety_overlay.global_pressure ?? "--"}`,
              `Evac flow ${String(live.public_safety_overlay.mobility?.evac_flow_score ?? "--")}`,
              `Power ${String(live.public_safety_overlay.utilities?.power_status ?? "--")}`,
            ].map((item, index) => (
              <span
                className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs uppercase tracking-[0.14em] text-amber-100"
                key={`${item}-${index}`}
              >
                {item}
              </span>
            ))}
          </div>
        ) : null}
        {live?.osint_overlay ? (
          <div className="flex flex-wrap gap-2">
            {[
              `OSINT ${live.osint_overlay.threat_level ?? "--"}`,
              `Reputation ${live.osint_overlay.reputation_risk ?? "--"}`,
              `External hotspots ${live.osint_overlay.hotspots?.length ?? 0}`,
            ].map((item, index) => (
              <span
                className="rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-xs uppercase tracking-[0.14em] text-violet-100"
                key={`${item}-${index}`}
              >
                {item}
              </span>
            ))}
          </div>
        ) : null}
        {useGoogleMaps ? (
          <GoogleMapsCommandSurface live={live} routePlan={routePlan} />
        ) : (
          <CrisisLeafletMap layerVisibility={layerVisibility} live={live} routePlan={routePlan} />
        )}
        {error ? (
          <p className="rounded-2xl border border-amber-200/18 bg-amber-200/8 px-4 py-3 text-sm text-amber-50/82">
            Map telemetry is reconnecting. Showing the last verified spatial snapshot where available.
          </p>
        ) : null}
      </div>
    </section>
  );
}
