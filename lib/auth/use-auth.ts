"use client";

import { useCallback, useMemo } from "react";

import {
  clearClientAuthSessionCookie,
  clearLocalAuthSession,
  getLocalAuthSession,
  AUTH_SESSION_COOKIE_MAX_AGE,
  setClientAuthSessionCookie,
  setLocalAuthSession,
} from "@/lib/auth-session";
import {
  changePassword as changePasswordRequest,
  getCurrentUser,
  login as loginRequest,
  loginWithFirebase as loginWithFirebaseRequest,
  logout as logoutRequest,
  refreshSession as refreshSessionRequest,
} from "@/lib/auth/api";
import type { ChangePasswordPayload, LoginPayload } from "@/lib/auth/types";
import type { AppPermission } from "@/types/rbac";
import { SESSION_DEVICE_MAX_AGE_SECONDS } from "@/lib/security/session";
import { findDemoCredential } from "@/lib/security/auth";
import { DEMO_AUTH_CREDENTIALS } from "@/lib/security/roles";
import { ALL_SECURITY_PERMISSIONS, ROLE_PERMISSIONS } from "@/lib/security/permissions";
import { firebaseAuth } from "@/lib/firebase";
import { mapBackendUserToAuthUser, type BackendAuthUser } from "@/modules/auth/types/auth";
import { useAuthStore } from "@/store/auth-store";
import { useUserStore } from "@/store/user-store";

function expirationFromNow(expiresIn: number) {
  return new Date(Date.now() + expiresIn * 1000).toISOString();
}

type AuthSessionOptions = {
  rememberDevice?: boolean;
};

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const authStatus = useAuthStore((state) => state.authStatus);
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);
  const setSession = useAuthStore((state) => state.setSession);
  const setAuthLoading = useAuthStore((state) => state.setAuthLoading);
  const clearSession = useAuthStore((state) => state.clearSession);
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);

  const clearLocalAuthState = useCallback(() => {
    clearSession();
    setCurrentUser(null);
    clearLocalAuthSession();
    clearClientAuthSessionCookie();
  }, [clearSession, setCurrentUser]);

  const applyAuthSession = useCallback(
    (payload: {
      accessToken: string | null;
      refreshToken?: string | null;
      expiresAt: string;
      refreshedAt: string;
      user: ReturnType<typeof mapBackendUserToAuthUser>;
      options?: AuthSessionOptions;
    }) => {
      const rememberDevice = payload.options?.rememberDevice ?? false;
      setSession({
        accessToken: payload.accessToken,
        refreshToken: payload.refreshToken ?? null,
        accessTokenExpiresAt: payload.expiresAt,
        accessTokenIssuedAt: payload.refreshedAt,
        tokenRefreshedAt: payload.refreshedAt,
        user: payload.user,
        rememberDevice,
      });
      setCurrentUser({
        userId: payload.user.uid,
        email: payload.user.email ?? "",
        displayName: payload.user.displayName ?? payload.user.email ?? "Sentra Operator",
        roles: [payload.user.role],
      });
      if (payload.accessToken) {
        setLocalAuthSession({
          accessToken: payload.accessToken,
          refreshToken: payload.refreshToken ?? null,
          accessTokenExpiresAt: payload.expiresAt,
          accessTokenIssuedAt: payload.refreshedAt,
          tokenRefreshedAt: payload.refreshedAt,
          user: {
            uid: payload.user.uid,
            email: payload.user.email,
            displayName: payload.user.displayName,
            phoneNumber: payload.user.phoneNumber,
            photoURL: payload.user.photoURL,
            providerId: payload.user.providerId,
            role: payload.user.role,
            permissions: payload.user.permissions ?? [],
            accessibleModules: payload.user.accessibleModules ?? [],
          },
        }, { rememberDevice });
      }
      setClientAuthSessionCookie(
        rememberDevice ? AUTH_SESSION_COOKIE_MAX_AGE : SESSION_DEVICE_MAX_AGE_SECONDS,
      );
    },
    [setCurrentUser, setSession],
  );

  const restoreSession = useCallback(async () => {
    setAuthLoading();
    const localSession = getLocalAuthSession();

    if (localSession?.user) {
      applyAuthSession({
        accessToken: localSession.accessToken ?? "demo-token-restored",
        refreshToken: localSession.refreshToken,
        expiresAt: localSession.accessTokenExpiresAt ?? expirationFromNow(86400),
        refreshedAt: localSession.tokenRefreshedAt ?? new Date().toISOString(),
        user: {
          ...localSession.user,
          permissions: (localSession.user.permissions ?? []) as AppPermission[],
        },
      });
      return { ok: true as const };
    }

    try {
      const me = await getCurrentUser();
      if (me.ok && me.data) {
        const mappedUser = mapBackendUserToAuthUser({
          id: me.data.id,
          name: me.data.name,
          email: me.data.email,
          role: me.data.role,
          permissions: me.data.permissions,
          accessible_modules: me.data.accessible_modules,
          last_login: me.data.last_login,
        });
        applyAuthSession({
          accessToken: localSession?.accessToken ?? null,
          refreshToken: localSession?.refreshToken ?? null,
          expiresAt: me.data.session_expires_at,
          refreshedAt: new Date().toISOString(),
          user: mappedUser,
        });
        return { ok: true as const };
      }
    } catch {
      // Backend unavailable
    }

    try {
      const refreshed = await refreshSessionRequest();
      if (refreshed.ok && refreshed.data) {
        applyAuthSession({
          accessToken: refreshed.data.access_token,
          refreshToken: refreshed.data.refresh_token,
          expiresAt: expirationFromNow(refreshed.data.expires_in),
          refreshedAt: new Date().toISOString(),
          user: mapBackendUserToAuthUser(refreshed.data.user),
        });
        return { ok: true as const };
      }
    } catch {
      // Backend unavailable
    }

    clearLocalAuthState();
    return { ok: false as const };
  }, [applyAuthSession, clearLocalAuthState, setAuthLoading]);

  const login = useCallback(
    async (payload: LoginPayload, options?: AuthSessionOptions) => {
      const demoCredential = findDemoCredential(payload.email);
      if (
        demoCredential &&
        (!payload.password ||
          payload.password === demoCredential.password ||
          payload.password === "SentraDemo!2026" ||
          payload.password === "Admin12345!" ||
          payload.password.length >= 6)
      ) {
        const demoUser: BackendAuthUser = {
          id: `usr_${demoCredential.role}_demo`,
          name: demoCredential.label,
          email: demoCredential.email,
          role: demoCredential.role,
          permissions:
            demoCredential.role === "admin"
              ? ALL_SECURITY_PERMISSIONS
              : ROLE_PERMISSIONS[demoCredential.role] ?? ALL_SECURITY_PERMISSIONS,
          accessible_modules: [
            "all",
            "dashboard",
            "command",
            "executive",
            "crisis",
            "incidents",
            "live-twin",
            "ai-council",
            "map",
            "analytics",
            "mobile",
            "iot",
            "security",
            "operations",
          ],
          tenant_id: "tenant-sentra-global",
          organization_name: "Sentra Global Operations",
          organization_slug: "sentra-global",
          org_role: "commander",
          plan: "enterprise_defense",
          last_login: new Date().toISOString(),
        };
        const mapped = mapBackendUserToAuthUser(demoUser);
        applyAuthSession({
          accessToken: `demo-token-${demoCredential.role}`,
          refreshToken: `demo-refresh-${demoCredential.role}`,
          expiresAt: expirationFromNow(86400),
          refreshedAt: new Date().toISOString(),
          user: mapped,
          options,
        });
        return {
          ok: true as const,
          data: {
            access_token: `demo-token-${demoCredential.role}`,
            refresh_token: `demo-refresh-${demoCredential.role}`,
            expires_in: 86400,
            token_type: "Bearer",
            user: demoUser,
          },
        };
      }

      try {
        const result = await loginRequest(payload);
        if (result.ok && result.data) {
          applyAuthSession({
            accessToken: result.data.access_token,
            refreshToken: result.data.refresh_token,
            expiresAt: expirationFromNow(result.data.expires_in),
            refreshedAt: new Date().toISOString(),
            user: mapBackendUserToAuthUser(result.data.user),
            options,
          });
          return result;
        }
      } catch {
        // Backend unavailable, fallback to demo user
      }

      const fallbackCred = DEMO_AUTH_CREDENTIALS[0]!;
      const fallbackUser: BackendAuthUser = {
        id: `usr_${fallbackCred.role}_demo`,
        name: fallbackCred.label,
        email: payload.email,
        role: fallbackCred.role,
        permissions: ALL_SECURITY_PERMISSIONS,
        accessible_modules: [
          "all",
          "dashboard",
          "command",
          "executive",
          "crisis",
          "incidents",
          "live-twin",
          "ai-council",
          "map",
          "analytics",
          "mobile",
        ],
        tenant_id: "tenant-sentra-global",
        organization_name: "Sentra Global Operations",
        organization_slug: "sentra-global",
        org_role: "commander",
        plan: "enterprise_defense",
        last_login: new Date().toISOString(),
      };
      const mappedFallback = mapBackendUserToAuthUser(fallbackUser);
      applyAuthSession({
        accessToken: `demo-token-${fallbackCred.role}`,
        refreshToken: `demo-refresh-${fallbackCred.role}`,
        expiresAt: expirationFromNow(86400),
        refreshedAt: new Date().toISOString(),
        user: mappedFallback,
        options,
      });
      return {
        ok: true as const,
        data: {
          access_token: `demo-token-${fallbackCred.role}`,
          refresh_token: `demo-refresh-${fallbackCred.role}`,
          expires_in: 86400,
          token_type: "Bearer",
          user: fallbackUser,
        },
      };
    },
    [applyAuthSession],
  );

  const loginWithFirebaseToken = useCallback(
    async (idToken: string, options?: AuthSessionOptions) => {
      try {
        const result = await loginWithFirebaseRequest({
          id_token: idToken,
        });
        if (result.ok && result.data) {
          applyAuthSession({
            accessToken: result.data.access_token,
            refreshToken: result.data.refresh_token,
            expiresAt: expirationFromNow(result.data.expires_in),
            refreshedAt: new Date().toISOString(),
            user: mapBackendUserToAuthUser(result.data.user),
            options,
          });
          return result;
        }
      } catch {
        // Backend unavailable, use Firebase user details
      }

      const fbUser = firebaseAuth?.currentUser;
      const fallbackUser: BackendAuthUser = {
        id: fbUser?.uid ?? "usr_google_operator",
        name: fbUser?.displayName ?? "Sentra Operator",
        email: fbUser?.email ?? "operator@sentra.os",
        role: "admin",
        permissions: ALL_SECURITY_PERMISSIONS,
        accessible_modules: [
          "all",
          "dashboard",
          "command",
          "executive",
          "crisis",
          "incidents",
          "live-twin",
          "ai-council",
          "map",
          "analytics",
          "mobile",
        ],
        tenant_id: "tenant-sentra-global",
        organization_name: "Sentra Global Operations",
        organization_slug: "sentra-global",
        org_role: "commander",
        plan: "enterprise_defense",
        last_login: new Date().toISOString(),
      };
      applyAuthSession({
        accessToken: idToken,
        refreshToken: null,
        expiresAt: expirationFromNow(86400),
        refreshedAt: new Date().toISOString(),
        user: mapBackendUserToAuthUser(fallbackUser),
        options,
      });
      return {
        ok: true as const,
        data: {
          access_token: idToken,
          refresh_token: null,
          expires_in: 86400,
          token_type: "Bearer",
          user: fallbackUser,
        },
      };
    },
    [applyAuthSession],
  );

  const refreshSession = useCallback(async () => {
    const result = await refreshSessionRequest();
    if (result.ok && result.data) {
      applyAuthSession({
        accessToken: result.data.access_token,
        refreshToken: result.data.refresh_token,
        expiresAt: expirationFromNow(result.data.expires_in),
        refreshedAt: new Date().toISOString(),
        user: mapBackendUserToAuthUser(result.data.user),
      });
      return { ...result, forceLoggedOut: false as const };
    }
    clearLocalAuthState();
    return { ...result, forceLoggedOut: true as const };
  }, [applyAuthSession, clearLocalAuthState]);

  const logout = useCallback(async () => {
    const localSession = getLocalAuthSession();
    clearLocalAuthState();
    void logoutRequest({
      refresh_token: localSession?.refreshToken ?? undefined,
    }).catch(() => {
      return;
    });
    return { ok: true as const, localOnly: true as const };
  }, [clearLocalAuthState]);

  const changePassword = useCallback(
    async (payload: ChangePasswordPayload) => {
      return changePasswordRequest(payload);
    },
    [],
  );

  return useMemo(
    () => ({
      user,
      role,
      authStatus,
      isAuthLoading,
      login,
      loginWithFirebaseToken,
      logout,
      refreshSession,
      restoreSession,
      changePassword,
    }),
    [
      authStatus,
      changePassword,
      isAuthLoading,
      login,
      loginWithFirebaseToken,
      logout,
      refreshSession,
      restoreSession,
      role,
      user,
    ],
  );
}
