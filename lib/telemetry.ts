"use client";

import { resolveSystemStatusFromSeverity } from "@/modules/incident/lib/priority";
import { useIncidentStore } from "@/store/incident-store";
import { useUiStore } from "@/store/ui-store";
import { useUserStore } from "@/store/user-store";

import { logger } from "./logger";
import { generateTraceId } from "./trace";

type TelemetryLevel = "error" | "warning" | "event";

interface TelemetryContext {
  component?: string;
  metadata?: Record<string, unknown>;
}

export interface TelemetryPayload {
  level: TelemetryLevel;
  message: string;
  trace_id: string;
  timestamp: string;
  route: string;
  user_id: string | null;
  component_name: string | null;
  incident_id: string | null;
  system_status: "monitoring" | "alert" | "emergency";
  last_websocket_event: string | null;
  metadata?: Record<string, unknown>;
}

function buildPayload(level: TelemetryLevel, message: string, context?: TelemetryContext): TelemetryPayload {
  const activeIncident = useIncidentStore.getState().activeIncident;
  const currentUser = useUserStore.getState().currentUser;
  const lastRealtimeEvent = useUiStore.getState().lastRealtimeEvent;

  return {
    level,
    message,
    trace_id: generateTraceId(),
    timestamp: new Date().toISOString(),
    route: typeof window !== "undefined" ? window.location.pathname : "server",
    user_id: currentUser?.userId ?? null,
    component_name: context?.component ?? null,
    incident_id: activeIncident?.incidentId ?? null,
    system_status: resolveSystemStatusFromSeverity(activeIncident?.severity ?? null),
    last_websocket_event: lastRealtimeEvent,
    metadata: context?.metadata,
  };
}

function dispatchTelemetry(payload: TelemetryPayload) {
  void payload;
  return;
}

export function captureError(message: string, error?: unknown, context?: TelemetryContext) {
  const payload = buildPayload("error", message, {
    ...context,
    metadata: {
      ...context?.metadata,
      error:
        error instanceof Error
          ? {
              message: error.message,
              stack: error.stack,
            }
          : error,
    },
  });

  logger.error(message, payload.metadata);
  dispatchTelemetry(payload);
}

export function captureWarning(message: string, context?: TelemetryContext) {
  const payload = buildPayload("warning", message, context);

  logger.warn(message, payload.metadata);
  dispatchTelemetry(payload);
}

export function captureEvent(message: string, context?: TelemetryContext) {
  const payload = buildPayload("event", message, context);

  logger.info(message, payload.metadata);
  dispatchTelemetry(payload);
}
