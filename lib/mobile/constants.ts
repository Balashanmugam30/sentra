import type { MobileNavItem, MobileRole, SystemStatus } from "./types";

export const BUILDING_NAME = "Grand Meridian Hotel";

export const DEFAULT_STATUS: SystemStatus = "safe";

export const DEFAULT_ROLE: MobileRole = "guest";

export const MOBILE_NAV_ITEMS: MobileNavItem[] = [
  { href: "/home", label: "Home", shortLabel: "Home" },
  { href: "/route", label: "Route", shortLabel: "Route" },
  { href: "/sos", label: "SOS", shortLabel: "SOS" },
  { href: "/staff", label: "Staff", shortLabel: "Staff" },
  { href: "/settings", label: "Settings", shortLabel: "Settings" },
];

export const ROLE_OPTIONS: Array<{ label: string; role: MobileRole; description: string }> = [
  { label: "Guest", role: "guest", description: "Visitor-safe guidance and emergency help." },
  { label: "Staff", role: "staff", description: "Hotel staff workflows and guest support." },
  { label: "Responder", role: "responder", description: "Responder routes, tasks, and incident state." },
  { label: "Admin", role: "admin", description: "Mobile command posture for authorized operators." },
];

export const STATUS_COPY: Record<SystemStatus, { label: string; message: string }> = {
  safe: {
    label: "SAFE",
    message: "Building systems nominal. Guidance and routes are ready.",
  },
  warning: {
    label: "WATCH",
    message: "Elevated condition. Follow staff instructions and keep routes visible.",
  },
  emergency: {
    label: "EMERGENCY",
    message: "Emergency posture active. Use SOS or guided route instructions immediately.",
  },
};

export const QUICK_ACTIONS = [
  { description: "Turn-by-turn evacuation guidance", href: "/route", label: "View Route", tone: "accent" },
  { description: "Current incident and instructions", href: "/alert", label: "Emergency Info", tone: "warning" },
  { description: "Queue assistance immediately", href: "/sos", label: "SOS", tone: "critical" },
  { description: "Responder and staff assignments", href: "/staff", label: "Staff Tasks", tone: "safe" },
  { description: "Latest building event stream", href: "/alert", label: "Incident Feed", tone: "accent" },
  { description: "Voice, network, and app controls", href: "/settings", label: "Settings", tone: "neutral" },
] as const;

export const INCIDENT_FEED = [
  {
    id: "FEED-SMOKE",
    status: "warning" as SystemStatus,
    time: "09:41",
    title: "Smoke anomaly detected",
    detail: "Kitchen Zone B thermal sensor crossed watch threshold.",
  },
  {
    id: "FEED-EXIT",
    status: "safe" as SystemStatus,
    time: "09:42",
    title: "Exit B verified open",
    detail: "South stairwell door telemetry and staff check both clear.",
  },
  {
    id: "FEED-RESPONDER",
    status: "emergency" as SystemStatus,
    time: "09:43",
    title: "Responder team dispatched",
    detail: "Four responders en route with thermal kit and floor marshal support.",
  },
];
