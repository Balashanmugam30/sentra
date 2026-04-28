"use client";

import { getApiPerformanceSnapshot } from "@/lib/core/api-client";

export type RateLimitRule = {
  id: string;
  route: string;
  limit: string;
  window: string;
  status: "enforced" | "watch" | "learning";
  flaggedToday: number;
};

export const RATE_LIMIT_RULES: RateLimitRule[] = [
  {
    id: "login-throttle",
    route: "/login + /auth/login",
    limit: "5 failed attempts",
    window: "5 min",
    status: "enforced",
    flaggedToday: 0,
  },
  {
    id: "auth-burst",
    route: "/api/auth/*",
    limit: "90 req/IP",
    window: "60 sec",
    status: "enforced",
    flaggedToday: 0,
  },
  {
    id: "alert-burst",
    route: "/api/alerts",
    limit: "12 writes",
    window: "60 sec",
    status: "enforced",
    flaggedToday: 0,
  },
  {
    id: "export-burst",
    route: "/api/export",
    limit: "8 exports",
    window: "15 min",
    status: "watch",
    flaggedToday: 0,
  },
  {
    id: "public-forms",
    route: "/public forms",
    limit: "20 submissions",
    window: "10 min",
    status: "learning",
    flaggedToday: 0,
  },
];

export function buildRateLimitSnapshot() {
  const performance = getApiPerformanceSnapshot();
  const totalFlags = RATE_LIMIT_RULES.reduce((sum, rule) => sum + rule.flaggedToday, 0);
  return {
    rules: RATE_LIMIT_RULES,
    requestsPerMinute: performance.requestsPerMinute,
    p95LatencyMs: performance.p95LatencyMs,
    duplicateRequestsPrevented: performance.duplicateRequestsPrevented,
    totalFlags,
    posture: totalFlags === 0 ? "clean" : totalFlags <= 3 ? "watch" : "active",
  };
}
