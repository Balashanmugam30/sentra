"use client";

export type RetentionPolicy = {
  id: string;
  label: string;
  scope: string;
  retentionDays: number;
  action: "retain" | "archive" | "expire" | "revoke";
  status: "active" | "watch" | "locked";
};

export const RETENTION_POLICIES: RetentionPolicy[] = [
  {
    id: "audit-365",
    label: "Audit ledger",
    scope: "Immutable auth, RBAC, export, approval, and denied-request events",
    retentionDays: 365,
    action: "archive",
    status: "locked",
  },
  {
    id: "incidents-180",
    label: "Incident records",
    scope: "Operational incidents, route overrides, and responder actions",
    retentionDays: 180,
    action: "retain",
    status: "active",
  },
  {
    id: "exports-14",
    label: "Generated exports",
    scope: "CSV, PDF, board packs, and evidence bundles",
    retentionDays: 14,
    action: "expire",
    status: "active",
  },
  {
    id: "sessions-30",
    label: "Old sessions",
    scope: "Refresh sessions and remembered devices",
    retentionDays: 30,
    action: "revoke",
    status: "active",
  },
];

export function retentionHealthScore(policies = RETENTION_POLICIES) {
  const locked = policies.filter((policy) => policy.status === "locked").length;
  const active = policies.filter((policy) => policy.status === "active").length;
  return Math.min(100, 72 + locked * 8 + active * 4);
}
