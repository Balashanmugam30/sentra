"use client";

import type { ReactNode } from "react";

import { useRoleAccess } from "@/hooks/use-role-access";
import type { AppRole } from "@/types/rbac";

interface RequireRoleProps {
  children: ReactNode;
  role?: AppRole;
  roles?: AppRole[];
  fallback?: ReactNode;
}

function DefaultAccessFallback() {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm text-muted">
      You do not have permission to view this area.
    </div>
  );
}

export function RequireRole({ children, role, roles, fallback }: RequireRoleProps) {
  const { hasAccess } = useRoleAccess({ role, roles });

  if (!hasAccess) {
    return <>{fallback ?? <DefaultAccessFallback />}</>;
  }

  return <>{children}</>;
}
