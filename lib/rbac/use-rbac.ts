"use client";

import { useEffect, useMemo, useState } from "react";

import { getRbacMe, getRbacRoles } from "@/lib/rbac/api";
import type { RbacCurrentUser, RbacRoleDefinition } from "@/lib/rbac/types";
import { ROLE_TIERS, normalizeAppRole } from "@/lib/security/roles";
import { useAuthStore } from "@/store/auth-store";
import type { AppPermission, AppRole } from "@/types/rbac";

type RbacState = {
  currentUser: RbacCurrentUser | null;
  roles: RbacRoleDefinition[];
  loading: boolean;
  error: string | null;
};

function deriveSecurityLevel(role: AppRole): RbacCurrentUser["security_level"] {
  return ROLE_TIERS[role] ?? ROLE_TIERS[normalizeAppRole(role)] ?? "tier_4";
}

export function useRbac() {
  const authStatus = useAuthStore((state) => state.authStatus);
  const user = useAuthStore((state) => state.user);
  const [state, setState] = useState<RbacState>({
    currentUser: null,
    roles: [],
    loading: authStatus === "authenticated",
    error: null,
  });

  const fallbackUser: RbacCurrentUser | null = useMemo(
    () =>
      user
        ? {
            id: user.uid,
            name: user.displayName ?? user.email ?? "Sentra User",
            email: user.email ?? "",
            role: (user.role === "guest" ? "guest_viewer" : user.role) as Exclude<AppRole, "guest">,
            permissions: (user.permissions ?? []) as AppPermission[],
            accessible_modules: user.accessibleModules ?? [],
            security_level: deriveSecurityLevel(user.role),
            last_login: user.lastLogin ?? null,
          }
        : null,
    [user],
  );

  useEffect(() => {
    let cancelled = false;

    if (authStatus !== "authenticated") {
      return;
    }

    void Promise.all([getRbacMe(), getRbacRoles()])
      .then(([me, roles]) => {
        if (cancelled) {
          return;
        }
        setState({
          currentUser: me.current_user,
          roles: roles.roles,
          loading: false,
          error: null,
        });
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }
        setState({
          currentUser: fallbackUser,
          roles: [],
          loading: false,
          error: error instanceof Error ? error.message : "Failed to load RBAC state",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [authStatus, fallbackUser]);

  return useMemo(
    () => ({
      ...state,
      currentUser: authStatus === "authenticated" ? state.currentUser ?? fallbackUser : null,
      roles: authStatus === "authenticated" ? state.roles : [],
      loading: authStatus === "authenticated" ? state.loading : false,
      error: authStatus === "authenticated" ? state.error : null,
      permissions:
        authStatus === "authenticated"
          ? (state.currentUser ?? fallbackUser)?.permissions ?? []
          : [],
      accessibleModules:
        authStatus === "authenticated"
          ? (state.currentUser ?? fallbackUser)?.accessible_modules ?? []
          : [],
      permissionCount:
        authStatus === "authenticated"
          ? ((state.currentUser ?? fallbackUser)?.permissions ?? []).length
          : 0,
      hasPermission: (permission: AppPermission) => {
        if (authStatus !== "authenticated") return false;
        const perms = (state.currentUser ?? fallbackUser)?.permissions ?? [];
        const role = (state.currentUser ?? fallbackUser)?.role;
        if (role === "admin" || role === "super_admin" || perms.includes("*" as AppPermission)) {
          return true;
        }
        return perms.includes(permission);
      },
      hasAnyPermission: (...requested: AppPermission[]) => {
        if (authStatus !== "authenticated") return false;
        const perms = (state.currentUser ?? fallbackUser)?.permissions ?? [];
        const role = (state.currentUser ?? fallbackUser)?.role;
        if (role === "admin" || role === "super_admin" || perms.includes("*" as AppPermission)) {
          return true;
        }
        return requested.some((permission) => perms.includes(permission));
      },
      hasRole: (role: Exclude<AppRole, "guest">) =>
        authStatus === "authenticated"
          ? (state.currentUser ?? fallbackUser)?.role === role
          : false,
    }),
    [authStatus, fallbackUser, state],
  );
}
