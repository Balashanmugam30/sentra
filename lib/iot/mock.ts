import type {
  IotAnalyticsResponse,
  IotCameraLatestResponse,
  IotEventRecord,
  IotFeedResponse,
  IotFleetResponse,
  IotHealthResponse,
  IotNode,
  IotSettingsResponse,
  IotThresholdsResponse,
} from "@/lib/iot/types";

const nowIso = () => new Date().toISOString();

export function buildMockIotNodes(): IotNode[] {
  return [
    {
      node_id: "utility_node_01",
      node_type: "utility_risk_node",
      label: "Utility Risk Node A",
      building: "Grand Meridian Hotel",
      zone: "Kitchen Zone B",
      install_location: "Kitchen gas utility wall",
      status: "online",
      last_heartbeat: nowIso(),
      wifi_rssi: -57,
      battery: null,
      risk_level: "SAFE",
      risk_score: 18,
      latest_telemetry: {
        event_id: "MOCK-IOT-001",
        node_id: "utility_node_01",
        timestamp: nowIso(),
        temperature: 32.4,
        humidity: 47,
        gas_level: 620,
        flame_detected: false,
        button_pressed: false,
        wifi_rssi: -57,
        battery: null,
        risk_level: "SAFE",
        risk_score: 18,
        triggers: [],
        action_status: "mock_backend_fallback",
        incident_id: null,
      },
      floor: "3",
      firmware_version: "edge-1.5.0",
      assigned_role: "gas_fire_monitoring",
      health_score: 94,
      latency_ms: 118,
      packet_success_rate: 99.2,
      uptime_percent: 99.6,
      false_alarm_count: 1,
      muted: false,
      disabled: false,
    },
    {
      node_id: "corridor_cam_01",
      node_type: "corridor_camera",
      label: "Corridor Verification Camera B",
      building: "Grand Meridian Hotel",
      zone: "Floor 3 Corridor",
      install_location: "Public corridor near stairwell entry",
      status: "online",
      last_heartbeat: nowIso(),
      wifi_rssi: -63,
      battery: null,
      risk_level: "SAFE",
      risk_score: 12,
      latest_telemetry: null,
      floor: "3",
      firmware_version: "cam-1.2.4",
      assigned_role: "public_area_verification",
      health_score: 88,
      latency_ms: 164,
      packet_success_rate: 97.8,
      uptime_percent: 98.9,
      false_alarm_count: 0,
      muted: false,
      disabled: false,
    },
    {
      node_id: "utility_node_02",
      node_type: "utility_risk_node",
      label: "Generator Room Node",
      building: "Grand Meridian Hotel",
      zone: "Generator Room",
      install_location: "Basement generator bay",
      status: "warning",
      last_heartbeat: nowIso(),
      wifi_rssi: -71,
      battery: 82,
      risk_level: "WARNING",
      risk_score: 46,
      latest_telemetry: {
        event_id: "MOCK-IOT-002",
        node_id: "utility_node_02",
        timestamp: nowIso(),
        temperature: 50.8,
        humidity: 42,
        gas_level: 1410,
        flame_detected: false,
        button_pressed: false,
        wifi_rssi: -71,
        battery: 82,
        risk_level: "WARNING",
        risk_score: 46,
        triggers: ["temperature_rising", "gas_elevated"],
        action_status: "mock_backend_fallback",
        incident_id: null,
      },
      floor: "B1",
      firmware_version: "edge-1.5.0",
      assigned_role: "heat_gas_monitoring",
      health_score: 79,
      latency_ms: 236,
      packet_success_rate: 95.4,
      uptime_percent: 97.2,
      false_alarm_count: 2,
      muted: false,
      disabled: false,
    },
  ];
}

export function buildMockIotSnapshot(): {
  fleet: IotFleetResponse;
  events: IotEventRecord[];
  camera: IotCameraLatestResponse;
  health: IotHealthResponse;
  feed: IotFeedResponse;
} {
  const nodes = buildMockIotNodes();
  const events = nodes.flatMap((node) => (node.latest_telemetry ? [node.latest_telemetry] : []));
  return {
    fleet: {
      generated_at: nowIso(),
      summary: {
        active_nodes: 3,
        offline_nodes: 0,
        critical_alerts: 0,
        avg_health_score: 87,
        avg_latency_ms: 173,
        total_events_today: 128,
        camera_nodes_online: 1,
        mode: "DEMO",
      },
      nodes,
    },
    events,
    camera: {
      node_id: "corridor_cam_01",
      label: "Corridor Verification Camera B",
      building: "Grand Meridian Hotel",
      zone: "Floor 3 Corridor",
      public_area_only: true,
      snapshot_url: "",
      stream_url: "",
      last_capture_at: null,
      status: "online",
    },
    health: {
      generated_at: nowIso(),
      fleet_health_score: 87,
      diagnostics: nodes.map((node) => ({
        node_id: node.node_id,
        label: node.label,
        health_score: node.health_score,
        status: node.status,
        signal: node.wifi_rssi,
        latency_ms: node.latency_ms,
        recommendation: node.health_score > 80 ? "Ready" : "Inspect placement and signal path",
      })),
    },
    feed: {
      generated_at: nowIso(),
      feed: events.map((event) => ({
        id: event.event_id,
        timestamp: event.timestamp,
        node_id: event.node_id,
        severity: event.risk_level,
        message: `${event.node_id} telemetry scored ${event.risk_level} at ${event.risk_score}/100`,
        kind: "telemetry",
      })),
    },
  };
}

export function buildMockThresholds(): IotThresholdsResponse {
  return {
    generated_at: nowIso(),
    presets: ["Hotel", "Hospital", "School", "Mall", "Office Tower"],
    thresholds: {
      gas_warning_threshold: 1350,
      gas_danger_threshold: 2350,
      temp_warning_threshold: 48,
      temp_critical_threshold: 62,
      flame_debounce_ms: 450,
      ultrasonic_blocked_distance_cm: 65,
      panic_hold_duration_ms: 900,
      buzzer_policy: "critical_only",
      preset: "Hotel",
    },
  };
}

export function buildMockAnalytics(): IotAnalyticsResponse {
  const points = Array.from({ length: 12 }, (_, index) => ({
    label: `${String(index * 2).padStart(2, "0")}:00`,
    value: 400 + ((index * 173) % 1100),
  }));
  return {
    generated_at: nowIso(),
    time_range: "24h",
    metrics: {
      hourly_incidents: 3,
      gas_trend_peak: 1489,
      temp_trend_peak: 51.2,
      busiest_zones: ["Kitchen Zone B", "Generator Room", "Floor 3 Corridor"],
      false_alarms: 3,
      offline_durations_minutes: 18,
      avg_response_time_seconds: 42,
      camera_request_frequency: 9,
    },
    series: {
      gas: points,
      temperature: points.map((point, index) => ({ ...point, value: 30 + ((index * 1.7) % 20) })),
      incidents: points.map((point, index) => ({ ...point, value: index % 5 === 0 ? 1 : 0 })),
    },
  };
}

export function buildMockSettings(): IotSettingsResponse {
  return {
    generated_at: nowIso(),
    settings: {
      polling_interval_ms: 7500,
      retention_days: 30,
      simulation_speed: 1,
      auto_refresh: true,
      node_timeout_seconds: 90,
      notification_rules: ["critical", "offline", "camera_request"],
      sound_enabled: true,
      export_csv: true,
      mode: "HYBRID",
    },
  };
}
