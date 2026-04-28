import type { IotNode } from "@/lib/iot/types";

export function getNodeHealthBand(score: number) {
  if (score >= 82) {
    return "green" as const;
  }
  if (score >= 62) {
    return "yellow" as const;
  }
  return "red" as const;
}

export function computeClientNodeHealth(node: IotNode) {
  if (node.disabled) {
    return 0;
  }
  let score = 100;
  if (node.status === "offline") {
    score -= 38;
  }
  if (node.wifi_rssi !== null && node.wifi_rssi < -78) {
    score -= 20;
  }
  if (node.battery !== null && node.battery < 25) {
    score -= 18;
  }
  if (node.risk_level === "WARNING") {
    score -= 8;
  }
  if (node.risk_level === "CRITICAL" || node.risk_level === "CRITICAL+") {
    score -= 28;
  }
  score -= Math.max(0, Math.round((100 - node.packet_success_rate) * 0.9));
  score -= Math.min(16, node.false_alarm_count * 3);
  return Math.max(0, Math.min(100, score));
}
