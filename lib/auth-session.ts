"use client";

import type { AppRole } from "@/types/rbac";

export const AUTH_SESSION_COOKIE_NAME = "sentra_session";
export const AUTH_SESSION_COOKIE_VALUE = "active";
export const AUTH_SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
export const LOCAL_AUTH_STORAGE_KEY = "sentra_local_auth";
export const AUTH_EVENT_STORAGE_KEY = "sentra_auth_event";
export const AUTH_NOTICE_STORAGE_KEY = "sentra_auth_notice";

export type LocalAuthSession = {
  accessToken: string;
  refreshToken: string | null;
  accessTokenExpiresAt: string;
  accessTokenIssuedAt: string;
  tokenRefreshedAt: string;
  user: {
    uid: string;
    email: string | null;
    displayName: string | null;
    phoneNumber: string | null;
    photoURL: string | null;
    providerId: string | null;
    role: AppRole;
    permissions?: string[];
    accessibleModules?: string[];
    tenantId?: string | null;
    organizationName?: string | null;
    organizationSlug?: string | null;
    orgRole?: string | null;
    plan?: string | null;
  };
};

export type AuthSessionEvent =
  | {
      type: "logout";
      at: string;
    }
  | {
      type: "session_updated";
      at: string;
    };

function canUseDocument() {
  return typeof document !== "undefined";
}

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function canUseSessionStorage() {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

export function setClientAuthSessionCookie(maxAgeSeconds = AUTH_SESSION_COOKIE_MAX_AGE) {
  if (!canUseDocument()) {
    return;
  }

  document.cookie = [
    `${AUTH_SESSION_COOKIE_NAME}=${AUTH_SESSION_COOKIE_VALUE}`,
    "Path=/",
    "SameSite=Lax",
    `Max-Age=${maxAgeSeconds}`,
    window.location.protocol === "https:" ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
}

export function clearClientAuthSessionCookie() {
  if (!canUseDocument()) {
    return;
  }

  document.cookie = [
    `${AUTH_SESSION_COOKIE_NAME}=`,
    "Path=/",
    "SameSite=Lax",
    "Max-Age=0",
    window.location.protocol === "https:" ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
}

export function setLocalAuthSession(
  session: LocalAuthSession,
  options: { rememberDevice?: boolean } = {},
) {
  if (!canUseStorage() && !canUseSessionStorage()) {
    return;
  }

  if (canUseStorage()) {
    if (options.rememberDevice) {
      window.localStorage.setItem(LOCAL_AUTH_STORAGE_KEY, JSON.stringify(session));
    } else {
      window.localStorage.removeItem(LOCAL_AUTH_STORAGE_KEY);
    }
  }
  if (canUseSessionStorage()) {
    window.sessionStorage.setItem(LOCAL_AUTH_STORAGE_KEY, JSON.stringify(session));
  }
  emitAuthSessionEvent({
    type: "session_updated",
    at: new Date().toISOString(),
  });
}

export function getLocalAuthSession() {
  if (!canUseStorage() && !canUseSessionStorage()) {
    return null;
  }

  const rawSession =
    (canUseStorage() ? window.localStorage.getItem(LOCAL_AUTH_STORAGE_KEY) : null) ??
    (canUseSessionStorage() ? window.sessionStorage.getItem(LOCAL_AUTH_STORAGE_KEY) : null);

  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession) as LocalAuthSession;
  } catch {
    if (canUseStorage()) {
      window.localStorage.removeItem(LOCAL_AUTH_STORAGE_KEY);
    }
    if (canUseSessionStorage()) {
      window.sessionStorage.removeItem(LOCAL_AUTH_STORAGE_KEY);
    }
    return null;
  }
}

export function clearLocalAuthSession() {
  if (canUseStorage()) {
    window.localStorage.removeItem(LOCAL_AUTH_STORAGE_KEY);
  }
  if (canUseSessionStorage()) {
    window.sessionStorage.removeItem(LOCAL_AUTH_STORAGE_KEY);
  }
  emitAuthSessionEvent({
    type: "logout",
    at: new Date().toISOString(),
  });
}

export function isAccessTokenExpiringSoon(session: LocalAuthSession | null, withinMs = 90_000) {
  if (!session?.accessTokenExpiresAt) {
    return true;
  }

  const expiresAt = new Date(session.accessTokenExpiresAt).getTime();
  if (Number.isNaN(expiresAt)) {
    return true;
  }

  return expiresAt - Date.now() <= withinMs;
}

export function setAuthNotice(message: string) {
  if (!canUseSessionStorage()) {
    return;
  }

  window.sessionStorage.setItem(AUTH_NOTICE_STORAGE_KEY, message);
}

export function consumeAuthNotice() {
  if (!canUseSessionStorage()) {
    return "";
  }

  const message = window.sessionStorage.getItem(AUTH_NOTICE_STORAGE_KEY) ?? "";
  if (message) {
    window.sessionStorage.removeItem(AUTH_NOTICE_STORAGE_KEY);
  }
  return message;
}

export function emitAuthSessionEvent(event: AuthSessionEvent) {
  if (!canUseStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(AUTH_EVENT_STORAGE_KEY, JSON.stringify(event));
  } catch {
    return;
  }
}

export function subscribeAuthSessionEvents(listener: (event: AuthSessionEvent) => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== AUTH_EVENT_STORAGE_KEY || !event.newValue) {
      return;
    }

    try {
      listener(JSON.parse(event.newValue) as AuthSessionEvent);
    } catch {
      return;
    }
  };

  window.addEventListener("storage", handleStorage);
  return () => {
    window.removeEventListener("storage", handleStorage);
  };
}
