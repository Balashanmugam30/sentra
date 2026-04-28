"use client";

import { useMemo } from "react";

import { useAuthStore } from "@/store/auth-store";
import { useUserStore } from "@/store/user-store";
import type { AppRole } from "@/types/rbac";

interface UseRoleAccessOptions {
  role?: AppRole;
  roles?: AppRole[];
}

export function useRoleAccess(options: UseRoleAccessOptions) {
  const authRole = useAuthStore((state) => state.role);
  const currentUser = useUserStore((state) => state.currentUser);

  const allowedRoles = useMemo(() => {
    if (options.roles?.length) {
      return options.roles;
    }

    return options.role ? [options.role] : [];
  }, [options.role, options.roles]);

  const hasAccess =
    allowedRoles.length === 0
      ? true
      : allowedRoles.some(
          (role) => (currentUser?.roles?.includes(role) ?? false) || authRole === role,
        );

  return {
    currentUser,
    allowedRoles,
    hasAccess,
  };
}
