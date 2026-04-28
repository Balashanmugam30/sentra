import type { Incident } from "@/lib/api/incident";
import type { UseGeospatialResult } from "@/lib/geospatial/use-geospatial";
import type { UseSocResult } from "@/lib/soc/use-soc";

export function getActiveIncidents(incidents: Incident[]) {
  return incidents.filter((incident) => incident.status !== "resolved").length;
}

export function getCriticalIncidents(incidents: Incident[]) {
  return incidents.filter(
    (incident) =>
      incident.priority === "critical" ||
      incident.risk_level === "critical" ||
      incident.severity >= 4,
  ).length;
}

export function getIncidentTitle(incident: Incident) {
  return (
    incident.title ||
    `${incident.location || "Unknown zone"} ${incident.type?.replaceAll("_", " ") || "incident"}`
  );
}

export function buildWorkspaceMetrics({
  geo,
  incidents,
  soc,
}: {
  geo: UseGeospatialResult;
  incidents: Incident[];
  soc: UseSocResult;
}) {
  const activeIncidents = getActiveIncidents(incidents);
  const criticalIncidents = getCriticalIncidents(incidents);
  const geoLive = geo.live;
  const responderCount = geoLive?.responders?.length ?? 0;
  const blockedRoutes = geoLive?.blocked_routes?.length ?? 0;
  const devicesOnline = geoLive?.sensors?.filter((sensor) => sensor.status === "online").length ?? 0;
  const threatScore = Math.min(99, 18 + activeIncidents * 6 + criticalIncidents * 11 + blockedRoutes * 4);
  const systemHealth = soc.live?.health_score ?? Math.max(72, 96 - criticalIncidents * 6 - blockedRoutes * 3);
  const readinessScore = Math.max(0, Math.min(100, 97 - criticalIncidents * 8 - Math.max(0, activeIncidents - 2) * 3));
  const reputationRisk = Math.max(8, Math.min(100, 16 + activeIncidents * 5 + criticalIncidents * 11));
  const aiConfidence = Math.max(78, Math.min(97, 94 - criticalIncidents * 3 + Math.min(3, responderCount)));

  return {
    activeIncidents,
    aiConfidence,
    blockedRoutes,
    criticalIncidents,
    devicesOnline,
    financialExposure: `$${(0.75 + activeIncidents * 0.48 + criticalIncidents * 1.25).toFixed(1)}M`,
    readinessScore,
    reputationRisk,
    responderCount,
    systemHealth,
    threatScore,
  };
}
