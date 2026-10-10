import { create } from "zustand";
import { persist } from "zustand/middleware";

import type {
  AuthenticatedUser,
  AuthStatus,
  DeviceSession,
  PhoneAuthSession,
} from "@/modules/auth/types/auth";
import type { AppRole } from "@/types/rbac";
import {
  getSessionExpiresAt,
  getSessionWarningAt,
  SESSION_DEVICE_MAX_AGE_SECONDS,
} from "@/lib/security/session";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  accessTokenExpiresAt: string | null;
  accessTokenIssuedAt: string | null;
  lastTokenRefreshAt: string | null;
  authStatus: AuthStatus;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthLoading: boolean;
  user: AuthenticatedUser | null;
  role: AppRole;
  phoneAuthSession: PhoneAuthSession | null;
  activeSessions: DeviceSession[];
  currentDeviceId: string | null;
  rememberDevice: boolean;
  lastActivityAt: number | null;
  sessionWarningAt: number | null;
  sessionExpiresAt: number | null;
  timeoutWarningDismissedAt: number | null;
  setAuthLoading: () => void;
  setSession: (payload: {
    accessToken: string | null;
    refreshToken?: string | null;
    accessTokenExpiresAt: string | null;
    accessTokenIssuedAt: string | null;
    tokenRefreshedAt: string | null;
    user: AuthenticatedUser;
    rememberDevice?: boolean;
  }) => void;
  setRememberDevice: (rememberDevice: boolean) => void;
  touchSession: () => void;
  dismissTimeoutWarning: () => void;
  setPhoneAuthSession: (session: PhoneAuthSession | null) => void;
  setActiveSessions: (sessions: DeviceSession[]) => void;
  setCurrentDeviceId: (deviceId: string | null) => void;
  updateUserProfile: (payload: { displayName: string; username?: string }) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      accessTokenExpiresAt: null,
      accessTokenIssuedAt: null,
      lastTokenRefreshAt: null,
      authStatus: "loading",
      isAuthenticated: false,
      isLoading: true,
      isAuthLoading: true,
      user: null,
      role: "guest",
      phoneAuthSession: null,
      activeSessions: [],
      currentDeviceId: null,
      rememberDevice: false,
      lastActivityAt: null,
      sessionWarningAt: null,
      sessionExpiresAt: null,
      timeoutWarningDismissedAt: null,
      setAuthLoading: () =>
        set({
          authStatus: "loading",
          isAuthenticated: false,
          isLoading: true,
          isAuthLoading: true,
        }),
      setSession: ({
        accessToken,
        refreshToken,
        accessTokenExpiresAt,
        accessTokenIssuedAt,
        tokenRefreshedAt,
        user,
        rememberDevice,
      }) => {
        const now = Date.now();
        const resolvedRememberDevice = rememberDevice ?? false;
        set({
          accessToken,
          refreshToken: refreshToken ?? null,
          accessTokenExpiresAt,
          accessTokenIssuedAt,
          lastTokenRefreshAt: tokenRefreshedAt,
          user,
          role: user.role,
          rememberDevice: resolvedRememberDevice,
          lastActivityAt: now,
          sessionWarningAt: getSessionWarningAt(now, resolvedRememberDevice),
          sessionExpiresAt: (() => {
            const parsed = accessTokenExpiresAt ? new Date(accessTokenExpiresAt).getTime() : NaN;
            if (!Number.isNaN(parsed) && parsed > now + 60_000) {
              return parsed;
            }
            return now + (resolvedRememberDevice ? SESSION_DEVICE_MAX_AGE_SECONDS * 1000 : 24 * 60 * 60 * 1000);
          })(),
          timeoutWarningDismissedAt: null,
          authStatus: "authenticated",
          isAuthenticated: true,
          isLoading: false,
          isAuthLoading: false,
        });
      },
      setRememberDevice: (rememberDevice) =>
        set((state) => {
          const lastActivityAt = state.lastActivityAt ?? Date.now();
          return {
            rememberDevice,
            sessionWarningAt: getSessionWarningAt(lastActivityAt, rememberDevice),
            sessionExpiresAt: getSessionExpiresAt(lastActivityAt, rememberDevice),
          };
        }),
      touchSession: () =>
        set((state) => {
          if (!state.isAuthenticated) {
            return {};
          }
          const now = Date.now();
          return {
            lastActivityAt: now,
            sessionWarningAt: getSessionWarningAt(now, state.rememberDevice),
            sessionExpiresAt: (() => {
              const parsed = state.accessTokenExpiresAt ? new Date(state.accessTokenExpiresAt).getTime() : NaN;
              if (!Number.isNaN(parsed) && parsed > now + 60_000) {
                return parsed;
              }
              return getSessionExpiresAt(now, state.rememberDevice);
            })(),
            timeoutWarningDismissedAt: null,
          };
        }),
      dismissTimeoutWarning: () =>
        set({
          timeoutWarningDismissedAt: Date.now(),
        }),
      setPhoneAuthSession: (phoneAuthSession) =>
        set({
          phoneAuthSession,
        }),
      setActiveSessions: (activeSessions) =>
        set({
          activeSessions,
        }),
      setCurrentDeviceId: (currentDeviceId) =>
        set({
          currentDeviceId,
        }),
      updateUserProfile: ({ displayName, username }) =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                displayName,
                ...(username ? { username } : {}),
              }
            : state.user,
        })),
      clearSession: () =>
        set({
          accessToken: null,
          refreshToken: null,
          accessTokenExpiresAt: null,
          accessTokenIssuedAt: null,
          lastTokenRefreshAt: null,
          authStatus: "unauthenticated",
          isAuthenticated: false,
          isLoading: false,
          isAuthLoading: false,
          user: null,
          role: "guest",
          phoneAuthSession: null,
          activeSessions: [],
          currentDeviceId: null,
          rememberDevice: false,
          lastActivityAt: null,
          sessionWarningAt: null,
          sessionExpiresAt: null,
          timeoutWarningDismissedAt: null,
        }),
    }),
    {
      name: "sentra-auth",
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        accessTokenExpiresAt: state.accessTokenExpiresAt,
        accessTokenIssuedAt: state.accessTokenIssuedAt,
        lastTokenRefreshAt: state.lastTokenRefreshAt,
        user: state.user,
        role: state.role,
        phoneAuthSession: state.phoneAuthSession,
        activeSessions: state.activeSessions,
        currentDeviceId: state.currentDeviceId,
        rememberDevice: state.rememberDevice,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const now = Date.now();
        const parsed = state.accessTokenExpiresAt ? new Date(state.accessTokenExpiresAt).getTime() : NaN;
        if (!state.accessToken || (!Number.isNaN(parsed) && parsed <= now)) {
          state.clearSession();
        } else {
          state.lastActivityAt = now;
          state.sessionWarningAt = getSessionWarningAt(now, state.rememberDevice);
          state.sessionExpiresAt = !Number.isNaN(parsed) && parsed > now
            ? parsed
            : now + (state.rememberDevice ? SESSION_DEVICE_MAX_AGE_SECONDS * 1000 : 24 * 60 * 60 * 1000);
        }
      },
    },
  ),
);
