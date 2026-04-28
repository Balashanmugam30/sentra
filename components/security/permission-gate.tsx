"use client";

import type { ReactNode } from "react";

import type { AppPermission } from "@/types/rbac";
import { hasAnyPermission, hasPermission } from "@/lib/security/permissions";
import { useAuthStore } from "@/store/auth-store";

type PermissionGateProps = {
  children: ReactNode;
  permission?: AppPermission;
  anyPermission?: AppPermission[];
  fallback?: ReactNode;
};

export function PermissionGate({
  children,
  permission,
  anyPermission,
  fallback = null,
}: PermissionGateProps) {
  const role = useAuthStore((state) => state.role);
  const permissions = useAuthStore((state) => state.user?.permissions ?? []);

  const allowed =
    permission ? hasPermission(role, permission, permissions) :
    anyPermission?.length ? hasAnyPermission(role, anyPermission, permissions) :
    true;

  if (!allowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
