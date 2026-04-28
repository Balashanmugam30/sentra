import type { OpsCommunicationsSnapshot, OpsCommsChannelId, OpsCommsChannelMetric } from "@/lib/ops/types";

export function getChannelTone(channel: OpsCommsChannelMetric) {
  if (channel.failed >= 10 || channel.success_rate < 95) {
    return "border-amber-300/25 bg-amber-400/10 text-amber-100";
  }
  if (channel.channel === "webhook") {
    return "border-violet-300/25 bg-violet-400/10 text-violet-100";
  }
  return "border-cyan-300/25 bg-cyan-300/10 text-cyan-100";
}

export function getCommsRiskTone(risk: string) {
  if (risk === "critical") {
    return "border-rose-300/30 bg-rose-400/10 text-rose-100";
  }
  if (risk === "high") {
    return "border-amber-300/30 bg-amber-400/10 text-amber-100";
  }
  return "border-emerald-300/25 bg-emerald-300/10 text-emerald-100";
}

export function buildLocalCommunicationsSnapshot(): OpsCommunicationsSnapshot {
  const generatedAt = new Date().toISOString();
  const channels: OpsCommsChannelMetric[] = [
    { channel: "in_app", label: "In-app", queued: 12, sent: 1280, delivered: 1268, failed: 2, retried: 4, acked: 948, success_rate: 99 },
    { channel: "sms", label: "SMS", queued: 28, sent: 1180, delivered: 1116, failed: 18, retried: 46, acked: 734, success_rate: 95 },
    { channel: "webhook", label: "n8n Webhook", queued: 4, sent: 82, delivered: 80, failed: 1, retried: 3, acked: 72, success_rate: 98 },
    { channel: "voice", label: "Voice mock", queued: 6, sent: 322, delivered: 304, failed: 8, retried: 12, acked: 211, success_rate: 94 },
  ];
  return {
    generated_at: generatedAt,
    mode: "demo",
    scenario: "zone_3_fire",
    scenarios: [
      { scenario_id: "zone_3_fire", label: "Zone 3 fire evacuation" },
      { scenario_id: "gas_silent_floor", label: "Gas leak silent floor" },
      { scenario_id: "lockdown_partial_ack", label: "Lockdown with partial ack" },
      { scenario_id: "weather_mass_alert", label: "Mass weather alert" },
      { scenario_id: "responder_dispatch", label: "Responder dispatch success" },
    ],
    composer: {
      default_template_id: "fire_evacuation",
      default_audience_id: "zone_3",
      default_channels: ["in_app", "sms", "voice", "webhook"],
      severity: "critical",
    },
    channels,
    audiences: [
      { audience_id: "all_users", label: "All users", count: 1280, scope: "tenant", risk: "high" },
      { audience_id: "zone_3", label: "Zone 3 users", count: 428, scope: "zone", risk: "critical" },
      { audience_id: "responders", label: "Responders", count: 42, scope: "role", risk: "medium" },
      { audience_id: "executives", label: "Executives", count: 12, scope: "role", risk: "medium" },
    ],
    templates: [
      {
        template_id: "fire_evacuation",
        title: "Fire evacuation",
        severity: "critical",
        body: "Fire detected in Zone 3. Proceed to Exit B. Do not use elevators.",
        recommended_channels: ["in_app", "sms", "voice", "webhook"],
      },
      {
        template_id: "lockdown",
        title: "Lockdown",
        severity: "critical",
        body: "Lockdown active. Stay inside, silence devices, await verified instructions.",
        recommended_channels: ["in_app", "sms", "voice", "teams"],
      },
    ],
    response_counts: {
      safe: 318,
      need_help: 18,
      trapped: 6,
      evacuated: 241,
      on_route: 174,
      acknowledged: 872,
      silent: 86,
    },
    status_map: [
      { zone: "Kitchen Zone B", building: "Grand Meridian Hotel", acknowledged: 86, silent: 14, help_requests: 5, trapped: 2, evacuation_complete: 72, risk: "critical" },
      { zone: "Floor 3 East", building: "Grand Meridian Hotel", acknowledged: 92, silent: 8, help_requests: 3, trapped: 1, evacuation_complete: 81, risk: "high" },
      { zone: "Lobby", building: "Grand Meridian Hotel", acknowledged: 96, silent: 4, help_requests: 1, trapped: 0, evacuation_complete: 91, risk: "watch" },
    ],
    silence_escalations: [
      { escalation_id: "SIL-Z3-001", target: "Floor 3 West", silent_count: 23, last_channel: "sms", next_action: "Resend via voice + in-app", priority: "critical", owner: "Comms Desk" },
      { escalation_id: "SIL-KIT-002", target: "Kitchen Zone B", silent_count: 14, last_channel: "whatsapp", next_action: "Notify security manager for welfare check", priority: "high", owner: "Security Bravo" },
    ],
    feed: [
      { timestamp: generatedAt, event: "Fire evacuation broadcast", detail: "Zone 3 alert delivered across in-app, SMS, voice, and n8n webhook.", status: "delivered" },
      { timestamp: generatedAt, event: "Silence escalation armed", detail: "Floor 3 West silence rate remains above threshold.", status: "escalated" },
    ],
    analytics: {
      delivery_success_percent: 97,
      avg_ack_time: "1m 48s",
      silent_user_percent: 5,
      escalations_triggered: 2,
      help_requests_handled: 22,
      channel_performance: channels.map((channel) => ({
        channel: channel.label,
        success_rate: channel.success_rate,
        acked: channel.acked,
      })),
      zone_response_ranking: [
        { zone: "Lobby", acknowledged: 96, evacuation_complete: 91 },
        { zone: "Floor 3 East", acknowledged: 92, evacuation_complete: 81 },
      ],
    },
    trust: {
      population_reached: 2384,
      board_visibility: "live",
      public_risk_lowered: "34%",
      communication_confidence: 93,
      accountability_score: 96,
    },
    ledger: [
      { timestamp: generatedAt, event: "Communications OS local fallback", detail: "Local deterministic communications state loaded.", status: "verified" },
    ],
    summary: {
      active_broadcasts: 4,
      population_reached: 2384,
      acknowledged: 872,
      need_help: 18,
      trapped: 6,
      silent: 86,
      delivery_success_percent: 97,
    },
  };
}

export function normalizeChannels(channels: OpsCommsChannelId[]) {
  return channels.map((channel) => String(channel));
}
