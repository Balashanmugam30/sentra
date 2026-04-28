import { logger } from "@/lib/logger";

export function logRequestLifecycle(details: {
  method: string;
  url: string;
  traceId: string;
  status?: number;
  durationMs?: number;
}) {
  logger.info("API request lifecycle", details);
}
