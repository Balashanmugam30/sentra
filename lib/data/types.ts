export type DataPipeline = {
  pipeline_id: string;
  tenant_id: string;
  name: string;
  source: string;
  destination: string;
  rows_today: number;
  quality_score: number;
  freshness_minutes: number;
  privacy_tier: string;
  status: string;
  dead_letters: number;
  lineage: string[];
};

export type GraphEntity = {
  entity_id: string;
  tenant_id: string;
  type: string;
  label: string;
  linked_to: string[];
  risk_score: number;
  insight: string;
};

export type DataMonetizationProduct = {
  product_id: string;
  name: string;
  buyer: string;
  annual_value: number;
  privacy: string;
  status: string;
};

export type DataHubSummary = {
  data_moat_score: number;
  pipeline_count: number;
  avg_quality: number;
  avg_freshness_minutes: number;
  dead_letters: number;
  tenant_isolation: string;
  privacy_tiers: Record<string, number>;
  lineage_nodes: number;
  graph_entities: number;
  monetization_arr: number;
  intelligence_products: DataMonetizationProduct[];
  pipelines: DataPipeline[];
};

export type DataHubPipelines = {
  pipelines: DataPipeline[];
  dead_letter_queues: DataPipeline[];
  replay_ready: DataPipeline[];
  masking_enabled: number;
};

export type DataHubGraph = {
  entities: GraphEntity[];
  hidden_dependencies: GraphEntity[];
  suspicious_patterns: GraphEntity[];
};

export type DataHubEnvelope<T> = {
  generated_at: string;
  data: T;
};
