import type { DataHubGraph, DataHubPipelines, DataHubSummary } from "@/lib/data/types";

const pipelines = [
  {
    pipeline_id: "PIPE-INCIDENTS",
    tenant_id: "TEN-GRAND-MERIDIAN",
    name: "Incident Intelligence Warehouse",
    source: "incidents",
    destination: "sentra_lakehouse.incidents",
    rows_today: 18420,
    quality_score: 98,
    freshness_minutes: 3,
    privacy_tier: "sensitive",
    status: "healthy",
    dead_letters: 2,
    lineage: ["raw_incidents", "masked_events", "feature_store"],
  },
  {
    pipeline_id: "PIPE-SENSORS",
    tenant_id: "TEN-BALA-HOSP",
    name: "Sensor Stream ETL",
    source: "iot telemetry",
    destination: "sentra_lakehouse.telemetry",
    rows_today: 382000,
    quality_score: 96,
    freshness_minutes: 1,
    privacy_tier: "internal",
    status: "healthy",
    dead_letters: 5,
    lineage: ["mqtt_gateway", "dedupe", "feature_store"],
  },
  {
    pipeline_id: "PIPE-COMMS",
    tenant_id: "TEN-NOVA-MALL",
    name: "Communication Response Replay",
    source: "communications",
    destination: "sentra_lakehouse.comms",
    rows_today: 58200,
    quality_score: 94,
    freshness_minutes: 4,
    privacy_tier: "pii",
    status: "watch",
    dead_letters: 9,
    lineage: ["delivery_logs", "ack_events", "behavior_memory"],
  },
];

export const fallbackDataSummary: DataHubSummary = {
  data_moat_score: 92,
  pipeline_count: pipelines.length,
  avg_quality: 96,
  avg_freshness_minutes: 3,
  dead_letters: 16,
  tenant_isolation: "tenant_id scoped lakehouse partitions enforced",
  privacy_tiers: { sensitive: 1, internal: 1, pii: 1 },
  lineage_nodes: 9,
  graph_entities: 4,
  monetization_arr: 1820000,
  intelligence_products: [
    { product_id: "DATA-RISK-BENCH", name: "Industry Risk Benchmark", buyer: "Insurers", annual_value: 640000, privacy: "anonymized", status: "ready" },
    { product_id: "DATA-CITY-PACK", name: "City Readiness Intelligence Pack", buyer: "Smart cities", annual_value: 1180000, privacy: "aggregated", status: "pilot" },
  ],
  pipelines,
};

export const fallbackDataPipelines: DataHubPipelines = {
  pipelines,
  dead_letter_queues: pipelines.filter((pipeline) => pipeline.dead_letters > 4),
  replay_ready: pipelines,
  masking_enabled: 3,
};

export const fallbackDataGraph: DataHubGraph = {
  entities: [
    { entity_id: "ENT-ZONE-LOBBY", tenant_id: "TEN-GRAND-MERIDIAN", type: "zone", label: "Grand Meridian Lobby", linked_to: ["ENT-DEVICE-FIRE-8", "ENT-RISK-CROWD"], risk_score: 76, insight: "Lobby crowds amplify evacuation delay." },
    { entity_id: "ENT-DEVICE-FIRE-8", tenant_id: "TEN-GRAND-MERIDIAN", type: "device", label: "Fire panel Floor 8", linked_to: ["ENT-ZONE-LOBBY"], risk_score: 62, insight: "Device is upstream of three response automations." },
    { entity_id: "ENT-RISK-CROWD", tenant_id: "TEN-NOVA-MALL", type: "risk", label: "Crowd surge pattern", linked_to: ["ENT-ZONE-FOOD"], risk_score: 84, insight: "Food court incidents correlate with exit pressure." },
    { entity_id: "ENT-VENDOR-SMS", tenant_id: "TEN-NOVA-MALL", type: "vendor", label: "SMS provider", linked_to: ["ENT-RISK-CROWD"], risk_score: 41, insight: "Fallback provider reduces silence escalation risk." },
  ],
  hidden_dependencies: [],
  suspicious_patterns: [],
};
