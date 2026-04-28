"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect } from "react";

import { Container } from "@/components/ui";
import { SessionLoadingScreen } from "@/modules/auth/components/session-loading-screen";
import { useRoleAccess } from "@/hooks/use-role-access";
import { useAuthStore } from "@/store/auth-store";
import type { AppRole } from "@/types/rbac";

interface RouteGuardProps {
  children: ReactNode;
  role?: AppRole;
  roles?: AppRole[];
  fallback?: ReactNode;
  requireAuth?: boolean;
  redirectTo?: Route;
  unauthenticatedFallback?: ReactNode;
}

function DefaultRouteFallback() {
  return (
    <Container className="flex min-h-screen items-center justify-center py-12">
      <div className="w-full max-w-xl rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-muted">Access Restricted</p>
        <h1 className="mt-4 text-2xl font-semibold text-foreground">Role access required</h1>
        <p className="mt-3 text-sm text-muted">
          This route is protected by Sentra&apos;s client-side RBAC guard.
        </p>
      </div>
    </Container>
  );
}

export function RouteGuard({
  children,
  role,
  roles,
  fallback,
  requireAuth = false,
  redirectTo,
  unauthenticatedFallback,
}: RouteGuardProps) {
  const router = useRouter();
  const authStatus = useAuthStore((state) => state.authStatus);
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);
  const { hasAccess } = useRoleAccess({ role, roles });

  useEffect(() => {
    if (requireAuth && authStatus === "unauthenticated" && redirectTo) {
      router.replace(redirectTo);
    }
  }, [authStatus, redirectTo, requireAuth, router]);

  if (requireAuth && (authStatus === "loading" || isAuthLoading)) {
    return <SessionLoadingScreen />;
  }

  if (requireAuth && authStatus === "unauthenticated") {
    return <>{unauthenticatedFallback ?? <SessionLoadingScreen />}</>;
  }

  if (!hasAccess) {
    return <>{fallback ?? <DefaultRouteFallback />}</>;
  }

  return <>{children}</>;
}
