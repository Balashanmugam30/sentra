import type { IotEventRecord, IotMode, IotNode, IotTelemetryRecord } from "@/lib/iot/types";

function wave(seed: number, min: number, max: number) {
  const value = Math.sin(Date.now() / 5000 + seed) * 0.5 + 0.5;
  return Math.round(min + value * (max - min));
}

export function simulateIotStream(nodes: IotNode[], mode: IotMode): { nodes: IotNode[]; events: IotEventRecord[] } {
  if (mode === "REAL") {
    return { nodes, events: [] as IotEventRecord[] };
  }

  const events: IotEventRecord[] = [];
  const simulated: IotNode[] = nodes.map((node, index) => {
    const gas = node.node_type === "corridor_camera" ? null : wave(index, 520, index === 1 ? 1850 : 980);
    const temperature = node.node_type === "corridor_camera" ? null : wave(index + 2, 29, index === 1 ? 55 : 38);
    const panic = index === 0 && Math.floor(Date.now() / 30_000) % 9 === 0;
    const disconnected = node.node_id === "stair_cam_02" || (index === 4 && Math.floor(Date.now() / 45_000) % 5 === 0);
    const riskLevel: IotNode["risk_level"] =
      panic || (gas ?? 0) > 1600 || (temperature ?? 0) > 52 ? "WARNING" : node.risk_level;
    const telemetry =
      node.node_type === "corridor_camera"
        ? node.latest_telemetry
        : ({
            event_id: `SIM-${node.node_id}-${Math.floor(Date.now() / 5000)}`,
            node_id: node.node_id,
            timestamp: new Date().toISOString(),
            temperature,
            humidity: wave(index + 5, 38, 58),
            gas_level: gas,
            flame_detected: false,
            button_pressed: panic,
            wifi_rssi: disconnected ? -86 : node.wifi_rssi,
            battery: node.battery === null ? null : Math.max(18, node.battery - (index % 3)),
            risk_level: riskLevel,
            risk_score: riskLevel === "WARNING" ? 54 : Math.max(12, node.risk_score),
            triggers: riskLevel === "WARNING" ? ["demo_stream_variation"] : [],
            action_status: "simulated_stream",
            incident_id: null,
          } satisfies IotTelemetryRecord);

    if (telemetry) {
      events.push(telemetry);
    }
    const status: IotNode["status"] = disconnected
      ? "offline"
      : riskLevel === "WARNING"
        ? "warning"
        : node.status === "offline"
          ? "online"
          : node.status;

    return {
      ...node,
      status,
      latest_telemetry: telemetry,
      wifi_rssi: disconnected ? -86 : node.wifi_rssi,
      risk_level: riskLevel,
      risk_score: riskLevel === "WARNING" ? 54 : node.risk_score,
      battery: telemetry?.battery ?? node.battery,
    };
  });

  return { nodes: simulated, events };
}
