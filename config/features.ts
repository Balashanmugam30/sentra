import { env } from "@/config/env";

export const featureFlags = {
  realtime: env.enableRealtime,
  analytics: env.enableAnalytics,
  demo_mode: env.enableDemoMode,
  realtime_map: env.enableRealtimeMap,
  command_surface_experimental: env.enableCommandSurfaceExperimental,
  role_guards: true,
} as const;
