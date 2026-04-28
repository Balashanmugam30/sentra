import type {
  AlertRealtimePayload,
  IncidentRealtimePayload,
  PredictionRealtimePayload,
  RealtimeEnvelope,
  RouteRealtimePayload,
} from "@/services/realtime/types";
import type { EventTraceEntry } from "@/modules/simulation/types/scenario";
import { captureEvent } from "@/lib/telemetry";
import { useDemoStore } from "@/store/demo-store";
import { useIncidentStore } from "@/store/incident-store";
import { useUiStore } from "@/store/ui-store";

function describeEvent(message: RealtimeEnvelope) {
  if (message.metadata?.simulation_label) {
    return message.metadata.simulation_label;
  }

  switch (message.type) {
    case "incident.created":
      return "Incident created";
    case "incident.update":
      return "Incident updated";
    case "prediction.updated":
      return "AI prediction updated";
    case "route.updated":
      return "Route guidance updated";
    case "alert.triggered":
      return "Alert triggered";
    case "alert.notification":
      return "Alert notification dispatched";
    case "system.heartbeat":
      return "System heartbeat received";
    default:
      return message.type;
  }
}

function buildDecisionExplanation(message: RealtimeEnvelope) {
  if (message.type === "route.updated") {
    if (message.metadata?.fault?.includes("route_blocked")) {
      return "Route B selected because the primary route is blocked by a hazard condition.";
    }

    return "Routes were optimized to preserve evacuation flow and keep low-risk corridors available.";
  }

  if (message.type === "prediction.updated") {
    return "The AI engine updated guidance after forecasting near-term spread and occupant movement.";
  }

  if (message.type === "incident.created" || message.type === "incident.update") {
    return "Sentra escalated the incident because the current signal pattern crossed operational thresholds.";
  }

  if (message.type === "alert.triggered" || message.type === "alert.notification") {
    return "Alerts were dispatched to move occupants before route conditions degrade further.";
  }

  return "The command surface synchronized with the latest system decision.";
}

export function mapRealtimeEventToState(message: RealtimeEnvelope) {
  useUiStore.getState().setLastRealtimeEvent(message.type);
  useDemoStore.getState().appendTrace({
    id: message.message_id,
    timestamp: message.sent_at,
    timelineTime: message.metadata?.timeline_time,
    type: message.type,
    label: describeEvent(message),
    source: message.metadata?.source ?? "realtime",
    phase: message.metadata?.simulation_phase ?? null,
    fault: (message.metadata?.fault as EventTraceEntry["fault"]) ?? null,
  });

  if (message.metadata?.simulation_phase) {
    useDemoStore
      .getState()
      .setCurrentPhase(message.metadata.simulation_phase, message.metadata?.simulation_label ?? describeEvent(message));
  }

  if (message.type === "incident.created" || message.type === "incident.update") {
    const payload = message.payload as IncidentRealtimePayload;
    const explanation = buildDecisionExplanation(message);

    useIncidentStore.getState().upsertIncident({
      incidentId: payload.incident_id,
      status: payload.status,
      severity: payload.severity,
      summary: payload.summary,
      updatedAt: message.sent_at,
      aiInsight: {
        summary: payload.summary,
        recommendation: payload.recommendation ?? "Await next AI planning cycle.",
        explanation,
        updatedAt: message.sent_at,
      },
      evacuation: {
        progressPercent: 0,
        routeHealth: "watch",
        activeAlerts: 0,
        lastUpdatedAt: message.sent_at,
      },
      alerts: [],
    });
    useUiStore.getState().setFeedbackMessage("Incident state synchronized.");
    captureEvent("Decision explanation updated", {
      component: "RealtimeEventMapper",
      metadata: {
        event_type: message.type,
        explanation,
      },
    });

    return;
  }

  if (message.type === "prediction.updated") {
    const payload = message.payload as PredictionRealtimePayload;

    useIncidentStore.getState().updateInsight({
      summary: payload.summary,
      recommendation: payload.recommendation,
      confidence: payload.confidence,
      explanation: buildDecisionExplanation(message),
      updatedAt: message.sent_at,
    });
    useIncidentStore.getState().recordPredictionSummary(payload.summary);
    useUiStore.getState().setFeedbackMessage("AI recommendation refreshed.");
    captureEvent("Decision explanation updated", {
      component: "RealtimeEventMapper",
      metadata: {
        event_type: message.type,
        confidence: payload.confidence ?? null,
        explanation: buildDecisionExplanation(message),
      },
    });
    return;
  }

  if (message.type === "route.updated") {
    const payload = message.payload as RouteRealtimePayload;

    useIncidentStore.getState().updateEvacuationState({
      progressPercent: payload.progress_percent,
      routeHealth: payload.route_health,
      activeAlerts: payload.active_alerts,
      lastUpdatedAt: message.sent_at,
    });
    useIncidentStore.getState().updateInsight({
      explanation: buildDecisionExplanation(message),
      updatedAt: message.sent_at,
    });
    useUiStore.getState().setFeedbackMessage("Route guidance recalibrated.");
    captureEvent("Decision explanation updated", {
      component: "RealtimeEventMapper",
      metadata: {
        event_type: message.type,
        explanation: buildDecisionExplanation(message),
      },
    });
    return;
  }

  if (message.type === "alert.triggered" || message.type === "alert.notification") {
    const payload = message.payload as AlertRealtimePayload;
    const activeIncident = useIncidentStore.getState().activeIncident;
    const explanation = buildDecisionExplanation(message);

    if (!activeIncident) {
      return;
    }

    useIncidentStore.getState().setAlerts([
      {
        id: payload.alert_id,
        channel: payload.channel,
        state: payload.state,
      },
      ...activeIncident.alerts.filter((alert) => alert.id !== payload.alert_id),
    ]);
    useIncidentStore.getState().updateInsight({
      explanation,
      updatedAt: message.sent_at,
    });
    useUiStore.getState().setFeedbackMessage("Alert delivery is active.");
    captureEvent("Decision explanation updated", {
      component: "RealtimeEventMapper",
      metadata: {
        event_type: message.type,
        explanation,
      },
    });
    return;
  }

  if (message.type === "system.heartbeat") {
    useUiStore.getState().setRealtimeConnection("connected");
  }
}
