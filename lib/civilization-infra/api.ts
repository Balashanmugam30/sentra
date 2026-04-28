import { apiClient } from "@/lib/core/api-client";
import type {
  CivilizationLive,
  CivilizationMutationResponse,
  CivilizationScore,
  ContinuityBackbone,
  DisasterPrediction,
  EducationGrid,
  FoodSecurity,
  HealthcareNetwork,
  MegaCityOps,
  NationalGrid,
  TransportCommand,
  UtilityResilience,
  WaterCommand,
} from "@/lib/civilization-infra/types";

type CivilizationEnvelope<T> = {
  generated_at: string;
  data: T;
};

export function getCivilizationLive() {
  return apiClient.requestData<CivilizationLive>("/civilization/live", { cacheTtlMs: 10_000, priority: "normal" });
}

export function getCivilizationGrid() {
  return apiClient.requestData<CivilizationEnvelope<{ grid: NationalGrid; continuity: ContinuityBackbone }>>(
    "/civilization/grid",
    { cacheTtlMs: 18_000, priority: "normal" },
  );
}

export function getCivilizationCities() {
  return apiClient.requestData<CivilizationEnvelope<{ cities: MegaCityOps; education: EducationGrid }>>(
    "/civilization/cities",
    { cacheTtlMs: 18_000, priority: "normal" },
  );
}

export function getCivilizationUtilities() {
  return apiClient.requestData<CivilizationEnvelope<{ utilities: UtilityResilience; water: WaterCommand; food: FoodSecurity }>>(
    "/civilization/utilities",
    { cacheTtlMs: 18_000, priority: "normal" },
  );
}

export function getCivilizationTransport() {
  return apiClient.requestData<CivilizationEnvelope<TransportCommand>>("/civilization/transport", {
    cacheTtlMs: 18_000,
    priority: "normal",
  });
}

export function getCivilizationHealthcare() {
  return apiClient.requestData<CivilizationEnvelope<HealthcareNetwork>>("/civilization/healthcare", {
    cacheTtlMs: 18_000,
    priority: "normal",
  });
}

export function getCivilizationDisasters() {
  return apiClient.requestData<CivilizationEnvelope<DisasterPrediction>>("/civilization/disasters", {
    cacheTtlMs: 18_000,
    priority: "normal",
  });
}

export function getCivilizationScore() {
  return apiClient.requestData<CivilizationEnvelope<CivilizationScore>>("/civilization/score", {
    cacheTtlMs: 12_000,
    priority: "normal",
  });
}

export function runCivilizationContinuitySim() {
  return apiClient.requestData<CivilizationMutationResponse>("/civilization/run-continuity-sim", {
    body: { scenario: "cross_sector_continuity" },
    method: "POST",
    priority: "high",
  });
}

export function runCivilizationDisasterModel() {
  return apiClient.requestData<CivilizationMutationResponse>("/civilization/run-disaster-model", {
    body: { scenario: "compound_flood_grid_pressure" },
    method: "POST",
    priority: "high",
  });
}

export function generateCivilizationNationalBrief() {
  return apiClient.requestData<CivilizationMutationResponse>("/civilization/generate-national-brief", {
    body: { scenario: "national_continuity_brief" },
    method: "POST",
    priority: "high",
  });
}

