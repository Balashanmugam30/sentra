import { apiClient } from "@/lib/core/api-client";
import type {
  SubmissionArchitecture,
  SubmissionDeck,
  SubmissionDemoScriptState,
  SubmissionDocs,
  SubmissionEnvelope,
  SubmissionImpact,
  SubmissionJudges,
  SubmissionMutationResponse,
  SubmissionScore,
  SubmissionSummary,
  SubmissionTeamState,
} from "@/lib/submission/types";

export function getSubmissionSummary() {
  return apiClient.requestData<SubmissionEnvelope<SubmissionSummary>>("/submission/summary", { priority: "critical", cacheTtlMs: 15_000 });
}

export function getSubmissionDeck(template = "investor") {
  return apiClient.requestData<SubmissionEnvelope<SubmissionDeck>>(`/submission/deck?template=${encodeURIComponent(template)}`, { priority: "high", cacheTtlMs: 15_000 });
}

export function getSubmissionDocs() {
  return apiClient.requestData<SubmissionEnvelope<SubmissionDocs>>("/submission/docs", { priority: "high", cacheTtlMs: 15_000 });
}

export function getSubmissionJudges() {
  return apiClient.requestData<SubmissionEnvelope<SubmissionJudges>>("/submission/judges", { priority: "high", cacheTtlMs: 15_000 });
}

export function getSubmissionImpact() {
  return apiClient.requestData<SubmissionEnvelope<SubmissionImpact>>("/submission/impact", { priority: "high", cacheTtlMs: 15_000 });
}

export function getSubmissionScore() {
  return apiClient.requestData<SubmissionEnvelope<SubmissionScore>>("/submission/score", { priority: "critical", cacheTtlMs: 15_000 });
}

export function getSubmissionArchitecture() {
  return apiClient.requestData<SubmissionEnvelope<SubmissionArchitecture>>("/submission/architecture", { priority: "normal", cacheTtlMs: 15_000 });
}

export function getSubmissionDemoScript() {
  return apiClient.requestData<SubmissionEnvelope<SubmissionDemoScriptState>>("/submission/demo-script", { priority: "normal", cacheTtlMs: 15_000 });
}

export function getSubmissionTeam() {
  return apiClient.requestData<SubmissionEnvelope<SubmissionTeamState>>("/submission/team", { priority: "normal", cacheTtlMs: 15_000 });
}

export function generateSubmissionPack(mode = "google_solution_challenge", artifact = "submission_pack") {
  return apiClient.requestData<SubmissionMutationResponse>("/submission/generate", {
    method: "POST",
    priority: "high",
    body: { mode, artifact, reason: "Phase 29.B submission pack generation" },
  });
}

export function exportSubmissionArtifact(format = "pdf", artifact = "deck") {
  return apiClient.requestData<SubmissionMutationResponse>("/submission/export", {
    method: "POST",
    priority: "high",
    body: { format, artifact, reason: "Phase 29.B one-click export" },
  });
}
