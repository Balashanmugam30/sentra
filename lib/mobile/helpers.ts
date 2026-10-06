import type { CongestionLevel, MobileRole, SystemStatus } from "./types";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatRole(role: MobileRole) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export function formatLastSync(value: string | null) {
  if (!value) {
    return "Now";
  }

  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) {
    return "Now";
  }

  const seconds = Math.max(0, Math.round((Date.now() - timestamp) / 1000));
  if (seconds < 10) {
    return "Just now";
  }
  if (seconds < 60) {
    return `${seconds}s ago`;
  }
  const minutes = Math.round(seconds / 60);
  return `${minutes}m ago`;
}

export function formatEta(seconds: number) {
  const safeSeconds = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  if (minutes === 0) {
    return `${remainingSeconds}s`;
  }

  return `${minutes}m ${remainingSeconds.toString().padStart(2, "0")}s`;
}

export function formatClock(value: Date) {
  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export function statusTone(status: SystemStatus) {
  if (status === "safe") {
    return "safe";
  }
  if (status === "warning") {
    return "warning";
  }
  return "critical";
}

export function riskScoreFromStatus(status: SystemStatus) {
  if (status === "safe") {
    return 7;
  }
  if (status === "warning") {
    return 42;
  }
  return 86;
}

export function congestionLabel(level: CongestionLevel) {
  if (level === "low") {
    return "Low";
  }
  if (level === "moderate") {
    return "Moderate";
  }
  return "High";
}

export function createId(prefix: string) {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${random}`;
}
