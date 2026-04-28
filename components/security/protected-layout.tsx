"use client";

import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect } from "react";

import { SessionLoadingScreen } from "@/modules/auth/components/session-loading-screen";
import { canAccessRoute } from "@/lib/security/guards";
import { useAuthStore } from "@/store/auth-store";

export function ProtectedLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const authStatus = useAuthStore((state) => state.authStatus);
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);
  const role = useAuthStore((state) => state.role);
  const permissions = useAuthStore((state) => state.user?.permissions ?? []);

  const authenticated = authStatus === "authenticated";
  const allowed = canAccessRoute(pathname, {
    role,
    permissions,
    authenticated,
  });

  useEffect(() => {
    if (authStatus === "loading" || isAuthLoading) {
      return;
    }

    if (!authenticated) {
      router.replace(`/login?from=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!allowed) {
      router.replace("/unauthorized" as Route);
    }
  }, [allowed, authenticated, authStatus, isAuthLoading, pathname, router]);

  if (authStatus === "loading" || isAuthLoading || !authenticated || !allowed) {
    return <SessionLoadingScreen />;
  }

  return <>{children}</>;
}
