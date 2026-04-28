"use client";

import type { AuditAnomaly, AuditEvent } from "@/lib/security/audit";

export type SecurityAnomaly = {
  id: string;
  title: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  signal: string;
};

export function buildAnomalyFeed(events: AuditEvent[], anomalies: AuditAnomaly[]): SecurityAnomaly[] {
  const feed = anomalies.map((anomaly) => ({
    id: anomaly.anomaly_id,
    title: anomaly.title,
    severity: anomaly.severity,
    description: anomaly.description,
    signal: `${anomaly.related_event_ids.length} linked events`,
  }));

  const denied = events.filter((event) => event.status === "denied");
  const failedLogins = events.filter((event) => event.category === "auth" && event.action === "login_failed");
  const adminActions = events.filter((event) => event.actor_role?.includes("admin") && event.risk_score >= 45);

  if (failedLogins.length >= 3) {
    feed.push({
      id: "brute-force-watch",
      title: "Brute force attempt pattern",
      severity: "high",
      description: "Multiple login failures clustered in a short window.",
      signal: `${failedLogins.length} failed logins`,
    });
  }

  if (denied.length > 0) {
    feed.push({
      id: "privilege-escalation-watch",
      title: "Denied request watch",
      severity: "medium",
      description: "RBAC denied sensitive actions that should be reviewed.",
      signal: `${denied.length} denied requests`,
    });
  }

  if (adminActions.length > 4) {
    feed.push({
      id: "admin-hour-watch",
      title: "Unusual admin activity",
      severity: "medium",
      description: "High-risk administrator actions increased in the current period.",
      signal: `${adminActions.length} elevated actions`,
    });
  }

  return feed.length
    ? feed.slice(0, 6)
    : [
        {
          id: "clear-posture",
          title: "No active anomaly cluster",
          severity: "low",
          description: "Brute force, impossible travel, token storm, and escalation patterns are quiet.",
          signal: "0 flagged patterns",
        },
      ];
}
