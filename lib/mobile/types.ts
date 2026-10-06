export type MobileRole = "guest" | "staff" | "responder" | "admin";

export type SystemStatus = "safe" | "warning" | "emergency";

export type MobileTheme = "dark" | "system";

export type IncidentType = "fire" | "gas_leak" | "intruder" | "medical" | "smoke" | "none";

export type DemoScenario = "safe" | "warning_smoke" | "active_fire" | "corridor_blocked";

export type CongestionLevel = "low" | "moderate" | "high";

export type OpsPriority = "critical" | "high" | "normal";

export type SosKind = "trapped" | "injured" | "need_assistance" | "cannot_move" | "smoke_nearby" | "medical_help";

export type SosStatus = "queued" | "dispatched" | "acknowledged" | "resolved";

export type StaffTaskStatus = "pending" | "accepted" | "completed" | "escalated";

export type ResponderMissionStatus = "pending" | "accepted" | "arrived" | "victim_secured" | "zone_cleared" | "need_support" | "route_updated";

export type ZoneRisk = "clear" | "watch" | "blocked" | "hazard";

export type TeamMemberStatus = "en_route" | "on_scene" | "clearing" | "support_needed" | "standby";

export type NotificationPermissionState = "default" | "granted" | "denied" | "unsupported";

export type MobileNotification = {
  body: string;
  createdAt: string;
  id: string;
  read: boolean;
  title: string;
  type: "alert" | "route" | "responder" | "task" | "sos" | "system";
};

export type SyncQueueItem = {
  createdAt: string;
  id: string;
  label: string;
  payload: string;
  status: "queued" | "syncing" | "synced";
  type: "sos" | "task" | "ack" | "route" | "settings";
};

export type MobileIncident = {
  detectedAt: string;
  floor: string;
  id: string;
  instructions: string[];
  severityLevel: "low" | "medium" | "high" | "critical";
  title: string;
  type: IncidentType;
  severity: SystemStatus;
  zone: string;
  updatedAt: string;
};

export type MobileRoute = {
  confidence: number;
  congestionLevel: CongestionLevel;
  id: string;
  destination: string;
  distanceMeters: number;
  etaMinutes: number;
  etaSeconds: number;
  safetyScore: number;
};

export type MobileRouteStep = {
  detail: string;
  distanceMeters: number;
  id: string;
  status: "complete" | "current" | "upcoming";
  title: string;
};

export type MobileTask = {
  id: string;
  title: string;
  priority: SystemStatus;
  completed: boolean;
  createdAt: string;
};

export type SosRequest = {
  batteryLevel: string;
  currentZone: string;
  id: string;
  incidentId: string | null;
  kind?: SosKind;
  networkOnline?: boolean;
  priority?: OpsPriority;
  role: MobileRole;
  message: string;
  queuedAt: string;
  sentAt?: string;
  status?: SosStatus;
};

export type StaffTask = {
  assignedZone: string;
  civilianCount: number;
  createdAt: string;
  id: string;
  priority: OpsPriority;
  status: StaffTaskStatus;
  title: string;
};

export type ResponderMission = {
  distanceMeters: number;
  etaSeconds: number;
  id: string;
  ingressRoute: string;
  priority: OpsPriority;
  routeSafety: number;
  status: ResponderMissionStatus;
  target: string;
  trappedMinutes: number;
};

export type ZoneStatus = {
  civiliansNearby: number;
  exitsOpen: number;
  id: string;
  name: string;
  risk: ZoneRisk;
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  status: TeamMemberStatus;
};

export type OpsFeedItem = {
  createdAt: string;
  id: string;
  message: string;
  priority: OpsPriority;
  title: string;
};

export type MobileNavItem = {
  href: string;
  label: string;
  shortLabel: string;
};
