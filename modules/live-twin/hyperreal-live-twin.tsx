"use client";

import type { Route } from "next";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useRef, useState } from "react";

import { useTwin } from "@/lib/twin/use-twin";
import { useLiveDataStore } from "@/lib/realtime/live-data-store";
import { useLiveDataEngine } from "@/lib/realtime/use-live-data";
import type { LiveTwinPulse } from "@/lib/engines/live-twin-intelligence";
import type {
  TwinForecast,
  TwinHazard,
  TwinLiveRoutes,
  TwinOptimizedRoute,
  TwinPrediction,
  TwinResponder,
  TwinResourcesState,
  TwinRiskMapPoint,
  TwinRoute,
  TwinZone,
} from "@/lib/twin/types";

type TwinZoneView = {
  action: string;
  camera: string;
  flow: string;
  height: number;
  id: string;
  name: string;
  occupancy: number;
  path: string;
  risk: number;
  status: "critical" | "crowd pressure" | "watch" | "safe" | "route" | "clinical" | "utility";
  width: number;
  x: number;
  y: number;
};

type ResponderView = {
  confidence: number;
  eta: number;
  id: string;
  location: string;
  mission: string;
  name: string;
  status: string;
  x: number;
  y: number;
};

type TwinLayerKey = "heatmap" | "occupancy" | "hazards" | "responders" | "risk";

const defaultZones: TwinZoneView[] = [
  {
    action: "Seal fire door, hold Stairwell B, and keep suppression team on east service path.",
    camera: "CAM-GM-KITCHEN-02",
    flow: "east service corridor",
    height: 22,
    id: "zone-kitchen-b",
    name: "Kitchen Zone B",
    occupancy: 46,
    path: "East service door -> Stairwell B -> South Gate",
    risk: 92,
    status: "critical",
    width: 24,
    x: 16,
    y: 43,
  },
  {
    action: "Split crowd flow into north and east lanes before atrium density rises.",
    camera: "CAM-NOVA-ATRIUM-01",
    flow: "north + east exits",
    height: 28,
    id: "zone-atrium",
    name: "Atrium",
    occupancy: 940,
    path: "Atrium -> North Gate -> East Parking",
    risk: 80,
    status: "crowd pressure",
    width: 28,
    x: 42,
    y: 18,
  },
  {
    action: "Protect oxygen manifold and stage clinical rapid unit outside ICU wing.",
    camera: "CAM-MC-ICU-04",
    flow: "clinical corridor",
    height: 20,
    id: "zone-icu",
    name: "ICU Wing",
    occupancy: 126,
    path: "ICU Wing -> Medical Corridor -> Safe Ward",
    risk: 69,
    status: "clinical",
    width: 22,
    x: 66,
    y: 43,
  },
  {
    action: "Keep stairwell open for phased evacuation and reserve responder access.",
    camera: "CAM-GM-STAIR-B",
    flow: "down",
    height: 31,
    id: "zone-stairwell-b",
    name: "Stairwell B",
    occupancy: 82,
    path: "Floor 3 -> Floor 1 -> South Gate",
    risk: 28,
    status: "safe",
    width: 11,
    x: 86,
    y: 35,
  },
  {
    action: "Move staff to east exit and hold escalator entry for 4 minutes.",
    camera: "CAM-NOVA-FOOD-03",
    flow: "food court split",
    height: 27,
    id: "zone-food-court",
    name: "Food Court",
    occupancy: 940,
    path: "Food Court -> East Exit -> Parking Zone",
    risk: 80,
    status: "crowd pressure",
    width: 27,
    x: 13,
    y: 16,
  },
  {
    action: "Isolate lab HVAC, route students to library tower, and stage hazmat standby.",
    camera: "CAM-BALA-LAB-C",
    flow: "west academic corridor",
    height: 22,
    id: "zone-lab-c",
    name: "Lab Block C",
    occupancy: 146,
    path: "Lab Block C -> Library Tower -> North Quad",
    risk: 74,
    status: "utility",
    width: 25,
    x: 58,
    y: 70,
  },
  {
    action: "Open gate priority lane for ambulance ingress and executive extraction.",
    camera: "CAM-NORTH-GATE",
    flow: "inbound emergency lane",
    height: 16,
    id: "zone-north-gate",
    name: "North Gate",
    occupancy: 212,
    path: "North Gate -> Medical Lane -> Command Point",
    risk: 42,
    status: "route",
    width: 20,
    x: 39,
    y: 73,
  },
  {
    action: "Reserve vehicle staging and keep west service exit as fallback.",
    camera: "CAM-PARKING-WEST",
    flow: "vehicle staging",
    height: 18,
    id: "zone-parking",
    name: "Parking Zone",
    occupancy: 318,
    path: "Parking Zone -> West Service Exit -> Command Triage",
    risk: 34,
    status: "safe",
    width: 26,
    x: 7,
    y: 72,
  },
];

const defaultResponders: ResponderView[] = [
  {
    confidence: 94,
    eta: 2,
    id: "resp-fire-alpha",
    location: "East service corridor",
    mission: "Kitchen containment",
    name: "Fire Team Alpha",
    status: "moving",
    x: 74,
    y: 61,
  },
  {
    confidence: 91,
    eta: 4,
    id: "resp-medic-2",
    location: "Medical corridor",
    mission: "Triage east corridor",
    name: "Medic Unit 2",
    status: "staged",
    x: 68,
    y: 29,
  },
  {
    confidence: 89,
    eta: 6,
    id: "resp-security-bravo",
    location: "Food court edge",
    mission: "Crowd split routing",
    name: "Security Bravo",
    status: "rerouting",
    x: 31,
    y: 31,
  },
  {
    confidence: 92,
    eta: 3,
    id: "resp-clinical-rapid",
    location: "ICU hold point",
    mission: "Oxygen continuity",
    name: "Clinical Rapid Unit",
    status: "ready",
    x: 79,
    y: 48,
  },
  {
    confidence: 96,
    eta: 1,
    id: "resp-drone-recon",
    location: "Atrium skylight",
    mission: "Thermal scan",
    name: "Drone Recon 1",
    status: "airborne",
    x: 52,
    y: 25,
  },
];

const routeFallbacks: TwinOptimizedRoute[] = [
  {
    congestion: 28,
    eta_minutes: 5,
    from: "Kitchen Zone B",
    hazard_avoidance: 93,
    name: "East Stairwell B Evacuation",
    owner: "Sentra Route AI",
    reserve_capacity: 81,
    route_id: "route-east-stair-b",
    safety: 94,
    score: 94,
    steps: ["Hold Kitchen Zone B", "Open east service lane", "Descend Stairwell B"],
    tenant_id: "TEN-GRAND-MERIDIAN",
    to: "South Gate",
    use_case: "evacuation_flows",
  },
  {
    congestion: 19,
    eta_minutes: 3,
    from: "ICU Wing",
    hazard_avoidance: 89,
    name: "Medical Corridor Priority Lane",
    owner: "Clinical Rapid Unit",
    reserve_capacity: 76,
    route_id: "route-medical-priority",
    safety: 92,
    score: 91,
    steps: ["Clear medical corridor", "Stage oxygen backup", "Route medics inward"],
    tenant_id: "TEN-BALA-HOSP",
    to: "Safe Ward",
    use_case: "ambulance_corridors",
  },
  {
    congestion: 41,
    eta_minutes: 7,
    from: "Atrium",
    hazard_avoidance: 86,
    name: "West Service Exit Fallback",
    owner: "Security Bravo",
    reserve_capacity: 72,
    route_id: "route-west-service",
    safety: 87,
    score: 88,
    steps: ["Split atrium flow", "Hold escalator entry", "Open west service exit"],
    tenant_id: "TEN-NOVA-MALL",
    to: "Parking Zone",
    use_case: "disabled_occupant_routing",
  },
  {
    congestion: 36,
    eta_minutes: 9,
    from: "Food Court",
    hazard_avoidance: 86,
    name: "Crowd Split Route",
    owner: "Sentra Crowd Brain",
    reserve_capacity: 74,
    route_id: "route-crowd-split",
    safety: 88,
    score: 91,
    steps: ["Families north", "Staff east", "Exterior assembly lane"],
    tenant_id: "TEN-NOVA-MALL",
    to: "North Gate + East Exit",
    use_case: "evacuation_flows",
  },
];

const layerLabels: Record<TwinLayerKey, string> = {
  hazards: "Hazard spread",
  heatmap: "Heatmap",
  occupancy: "Occupancy flow",
  responders: "Responder routes",
  risk: "Risk layer",
};

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(Math.round(value));
}

function zoneTone(status: TwinZoneView["status"]) {
  if (status === "critical") {
    return "border-rose-300/40 bg-rose-400/[0.16] shadow-[0_0_38px_rgba(244,63,94,0.24)]";
  }
  if (status === "crowd pressure") {
    return "border-violet-300/35 bg-violet-400/[0.13] shadow-[0_0_34px_rgba(139,92,246,0.18)]";
  }
  if (status === "clinical" || status === "utility") {
    return "border-amber-200/30 bg-amber-300/[0.11] shadow-[0_0_32px_rgba(245,158,11,0.12)]";
  }
  if (status === "safe") {
    return "border-emerald-200/28 bg-emerald-300/[0.1]";
  }
  return "border-cyan-200/26 bg-cyan-300/[0.1]";
}

function riskLabel(value: number) {
  if (value >= 85) {
    return "critical";
  }
  if (value >= 70) {
    return "high";
  }
  if (value >= 45) {
    return "watch";
  }
  return "stable";
}

function mergeZones(zones: TwinZone[], riskMap: TwinRiskMapPoint[]) {
  const used = new Set<string>();
  const merged = defaultZones.map((fallback) => {
    const source =
      zones.find((zone) => zone.name.toLowerCase() === fallback.name.toLowerCase()) ??
      zones.find((zone) => fallback.name.toLowerCase().includes(zone.name.toLowerCase()));
    const risk = riskMap.find((point) => point.zone.toLowerCase() === fallback.name.toLowerCase());

    if (source) {
      used.add(source.zone_id);
    }

    const sourceStatus = source?.status === "hazard" ? "critical" : source?.status === "crowded" ? "crowd pressure" : undefined;

    return {
      ...fallback,
      height: source?.height ?? fallback.height,
      id: source?.zone_id ?? fallback.id,
      occupancy: source?.occupancy ?? fallback.occupancy,
      risk: risk?.risk ?? source?.risk ?? fallback.risk,
      status: sourceStatus ?? fallback.status,
      width: source?.width ?? fallback.width,
      x: source?.x ?? risk?.x ?? fallback.x,
      y: source?.y ?? risk?.y ?? fallback.y,
    };
  });

  const extra = zones
    .filter((zone) => !used.has(zone.zone_id))
    .map<TwinZoneView>((zone) => ({
      action: "Hold current routing plan and keep local camera verification active.",
      camera: `CAM-${zone.zone_id}`,
      flow: zone.flow,
      height: zone.height,
      id: zone.zone_id,
      name: zone.name,
      occupancy: zone.occupancy,
      path: `${zone.name} -> ${zone.flow}`,
      risk: zone.risk,
      status: zone.status === "hazard" ? "critical" : zone.status === "crowded" ? "crowd pressure" : "route",
      width: zone.width,
      x: zone.x,
      y: zone.y,
    }));

  return [...merged, ...extra];
}

function mergeResponders(responders: TwinResponder[]) {
  const used = new Set<string>();
  const merged = defaultResponders.map((fallback) => {
    const source =
      responders.find((responder) => responder.name.toLowerCase() === fallback.name.toLowerCase()) ??
      responders.find((responder) => fallback.name.toLowerCase().includes(responder.role.toLowerCase()));

    if (source) {
      used.add(source.responder_id);
    }

    return {
      ...fallback,
      eta: source?.eta_minutes ?? fallback.eta,
      id: source?.responder_id ?? fallback.id,
      location: source?.floor_id ?? fallback.location,
      mission: source?.mission ?? fallback.mission,
      name: source?.name ?? fallback.name,
      status: source?.status ?? fallback.status,
      x: source?.x ?? fallback.x,
      y: source?.y ?? fallback.y,
    };
  });

  const extra = responders
    .filter((responder) => !used.has(responder.responder_id))
    .map<ResponderView>((responder) => ({
      confidence: 88,
      eta: responder.eta_minutes,
      id: responder.responder_id,
      location: responder.floor_id,
      mission: responder.mission,
      name: responder.name,
      status: responder.status,
      x: responder.x,
      y: responder.y,
    }));

  return [...merged, ...extra];
}

function buildHazardPredictions(forecast: TwinForecast, hazards: TwinHazard[], predictions: TwinPrediction[]) {
  const latest = forecast.horizons.at(1) ?? forecast.horizons.at(0);
  const smoke = hazards.find((hazard) => hazard.type.includes("smoke")) ?? hazards[0];
  const gasPrediction = predictions.find((prediction) => prediction.domain.includes("gas") || prediction.domain.includes("utility"));
  const crowdPrediction = predictions.find((prediction) => prediction.domain.includes("crowd"));

  return [
    {
      confidence: smoke ? 91 : forecast.confidence,
      detail: smoke?.projection_10m ?? "Smoke remains isolated if HVAC partition holds.",
      label: "Smoke Spread",
      severity: smoke?.spread_rate ?? latest?.fire_spread ?? 14,
      time: "10m",
    },
    {
      confidence: 89,
      detail: "Heat plume stays inside Kitchen Zone B while suppression boundary holds.",
      label: "Heat Spread",
      severity: latest?.fire_spread ?? 59,
      time: "15m",
    },
    {
      confidence: crowdPrediction?.confidence ?? 91,
      detail: crowdPrediction?.horizon_15 ?? "North atrium congestion crosses threshold without split routing.",
      label: "Crowd Pressure",
      severity: latest?.crowd_pressure ?? 81,
      time: "15m",
    },
    {
      confidence: gasPrediction?.confidence ?? 88,
      detail: gasPrediction?.horizon_5 ?? "Gas diffusion remains below evacuation threshold with lab HVAC isolated.",
      label: "Gas Leak Risk",
      severity: latest?.gas_spread ?? 48,
      time: "5m",
    },
    {
      confidence: 92,
      detail: "Oxygen manifold remains protected if clinical rapid unit stages at ICU hold point.",
      label: "Oxygen Failure Risk",
      severity: latest?.utility_chain ?? 55,
      time: "30m",
    },
  ];
}

function routeDeck(routes: TwinLiveRoutes) {
  const merged = [...routes.routes, ...routeFallbacks];
  const seen = new Set<string>();
  return merged.filter((route) => {
    if (seen.has(route.name)) {
      return false;
    }
    seen.add(route.name);
    return true;
  }).slice(0, 4);
}

function routePath(route: TwinRoute | undefined): [number, number][] {
  return route?.path?.length ? route.path : [[18, 55], [44, 52], [74, 48], [90, 56]];
}

export function HyperrealLiveTwin() {
  useLiveDataEngine();
  const {
    busyAction,
    campus,
    computeRoute,
    error,
    forecast,
    lastAction,
    live,
    liveRoutes,
    loading,
    predictive,
    refresh,
    resources,
  } = useTwin();
  const twinPulse = useLiveDataStore((state) => state.twin);
  const liveExecutive = useLiveDataStore((state) => state.executive);
  const [activeLayers, setActiveLayers] = useState<Record<TwinLayerKey, boolean>>({
    hazards: true,
    heatmap: true,
    occupancy: true,
    responders: true,
    risk: true,
  });
  const [selectedZone, setSelectedZone] = useState<TwinZoneView | null>(null);
  const shellRef = useRef<HTMLDivElement>(null);

  const zones = useMemo(() => mergeZones(live.zones, predictive.risk_map), [live.zones, predictive.risk_map]);
  const responders = useMemo(() => mergeResponders(live.responders), [live.responders]);
  const hazards = useMemo(
    () => buildHazardPredictions(forecast, live.hazards, predictive.predictions),
    [forecast, live.hazards, predictive.predictions],
  );
  const routes = useMemo(() => routeDeck(liveRoutes), [liveRoutes]);
  const primaryRoute = routePath(live.routes[0]);

  const topFacilityCount = live.facilities_modeled || live.facilities.length || 5;
  const highestRisk = Math.max(live.highest_risk_score, predictive.highest_risk, twinPulse.hazardExpansion, ...zones.map((zone) => zone.risk));

  function toggleLayer(layer: TwinLayerKey) {
    setActiveLayers((current) => ({ ...current, [layer]: !current[layer] }));
  }

  async function openFullscreen() {
    if (!shellRef.current || document.fullscreenElement) {
      return;
    }
    await shellRef.current.requestFullscreen();
  }

  return (
    <div
      ref={shellRef}
      className="min-h-screen overflow-hidden bg-[#05070B] text-white [--twin-border:rgba(255,255,255,0.09)] [--twin-glass:rgba(255,255,255,0.055)]"
    >
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(34,211,238,0.16),transparent_30%),radial-gradient(circle_at_84%_10%,rgba(139,92,246,0.15),transparent_32%),radial-gradient(circle_at_55%_95%,rgba(14,165,233,0.12),transparent_34%)]" />
      <div className="pointer-events-none fixed inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:52px_52px]" />

      <main className="relative mx-auto flex w-full max-w-[1800px] flex-col gap-5 px-4 py-5 md:px-6 xl:px-8">
        <motion.header
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-[2rem] border border-[var(--twin-border)] bg-[linear-gradient(135deg,rgba(255,255,255,0.09),rgba(255,255,255,0.035))] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.42)] backdrop-blur-2xl md:p-6"
          initial={{ opacity: 0, y: 14 }}
          transition={{ duration: 0.42, ease: "easeOut" }}
        >
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-4xl">
              <div className="inline-flex rounded-full border border-cyan-200/16 bg-cyan-200/[0.08] px-3 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/74">
                Live twin online
              </div>
              <h1 className="mt-4 text-4xl font-semibold tracking-[-0.055em] text-white md:text-6xl">
                Live Digital Twin Command
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-6 text-white/62 md:text-base md:leading-7">
                Hyperreal facility state, people flow, hazards, responders, routes, and predictive intelligence.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="twin-command-button is-primary" onClick={() => void refresh()} type="button">
                {loading ? "Refreshing..." : "Refresh Twin"}
              </button>
              <Link className="twin-command-button" href={"/twin/replay" as Route}>
                Replay Incident
              </Link>
              <Link className="twin-command-button" href={"/twin/predictive" as Route}>
                Predictive Mode
              </Link>
              <button className="twin-command-button" onClick={() => void openFullscreen()} type="button">
                Fullscreen
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <HeroMetric label="Facilities" value={formatNumber(topFacilityCount)} />
            <HeroMetric label="Occupancy" value={formatNumber(live.occupancy_live)} />
            <HeroMetric label="Twin Health" value={`${Math.round(live.average_twin_health)}%`} />
            <HeroMetric label="Highest Risk" value={`${Math.round(highestRisk)}%`} tone="danger" />
            <HeroMetric label="Responders Active" value={formatNumber(responders.length)} />
          </div>

          {error || lastAction ? (
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              {error ? <StatusNotice tone="warning" text={error} /> : null}
              {lastAction ? <StatusNotice tone="info" text={lastAction} /> : null}
            </div>
          ) : null}
        </motion.header>

        <ExecutiveCopilot
          campusHealth={campus.average_health}
          forecastConfidence={Math.max(forecast.confidence, liveExecutive.forecast7d[0] ?? forecast.confidence)}
          insight={predictive.next_best_action}
          prediction={Math.max(predictive.prediction_score, liveExecutive.readiness)}
          reserve={Math.max(resources.reserve_health, twinPulse.routeConfidence)}
        />

        <section className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_390px]">
          <TwinMap
            activeLayers={activeLayers}
            primaryRoute={primaryRoute}
            responders={responders}
            selectedZoneId={selectedZone?.id}
            twinPulse={twinPulse}
            zones={zones}
            onSelectZone={setSelectedZone}
          />
          <HazardPanel hazards={hazards} />
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <ResponderPanel responders={responders} resources={resources} />
          <RoutePanel busyAction={busyAction} routes={routes} onCompute={() => computeRoute("evacuation_flows")} />
        </section>

        <LayerControls activeLayers={activeLayers} onToggle={toggleLayer} />
      </main>

      <AnimatePresence>
        {selectedZone ? <ZoneDrawer key={selectedZone.id} zone={selectedZone} onClose={() => setSelectedZone(null)} /> : null}
      </AnimatePresence>

      <style jsx global>{`
        .twin-command-button {
          align-items: center;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 999px;
          color: rgba(255, 255, 255, 0.82);
          display: inline-flex;
          font-size: 0.82rem;
          font-weight: 700;
          justify-content: center;
          min-height: 42px;
          padding: 0.7rem 1rem;
          transition:
            transform 180ms ease,
            border-color 180ms ease,
            background 180ms ease;
        }

        .twin-command-button:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(125, 211, 252, 0.28);
          transform: translateY(-1px);
        }

        .twin-command-button.is-primary {
          background: linear-gradient(135deg, rgba(125, 211, 252, 0.22), rgba(139, 92, 246, 0.16));
          border-color: rgba(125, 211, 252, 0.32);
          color: white;
        }
      `}</style>
    </div>
  );
}

function HeroMetric({ label, value, tone = "default" }: { label: string; tone?: "danger" | "default"; value: string }) {
  return (
    <div className="rounded-[1.35rem] border border-white/10 bg-black/20 p-4 backdrop-blur-xl">
      <p className="text-[0.64rem] font-semibold uppercase tracking-[0.22em] text-white/40">{label}</p>
      <p className={classNames("mt-2 text-2xl font-semibold tracking-[-0.04em]", tone === "danger" ? "text-rose-100" : "text-white")}>
        {value}
      </p>
    </div>
  );
}

function StatusNotice({ text, tone }: { text: string; tone: "info" | "warning" }) {
  return (
    <div
      className={classNames(
        "rounded-2xl border px-4 py-3 text-sm",
        tone === "warning" ? "border-amber-200/20 bg-amber-300/[0.08] text-amber-100" : "border-cyan-200/20 bg-cyan-300/[0.08] text-cyan-100",
      )}
    >
      {text}
    </div>
  );
}

function ExecutiveCopilot({
  campusHealth,
  forecastConfidence,
  insight,
  prediction,
  reserve,
}: {
  campusHealth: number;
  forecastConfidence: number;
  insight: string;
  prediction: number;
  reserve: number;
}) {
  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[1.75rem] border border-cyan-100/12 bg-[linear-gradient(135deg,rgba(34,211,238,0.12),rgba(139,92,246,0.08),rgba(255,255,255,0.035))] p-5 shadow-[0_24px_70px_rgba(8,47,73,0.22)] backdrop-blur-2xl"
      initial={{ opacity: 0, y: 10 }}
      transition={{ delay: 0.08, duration: 0.38 }}
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/60">Executive copilot</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.045em] text-white">Command Summary</h2>
          <p className="mt-3 max-w-4xl text-sm leading-6 text-white/64">{insight}</p>
        </div>
        <div className="grid min-w-[min(100%,520px)] grid-cols-2 gap-3 md:grid-cols-4">
          <CopilotMetric label="Prediction" value={prediction} />
          <CopilotMetric label="Forecast" value={forecastConfidence} />
          <CopilotMetric label="Reserve Capacity" value={reserve} />
          <CopilotMetric label="Campus Safety" value={campusHealth} />
        </div>
      </div>
    </motion.section>
  );
}

function CopilotMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-3 text-center">
      <p className="text-lg font-semibold text-white">{Math.round(value)}%</p>
      <p className="mt-1 text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-white/38">{label}</p>
    </div>
  );
}

function TwinMap({
  activeLayers,
  onSelectZone,
  primaryRoute,
  responders,
  selectedZoneId,
  twinPulse,
  zones,
}: {
  activeLayers: Record<TwinLayerKey, boolean>;
  onSelectZone: (zone: TwinZoneView) => void;
  primaryRoute: [number, number][];
  responders: ResponderView[];
  selectedZoneId?: string;
  twinPulse: LiveTwinPulse;
  zones: TwinZoneView[];
}) {
  return (
    <motion.section
      animate={{ opacity: 1, scale: 1 }}
      className="relative min-h-[720px] overflow-hidden rounded-[2.25rem] border border-white/10 bg-[radial-gradient(circle_at_50%_35%,rgba(34,211,238,0.11),transparent_34%),linear-gradient(145deg,rgba(15,23,42,0.92),rgba(2,6,23,0.98))] p-4 shadow-[0_30px_110px_rgba(0,0,0,0.48)] backdrop-blur-2xl md:p-5"
      initial={{ opacity: 0, scale: 0.985 }}
      transition={{ duration: 0.42, ease: "easeOut" }}
    >
      <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(125,211,252,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,0.08)_1px,transparent_1px)] [background-size:42px_42px]" />
      <motion.div
        animate={{ y: ["-8%", "108%"] }}
        className="pointer-events-none absolute left-0 right-0 top-0 h-20 bg-gradient-to-b from-cyan-200/10 to-transparent"
        transition={{ duration: 8, ease: "linear", repeat: Infinity }}
      />
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/62">Central hyperreal twin</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.045em] text-white md:text-3xl">Facility command canvas</h2>
          <p className="mt-2 max-w-2xl text-sm text-white/52">
            Blueprint-grade spatial state with live risk, occupancy, responders, and AI route overlays.
          </p>
        </div>
        <div className="rounded-full border border-emerald-200/16 bg-emerald-300/[0.08] px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-emerald-100/80">
          telemetry locked
        </div>
      </div>

      <div className="relative mt-5 h-[600px] overflow-hidden rounded-[1.75rem] border border-white/10 bg-black/25">
        <motion.div
          animate={{ scale: [1, 1.012, 1], x: [0, -3, 0], y: [0, 2, 0] }}
          className="absolute inset-0"
          transition={{ duration: 14, ease: "easeInOut", repeat: Infinity }}
        >
          {activeLayers.heatmap ? (
            <>
              <div className="absolute left-[8%] top-[12%] h-44 w-56 rounded-full bg-violet-500/12 blur-3xl" style={{ opacity: twinPulse.crowdFlow / 100 }} />
              <div className="absolute left-[12%] top-[42%] h-48 w-52 rounded-full bg-rose-500/16 blur-3xl" style={{ opacity: twinPulse.smokeSpread / 100 }} />
              <div className="absolute right-[8%] top-[38%] h-52 w-56 rounded-full bg-cyan-400/12 blur-3xl" style={{ opacity: twinPulse.routeConfidence / 100 }} />
            </>
          ) : null}

          {activeLayers.hazards ? (
            <>
              <motion.div
                animate={{ opacity: [0.22, 0.42, 0.22], scale: [0.94, 1.08, 0.94] }}
                className="absolute left-[15%] top-[43%] h-40 w-40 rounded-full border border-rose-200/24 bg-rose-500/10"
                style={{ opacity: twinPulse.hazardExpansion / 140 }}
                transition={{ duration: 3.8, repeat: Infinity }}
              />
              <motion.div
                animate={{ opacity: [0.16, 0.34, 0.16], scale: [0.92, 1.14, 0.92] }}
                className="absolute left-[39%] top-[17%] h-52 w-52 rounded-full border border-violet-200/20 bg-violet-500/10"
                transition={{ duration: 5.2, repeat: Infinity }}
              />
            </>
          ) : null}

          {activeLayers.responders ? <RouteThread points={primaryRoute} /> : null}

          {zones.map((zone, index) => (
            <button
              className={classNames(
                "absolute rounded-[1.15rem] border p-3 text-left backdrop-blur-xl transition duration-200 hover:z-20 hover:-translate-y-1 hover:border-cyan-100/50 focus:outline-none focus:ring-2 focus:ring-cyan-200/50",
                zoneTone(zone.status),
                selectedZoneId === zone.id && "z-30 border-cyan-100/70 shadow-[0_0_44px_rgba(125,211,252,0.26)]",
              )}
              key={zone.id}
              onClick={() => onSelectZone(zone)}
              style={{
                height: `${zone.height}%`,
                left: `${zone.x}%`,
                top: `${zone.y}%`,
                width: `${zone.width}%`,
              }}
              type="button"
            >
              {activeLayers.risk ? (
                <span
                  className="absolute -right-2 -top-2 rounded-full border border-white/10 bg-black/60 px-2 py-1 text-[0.58rem] font-semibold text-white/82"
                  title={`${zone.name} risk ${zone.risk}`}
                >
                  {zone.risk}
                </span>
              ) : null}
              <motion.span
                animate={zone.risk >= 80 ? { opacity: [0.55, 1, 0.55] } : undefined}
                className="block text-sm font-semibold tracking-[-0.02em] text-white"
                transition={{ delay: index * 0.12, duration: 1.7, repeat: Infinity }}
              >
                {zone.name}
              </motion.span>
              <span className="mt-1 block text-[0.72rem] text-white/58">{formatNumber(zone.occupancy)} people</span>
              <span className="mt-2 inline-flex rounded-full border border-white/10 bg-black/24 px-2 py-1 text-[0.56rem] font-semibold uppercase tracking-[0.16em] text-white/56">
                {riskLabel(zone.risk)}
              </span>
              {activeLayers.occupancy ? <OccupancyPulse risk={zone.risk} /> : null}
            </button>
          ))}

          {activeLayers.responders
            ? responders.map((responder, index) => (
                <motion.div
                  animate={{ x: [0, index % 2 ? -7 : 8, 0], y: [0, index % 2 ? 5 : -6, 0] }}
                  className="absolute z-40"
                  key={responder.id}
                  style={{ left: `${responder.x}%`, top: `${responder.y}%` }}
                  transition={{ duration: 4 + index * 0.35, ease: "easeInOut", repeat: Infinity }}
                >
                  <div className="relative">
                    <span className="absolute -left-3 -top-3 h-8 w-8 animate-ping rounded-full bg-emerald-300/18" />
                    <span className="relative flex h-4 w-4 rounded-full border border-white/70 bg-emerald-300 shadow-[0_0_24px_rgba(110,231,183,0.62)]" />
                    <span className="absolute left-5 top-[-0.45rem] whitespace-nowrap rounded-full border border-white/10 bg-black/60 px-2 py-1 text-[0.62rem] font-semibold text-white/80 backdrop-blur">
                      {responder.name}
                    </span>
                  </div>
                </motion.div>
              ))
            : null}
        </motion.div>
      </div>
    </motion.section>
  );
}

function OccupancyPulse({ risk }: { risk: number }) {
  return (
    <motion.span
      animate={{ opacity: [0.1, 0.28, 0.1], scale: [0.85, 1.08, 0.85] }}
      className={classNames(
        "pointer-events-none absolute inset-1 rounded-[1rem]",
        risk >= 80 ? "bg-rose-200/18" : risk >= 65 ? "bg-violet-200/14" : "bg-cyan-200/10",
      )}
      transition={{ duration: 3, repeat: Infinity }}
    />
  );
}

function RouteThread({ points }: { points: [number, number][] }) {
  return (
    <svg className="pointer-events-none absolute inset-0 z-30 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
      <defs>
        <linearGradient id="routeGlow" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#7DD3FC" stopOpacity="0.2" />
          <stop offset="55%" stopColor="#A78BFA" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.5" />
        </linearGradient>
      </defs>
      <motion.polyline
        animate={{ pathLength: [0.35, 1, 0.35], opacity: [0.4, 0.95, 0.4] }}
        fill="none"
        points={points.map(([x, y]) => `${x},${y}`).join(" ")}
        stroke="url(#routeGlow)"
        strokeDasharray="2 2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="0.65"
        transition={{ duration: 5.5, repeat: Infinity }}
      />
    </svg>
  );
}

function HazardPanel({ hazards }: { hazards: ReturnType<typeof buildHazardPredictions> }) {
  return (
    <motion.aside
      animate={{ opacity: 1, x: 0 }}
      className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.34)] backdrop-blur-2xl"
      initial={{ opacity: 0, x: 14 }}
      transition={{ duration: 0.4 }}
    >
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/60">Hazard propagation engine</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.045em] text-white">Live AI Predictions</h2>
      <div className="mt-5 space-y-4">
        {hazards.map((hazard) => (
          <article className="rounded-[1.4rem] border border-white/10 bg-black/20 p-4" key={hazard.label}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">{hazard.label}</h3>
                <p className="mt-1 text-xs text-white/44">{hazard.time} horizon</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-semibold text-white">{Math.round(hazard.severity)}%</p>
                <p className="text-[0.6rem] uppercase tracking-[0.16em] text-white/36">{hazard.confidence}% confidence</p>
              </div>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.07]">
              <motion.div
                animate={{ width: `${Math.min(100, Math.max(0, hazard.severity))}%` }}
                className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-violet-300 to-rose-300"
                initial={{ width: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <p className="mt-3 text-xs leading-5 text-white/54">{hazard.detail}</p>
          </article>
        ))}
      </div>
    </motion.aside>
  );
}

function ResponderPanel({ responders, resources }: { responders: ResponderView[]; resources: TwinResourcesState }) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.052] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.3)] backdrop-blur-2xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/60">Responder movement twin</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.045em] text-white">Live Units</h2>
        </div>
        <p className="rounded-full border border-emerald-200/16 bg-emerald-300/[0.08] px-3 py-1 text-xs font-semibold text-emerald-100">
          Reserve {Math.round(resources.reserve_health)}%
        </p>
      </div>
      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {responders.slice(0, 5).map((responder) => (
          <article className="rounded-[1.4rem] border border-white/10 bg-black/20 p-4" key={responder.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">{responder.name}</h3>
                <p className="mt-1 text-xs text-white/44">{responder.location}</p>
              </div>
              <span className="rounded-full border border-cyan-200/16 bg-cyan-300/[0.08] px-2 py-1 text-xs font-semibold text-cyan-100">
                ETA {responder.eta}m
              </span>
            </div>
            <p className="mt-3 text-sm text-white/64">{responder.mission}</p>
            <div className="mt-3 flex items-center justify-between text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-white/38">
              <span>{responder.status}</span>
              <span>{responder.confidence}% route confidence</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function RoutePanel({
  busyAction,
  onCompute,
  routes,
}: {
  busyAction: string | null;
  onCompute: () => void;
  routes: TwinOptimizedRoute[];
}) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.052] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.3)] backdrop-blur-2xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/60">Route AI engine</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.045em] text-white">Optimized Routes</h2>
        </div>
        <button className="twin-command-button is-primary" onClick={onCompute} type="button">
          {busyAction === "compute-route" ? "Computing..." : "Compute Route Split"}
        </button>
      </div>
      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {routes.map((route, index) => (
          <article className="overflow-hidden rounded-[1.4rem] border border-white/10 bg-black/20 p-4" key={route.route_id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">{route.name}</h3>
                <p className="mt-1 text-xs text-white/44">
                  {route.from} {"->"} {route.to}
                </p>
              </div>
              <span className="text-2xl font-semibold text-cyan-100">{route.score}</span>
            </div>
            <div className="mt-4 h-12 rounded-2xl border border-cyan-200/10 bg-cyan-200/[0.04] p-2">
              <motion.div
                animate={{ x: ["0%", "80%", "0%"] }}
                className="h-full w-10 rounded-full bg-gradient-to-r from-cyan-200/50 to-violet-200/50 shadow-[0_0_24px_rgba(125,211,252,0.28)]"
                transition={{ delay: index * 0.25, duration: 4.2, repeat: Infinity }}
              />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <SmallStat label="ETA" value={`${route.eta_minutes}m`} />
              <SmallStat label="Safety" value={`${route.safety}%`} />
              <SmallStat label="Reserve" value={`${route.reserve_capacity}%`} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function SmallStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.035] p-2">
      <p className="text-[0.56rem] font-semibold uppercase tracking-[0.16em] text-white/34">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function LayerControls({
  activeLayers,
  onToggle,
}: {
  activeLayers: Record<TwinLayerKey, boolean>;
  onToggle: (layer: TwinLayerKey) => void;
}) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-4 backdrop-blur-2xl">
      <div className="flex flex-wrap items-center gap-2">
        {(Object.keys(layerLabels) as TwinLayerKey[]).map((layer) => (
          <button
            className={classNames(
              "rounded-full border px-4 py-2 text-xs font-semibold transition",
              activeLayers[layer]
                ? "border-cyan-200/30 bg-cyan-300/[0.12] text-cyan-50"
                : "border-white/10 bg-white/[0.035] text-white/48 hover:text-white/72",
            )}
            key={layer}
            onClick={() => onToggle(layer)}
            type="button"
          >
            {layerLabels[layer]}
          </button>
        ))}
      </div>
    </section>
  );
}

function ZoneDrawer({ onClose, zone }: { onClose: () => void; zone: TwinZoneView }) {
  return (
    <motion.aside
      animate={{ opacity: 1, x: 0 }}
      className="fixed bottom-4 right-4 top-4 z-50 flex w-[min(420px,calc(100vw-2rem))] flex-col rounded-[2rem] border border-white/10 bg-[#070B13]/92 p-5 text-white shadow-[0_30px_120px_rgba(0,0,0,0.58)] backdrop-blur-2xl"
      exit={{ opacity: 0, x: 32 }}
      initial={{ opacity: 0, x: 32 }}
      transition={{ duration: 0.24 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/60">Zone command drawer</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.045em]">{zone.name}</h2>
        </div>
        <button
          className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
          onClick={onClose}
          type="button"
        >
          Close
        </button>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <SmallStat label="Occupancy" value={`${formatNumber(zone.occupancy)} people`} />
        <SmallStat label="Risk" value={`${zone.risk}%`} />
        <SmallStat label="Status" value={zone.status} />
        <SmallStat label="Camera" value={zone.camera} />
      </div>

      <div className="mt-5 rounded-[1.4rem] border border-white/10 bg-white/[0.045] p-4">
        <p className="text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-white/38">Recommended action</p>
        <p className="mt-2 text-sm leading-6 text-white/70">{zone.action}</p>
      </div>

      <div className="mt-4 rounded-[1.4rem] border border-white/10 bg-white/[0.045] p-4">
        <p className="text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-white/38">Evacuation path</p>
        <p className="mt-2 text-sm leading-6 text-cyan-100/78">{zone.path}</p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {["Thermal", "Crowd", "Responder", "Door"].map((feed) => (
          <div className="rounded-[1.2rem] border border-white/10 bg-black/30 p-3" key={feed}>
            <div className="h-20 rounded-xl bg-[radial-gradient(circle_at_50%_45%,rgba(125,211,252,0.22),transparent_48%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.025))]" />
            <p className="mt-2 text-xs font-semibold text-white/70">{feed} feed</p>
          </div>
        ))}
      </div>
    </motion.aside>
  );
}
