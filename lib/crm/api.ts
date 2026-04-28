import { apiClient } from "@/lib/core/api-client";
import type {
  ActivitiesResponse,
  ActivityLogPayload,
  CrmForecast,
  CrmMutationResponse,
  DealCreatePayload,
  DealStage,
  DealsResponse,
  DemoBookPayload,
  DemosResponse,
  GrowthMetrics,
  LeadCreatePayload,
  LeadScoringResponse,
  LeadsResponse,
} from "@/lib/crm/types";

export function getCrmLeads() {
  return apiClient.requestData<LeadsResponse>("/crm/leads", {
    priority: "normal",
    cacheTtlMs: 8_000,
  });
}

export function getCrmDeals() {
  return apiClient.requestData<DealsResponse>("/crm/deals", {
    priority: "normal",
    cacheTtlMs: 8_000,
  });
}

export function getCrmActivities() {
  return apiClient.requestData<ActivitiesResponse>("/crm/activities", {
    priority: "low",
    cacheTtlMs: 12_000,
  });
}

export function getCrmDemos() {
  return apiClient.requestData<DemosResponse>("/crm/demos", {
    priority: "normal",
    cacheTtlMs: 12_000,
  });
}

export function getCrmForecast() {
  return apiClient.requestData<CrmForecast>("/crm/forecast", {
    priority: "normal",
    cacheTtlMs: 10_000,
  });
}

export function getCrmScoring() {
  return apiClient.requestData<LeadScoringResponse>("/crm/scoring", {
    priority: "normal",
    cacheTtlMs: 10_000,
  });
}

export function getCrmMetrics() {
  return apiClient.requestData<GrowthMetrics>("/crm/metrics", {
    priority: "normal",
    cacheTtlMs: 12_000,
  });
}

export function createCrmLead(payload: LeadCreatePayload) {
  return apiClient.requestData<CrmMutationResponse>("/crm/leads/create", {
    method: "POST",
    body: payload,
    priority: "high",
  });
}

export function createCrmDeal(payload: DealCreatePayload) {
  return apiClient.requestData<CrmMutationResponse>("/crm/deals/create", {
    method: "POST",
    body: payload,
    priority: "high",
  });
}

export function moveCrmDealStage(dealId: string, stage: DealStage) {
  return apiClient.requestData<CrmMutationResponse>(`/crm/deals/${dealId}/move-stage`, {
    method: "POST",
    body: { stage },
    priority: "high",
  });
}

export function logCrmActivity(payload: ActivityLogPayload) {
  return apiClient.requestData<CrmMutationResponse>("/crm/activity/log", {
    method: "POST",
    body: payload,
    priority: "high",
  });
}

export function bookCrmDemo(payload: DemoBookPayload) {
  return apiClient.requestData<CrmMutationResponse>("/crm/demos/book", {
    method: "POST",
    body: payload,
    priority: "high",
  });
}
