"use client";

import type { ReactNode } from "react";

import { AccessGate } from "@/components/ui/access-gate";
import { useRbac } from "@/lib/rbac/use-rbac";
import type { AppPermission } from "@/types/rbac";

interface PermissionGateProps {
  children: ReactNode;
  permission?: AppPermission;
  anyPermissions?: AppPermission[];
  fallback?: ReactNode;
}

export function PermissionGate({
  children,
  permission,
  anyPermissions,
  fallback,
}: PermissionGateProps) {
  const { hasAnyPermission, hasPermission, loading } = useRbac();

  const allowed = permission
    ? hasPermission(permission)
    : anyPermissions?.length
      ? hasAnyPermission(...anyPermissions)
      : true;

  if (loading && (permission || anyPermissions?.length)) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center justify-center px-6">
        <div className="w-full rounded-[32px] border border-white/10 bg-white/[0.055] p-6 text-center text-white shadow-[0_24px_80px_rgba(0,0,0,0.32)] backdrop-blur-2xl">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/52">
            Verifying access
          </p>
          <p className="mt-3 text-sm text-white/58">Checking your session permissions before loading this workspace.</p>
        </div>
      </div>
    );
  }

  if (!allowed) {
    return <>{fallback ?? <AccessGate />}</>;
  }

  return <>{children}</>;
}
