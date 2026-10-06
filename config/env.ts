import type { AppEnv } from "@/types/env";

type FirebasePublicConfig = {
  apiKey: string | null;
  authDomain: string | null;
  projectId: string | null;
  storageBucket: string | null;
  messagingSenderId: string | null;
  appId: string | null;
};

type PublicEnv = {
  appEnv: AppEnv;
  appName: string;
  apiBaseUrl: string;
  wsBaseUrl: string;
  firebaseApiKey: string | null;
  firebaseAuthDomain: string | null;
  firebaseProjectId: string | null;
  firebaseStorageBucket: string | null;
  firebaseMessagingSenderId: string | null;
  firebaseAppId: string | null;
  firebase: FirebasePublicConfig;
  hasFirebaseConfig: boolean;
  missingFirebaseVars: string[];
  enableRealtime: boolean;
  enableAnalytics: boolean;
  enableDemoMode: boolean;
  enableRealtimeMap: boolean;
  enableCommandSurfaceExperimental: boolean;
  logLevel: string;
};

const warnedKeys = new Set<string>();
const rawAppEnv = process.env.NEXT_PUBLIC_APP_ENV?.trim();
const resolvedAppEnv =
  rawAppEnv === "development" || rawAppEnv === "test" || rawAppEnv === "production"
    ? rawAppEnv
    : "development";
const isProductionEnv = resolvedAppEnv === "production" || process.env.NODE_ENV === "production";

function resolveApiBaseUrl() {
  const explicitBase = process.env.NEXT_PUBLIC_API_BASE?.trim();
  if (explicitBase) {
    return explicitBase;
  }

  const legacyBase = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (!isProductionEnv) {
    if (legacyBase && !legacyBase.includes("localhost:4000/api/v1")) {
      return legacyBase;
    }

    return "http://127.0.0.1:8000";
  }

  return legacyBase || "/api";
}

function resolveWsBaseUrl() {
  const rawWsBase = process.env.NEXT_PUBLIC_WS_BASE_URL?.trim();
  if (!isProductionEnv) {
    if (rawWsBase && !rawWsBase.includes("localhost:4000/ws/v1/realtime")) {
      return rawWsBase;
    }

    return "ws://127.0.0.1:8000/ws/incidents";
  }

  return rawWsBase || "/ws/incidents";
}

function warnMissing(key: string, fallback: string | null, requiredInProduction: boolean) {
  if (warnedKeys.has(key)) {
    return;
  }

  warnedKeys.add(key);

  if (typeof console !== "undefined") {
    const suffix = fallback
      ? ` Using fallback value "${fallback}" for local development.`
      : " Add it to .env.local before using the related feature.";

    console.warn(
      `[env] Missing environment variable ${key}.${requiredInProduction ? " It is required in production." : ""}${suffix}`,
    );
  }
}

function ensurePresent(
  key: string,
  value: string | undefined,
  options?: {
    fallback?: string | null;
    requiredInProduction?: boolean;
  },
) {
  const normalized = value?.trim();

  if (normalized) {
    return normalized;
  }

  const fallback = options?.fallback ?? null;
  const requiredInProduction = options?.requiredInProduction ?? false;

  if (isProductionEnv && requiredInProduction && fallback === null) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  warnMissing(key, fallback, requiredInProduction);
  return fallback;
}

const firebaseApiKey = ensurePresent("NEXT_PUBLIC_FIREBASE_API_KEY", process.env.NEXT_PUBLIC_FIREBASE_API_KEY, {
  fallback: "AIzaSyDXscfi8k93z0Ep140WTqFnaGGGn02FBWs",
  requiredInProduction: false,
});
const firebaseAuthDomain = ensurePresent(
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  {
    fallback: "sentra-01.firebaseapp.com",
    requiredInProduction: false,
  },
);
const firebaseProjectId = ensurePresent(
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  {
    fallback: "sentra-01",
    requiredInProduction: false,
  },
);
const firebaseStorageBucket = ensurePresent(
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  {
    fallback: "sentra-01.firebasestorage.app",
    requiredInProduction: false,
  },
);
const firebaseMessagingSenderId = ensurePresent(
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  {
    fallback: "557394501991",
    requiredInProduction: false,
  },
);
const firebaseAppId = ensurePresent("NEXT_PUBLIC_FIREBASE_APP_ID", process.env.NEXT_PUBLIC_FIREBASE_APP_ID, {
  fallback: "1:557394501991:web:c1e69b36810f3767940fc2",
  requiredInProduction: false,
});

const firebase: FirebasePublicConfig = {
  apiKey: firebaseApiKey,
  authDomain: firebaseAuthDomain,
  projectId: firebaseProjectId,
  storageBucket: firebaseStorageBucket,
  messagingSenderId: firebaseMessagingSenderId,
  appId: firebaseAppId,
};

const missingFirebaseVars = Object.entries({
  NEXT_PUBLIC_FIREBASE_API_KEY: firebase.apiKey,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: firebase.authDomain,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: firebase.projectId,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: firebase.storageBucket,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: firebase.messagingSenderId,
  NEXT_PUBLIC_FIREBASE_APP_ID: firebase.appId,
})
  .filter(([, value]) => !value)
  .map(([key]) => key);

export const env: PublicEnv = {
  appEnv: (ensurePresent("NEXT_PUBLIC_APP_ENV", process.env.NEXT_PUBLIC_APP_ENV, {
    fallback: "development",
    requiredInProduction: false,
  }) || "development") as AppEnv,
  appName: ensurePresent("NEXT_PUBLIC_APP_NAME", process.env.NEXT_PUBLIC_APP_NAME, {
    fallback: "Sentra",
    requiredInProduction: false,
  }) ?? "Sentra",
  apiBaseUrl:
    ensurePresent("NEXT_PUBLIC_API_BASE", resolveApiBaseUrl(), {
      fallback: isProductionEnv ? "/api" : "http://127.0.0.1:8000",
      requiredInProduction: false,
    }) ?? (isProductionEnv ? "/api" : "http://127.0.0.1:8000"),
  wsBaseUrl:
    ensurePresent("NEXT_PUBLIC_WS_BASE_URL", resolveWsBaseUrl(), {
      fallback: isProductionEnv ? "/ws/incidents" : "ws://127.0.0.1:8000/ws/incidents",
      requiredInProduction: false,
    }) ?? (isProductionEnv ? "/ws/incidents" : "ws://127.0.0.1:8000/ws/incidents"),
  firebaseApiKey,
  firebaseAuthDomain,
  firebaseProjectId,
  firebaseStorageBucket,
  firebaseMessagingSenderId,
  firebaseAppId,
  firebase,
  hasFirebaseConfig: missingFirebaseVars.length === 0,
  missingFirebaseVars,
  enableRealtime: process.env.NEXT_PUBLIC_ENABLE_REALTIME === "true",
  enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true",
  enableDemoMode: process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE !== "false",
  enableRealtimeMap: process.env.NEXT_PUBLIC_ENABLE_REALTIME_MAP === "true",
  enableCommandSurfaceExperimental:
    process.env.NEXT_PUBLIC_ENABLE_COMMAND_SURFACE_EXPERIMENTAL === "true",
  logLevel: process.env.NEXT_PUBLIC_LOG_LEVEL ?? "info",
};
