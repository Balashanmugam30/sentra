export type GovernmentLiveResponse = {
  generated_at: string;
  national_readiness: number;
  cyber_defense: number;
  medical_surge_capacity: number;
  grid_stability: number;
  airports_protected: number;
  ports_protected: number;
  states_connected: number;
  active_agencies: number;
  threat_level: string;
  recovery_confidence: number;
  border_integrity: number;
  continuity_readiness: number;
};

export type GovernmentMutationResponse = {
  ok: boolean;
  message: string;
  data: Record<string, unknown>;
};
