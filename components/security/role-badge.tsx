"use client";

import type { AppRole } from "@/types/rbac";

import { getRoleLabel, ROLE_TIERS } from "@/lib/security/roles";

const TIER_STYLES: Record<string, string> = {
  tier_1: "sentra-role-chip",
  tier_2: "sentra-role-chip",
  tier_3: "sentra-role-chip",
  tier_4: "sentra-role-chip",
};

export function RoleBadge({ role, compact = false }: { role?: AppRole | string | null; compact?: boolean }) {
  const normalized = (role ?? "guest") as AppRole;
  const tier = ROLE_TIERS[normalized] ?? "tier_4";

  return (
    <span
      className={[
        "inline-flex items-center rounded-full border font-medium uppercase tracking-[0.16em]",
        compact ? "px-2.5 py-1 text-[10px]" : "px-3 py-1.5 text-[11px]",
        TIER_STYLES[tier],
      ].join(" ")}
    >
      {getRoleLabel(role)}
    </span>
  );
}
