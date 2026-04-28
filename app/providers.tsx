"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { ThemeProvider } from "@/components/theme/theme-provider";
import { AskSentraCopilot } from "@/components/sentra/ask-sentra-copilot";
import { appConfig } from "@/config/app";
import { featureFlags } from "@/config/features";
import { getLocalAuthSession, isAccessTokenExpiringSoon, subscribeAuthSessionEvents } from "@/lib/auth-session";
import { captureError } from "@/lib/telemetry";
import { useAuth } from "@/lib/auth/use-auth";
import { apiClient } from "@/lib/core/api-client";
import { SessionLoadingScreen } from "@/modules/auth/components/session-loading-screen";
import { timelineEngine } from "@/modules/simulation/timeline-engine";
import { mapRealtimeEventToState } from "@/services/realtime/event-mapper";
import { websocketManager } from "@/services/realtime/websocket-manager";
import { useAuthStore } from "@/store/auth-store";
import { useDemoStore } from "@/store/demo-store";
import { useUiStore } from "@/store/ui-store";
import { useUserStore } from "@/store/user-store";
import { apiClient as serviceApiClient } from "@/services/api/client";

const publicExperiencePrefixes = ["/landing", "/site"];

function isPublicExperienceRoute(pathname: string | null) {
  if (!pathname) {
    return false;
  }

  return pathname === "/" || publicExperiencePrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const authStatus = useAuthStore((state) => state.authStatus);
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);
  const accessToken = useAuthStore((state) => state.accessToken);
  const isDemoMode = useDemoStore((state) => state.isDemoMode);
  const { restoreSession } = useAuth();
  const bootstrappedRef = useRef(false);
  const [bootstrapSettled, setBootstrapSettled] = useState(false);
  const isAuthEntryRoute = pathname === "/login" || pathname?.startsWith("/login/");
  const isPublicRoute = isPublicExperienceRoute(pathname);
  const showAskSentraCopilot = authStatus === "authenticated" && !isAuthEntryRoute && !isPublicRoute;

  useEffect(() => {
    serviceApiClient.setAccessTokenResolver(() => useAuthStore.getState().accessToken);
  }, []);

  useEffect(() => {
    if (bootstrappedRef.current) {
      return;
    }
    bootstrappedRef.current = true;

    let cancelled = false;
    const timeoutId = window.setTimeout(() => {
      if (cancelled) {
        return;
      }

      useAuthStore.getState().clearSession();
      useUserStore.getState().setCurrentUser(null);
      setBootstrapSettled(true);
    }, 4_000);

    void restoreSession()
      .catch((error) => {
        captureError("Authentication session bootstrap failed", error, {
          component: "AppProviders",
        });
      })
      .finally(() => {
        if (cancelled) {
          return;
        }

        window.clearTimeout(timeoutId);
        setBootstrapSettled(true);
      });

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [restoreSession]);

  useEffect(() => {
    if (isDemoMode) {
      websocketManager.disconnect();
      useUiStore.getState().setRealtimeConnection("simulated");
      return;
    }

    const hasLocalRealtimeBackend = appConfig.wsBaseUrl.includes("localhost:4000");

    if (!featureFlags.realtime || authStatus !== "authenticated" || hasLocalRealtimeBackend) {
      websocketManager.disconnect();
      useUiStore.getState().setRealtimeConnection("idle");
      return;
    }

    if (!accessToken) {
      useUiStore.getState().setRealtimeConnection("idle");
      return;
    }

    websocketManager.connect(accessToken);

    const unsubscribers = [
      websocketManager.subscribe("incident.created", mapRealtimeEventToState),
      websocketManager.subscribe("incident.update", mapRealtimeEventToState),
      websocketManager.subscribe("prediction.updated", mapRealtimeEventToState),
      websocketManager.subscribe("route.updated", mapRealtimeEventToState),
      websocketManager.subscribe("alert.triggered", mapRealtimeEventToState),
      websocketManager.subscribe("alert.notification", mapRealtimeEventToState),
    ];

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
      websocketManager.disconnect();
    };
  }, [accessToken, authStatus, isDemoMode]);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      timelineEngine.stopScenario({ preserveReplay: true, suppressTelemetry: true });
    }
  }, [authStatus]);

  useEffect(() => {
    const unsubscribe = subscribeAuthSessionEvents((event) => {
      if (event.type !== "logout") {
        return;
      }

      useAuthStore.getState().clearSession();
      useUserStore.getState().setCurrentUser(null);

      if (
        typeof window !== "undefined" &&
        ["/ai", "/app", "/audit", "/dashboard", "/iot", "/map", "/operations", "/security"].some(
          (prefix) => window.location.pathname === prefix || window.location.pathname.startsWith(`${prefix}/`),
        )
      ) {
        window.location.replace("/login");
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (authStatus !== "authenticated") {
      return;
    }

    let cancelled = false;
    let lastHeartbeatAt = Date.now();

    const heartbeat = async () => {
      if (cancelled || document.visibilityState === "hidden") {
        return;
      }

      const localSession = getLocalAuthSession();
      const needsHeartbeat = Date.now() - lastHeartbeatAt >= 5 * 60_000;
      const expiringSoon = isAccessTokenExpiringSoon(localSession, 120_000);

      if (!needsHeartbeat && !expiringSoon) {
        return;
      }

      const refreshed = await apiClient.ensureSession(true);
      if (!refreshed && !cancelled) {
        apiClient.clearAuthAndRedirect();
        return;
      }

      lastHeartbeatAt = Date.now();
    };

    void heartbeat();
    const intervalId = window.setInterval(() => {
      void heartbeat();
    }, 60_000);

    const focusHandler = () => {
      void heartbeat();
    };
    window.addEventListener("focus", focusHandler);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", focusHandler);
    };
  }, [authStatus]);

  return (
    <ThemeProvider>
      {isAuthLoading && !bootstrapSettled && !isAuthEntryRoute && !isPublicRoute ? <SessionLoadingScreen /> : children}
      {showAskSentraCopilot ? <AskSentraCopilot /> : null}
    </ThemeProvider>
  );
}
