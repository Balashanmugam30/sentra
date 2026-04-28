import { env } from "@/config/env";

export const appConfig = {
  name: env.appName,
  environment: env.appEnv,
  apiBaseUrl: env.apiBaseUrl,
  wsBaseUrl: env.wsBaseUrl,
} as const;
