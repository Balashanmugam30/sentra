import type { IotEventRecord, IotNode, IotRiskLevel, IotTelemetryRecord } from "@/lib/iot/types";
import { isIotAlertRecord } from "@/lib/iot/types";

export type IotCorrelation = {
  id: string;
  title: string;
  confidence: number;
  severity: IotRiskLevel;
  explanation: string;
};

function latestTelemetry(nodes: IotNode[], nodeId: string) {
  return nodes.find((node) => node.node_id === nodeId)?.latest_telemetry ?? null;
}

function telemetryEvents(events: IotEventRecord[]) {
  return events.filter((event): event is IotTelemetryRecord => !isIotAlertRecord(event));
}

export function buildIotCorrelations(nodes: IotNode[], events: IotEventRecord[]): IotCorrelation[] {
  const telemetry = telemetryEvents(events);
  const correlations: IotCorrelation[] = [];
  const utility = latestTelemetry(nodes, "utility_node_01") ?? telemetry.find((event) => event.node_id.includes("utility"));

  if (utility && (utility.gas_level ?? 0) > 1350 && (utility.temperature ?? 0) > 45) {
    correlations.push({
      id: "leak-heat-risk",
      title: "Gas spike plus heat rise indicates leak escalation risk",
      confidence: 88,
      severity: "WARNING",
      explanation: "MQ gas elevation and DHT22 heat drift appeared in the same utility zone window.",
    });
  }

  if (telemetry.some((event) => event.flame_detected) && telemetry.some((event) => (event.gas_level ?? 0) > 1800)) {
    correlations.push({
      id: "confirmed-fire",
      title: "Flame plus smoke/gas signature requires fire verification",
      confidence: 94,
      severity: "CRITICAL",
      explanation: "Multiple fire indicators crossed confidence threshold and should request camera verification.",
    });
  }

  if (events.filter((event) => isIotAlertRecord(event) && event.alert_type.includes("panic")).length >= 2) {
    correlations.push({
      id: "panic-escalation",
      title: "Repeated panic events suggest security escalation",
      confidence: 82,
      severity: "CRITICAL",
      explanation: "Multiple manual distress signals were recorded across the live feed.",
    });
  }

  if (nodes.some((node) => node.status === "offline" && node.risk_score > 30)) {
    correlations.push({
      id: "tamper-risk",
      title: "Node silence after prior anomaly suggests possible tampering",
      confidence: 76,
      severity: "WARNING",
      explanation: "Offline state follows elevated risk history; inspect enclosure and Wi-Fi path.",
    });
  }

  if (correlations.length === 0) {
    correlations.push({
      id: "stable-fleet",
      title: "No compound risk detected across the current telemetry window",
      confidence: 91,
      severity: "SAFE",
      explanation: "Sensor readings, camera requests, and node health are currently consistent.",
    });
  }

  return correlations;
}
