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
import { SESSION_DEVICE_MAX_AGE_SECONDS } from "@/lib/security/session";
import { mapBackendUserToAuthUser } from "@/modules/auth/types/auth";
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

    clearLocalAuthState();
    return { ok: false as const, error: refreshed.error ?? me.error };
  }, [applyAuthSession, clearLocalAuthState, setAuthLoading]);

  const login = useCallback(
    async (payload: LoginPayload, options?: AuthSessionOptions) => {
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
      }
      return result;
    },
    [applyAuthSession],
  );

  const loginWithFirebaseToken = useCallback(
    async (idToken: string, options?: AuthSessionOptions) => {
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
      }
      return result;
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
