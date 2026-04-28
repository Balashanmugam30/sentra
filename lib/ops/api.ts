import { apiClient } from "@/lib/core/api-client";
import type {
  OpsCommunicationsSnapshot,
  OpsExecutionSnapshot,
  OpsGovernanceSnapshot,
  OpsObservabilitySnapshot,
  OpsRecoverySnapshot,
  OpsResourcesSnapshot,
  OpsExecutiveSnapshot,
  OpsResilienceSnapshot,
} from "@/lib/ops/types";

export async function getOpsObservability() {
  return apiClient.request<OpsObservabilitySnapshot>("/system/observability", {
    priority: "normal",
    cacheTtlMs: 10_000,
    staleWhileRevalidateMs: 60_000,
  });
}

export function getOpsExecution() {
  return apiClient.requestData<OpsExecutionSnapshot>("/ops/execution", {
    priority: "critical",
    cacheTtlMs: 5_000,
  });
}

export function runOpsExecution(scenarioId?: string) {
  return apiClient.requestData<OpsExecutionSnapshot>("/ops/execution/run", {
    method: "POST",
    body: { scenario_id: scenarioId },
    priority: "critical",
  });
}

export function approveOpsTask(taskId: string) {
  return apiClient.requestData<OpsExecutionSnapshot>("/ops/task/approve", {
    method: "POST",
    body: { task_id: taskId, reason: "Command approved governed execution task." },
    priority: "critical",
  });
}

export function reassignOpsTask(taskId: string, owner: string) {
  return apiClient.requestData<OpsExecutionSnapshot>("/ops/task/reassign", {
    method: "POST",
    body: { task_id: taskId, owner, reason: `Reassigned to ${owner}` },
    priority: "high",
  });
}

export function pauseOpsTask(taskId: string) {
  return apiClient.requestData<OpsExecutionSnapshot>("/ops/task/pause", {
    method: "POST",
    body: { task_id: taskId, reason: "Paused for human governance review." },
    priority: "high",
  });
}

export function closeOpsIncident(incidentId: string) {
  return apiClient.requestData<OpsExecutionSnapshot>("/ops/incident/close", {
    method: "POST",
    body: { incident_id: incidentId, reason: "Command requested verified incident closure." },
    priority: "critical",
  });
}

export function getOpsGovernance() {
  return apiClient.requestData<OpsGovernanceSnapshot>("/ops/governance", {
    priority: "critical",
    cacheTtlMs: 5_000,
  });
}

export function approveOpsGovernanceApproval(approvalId: string) {
  return apiClient.requestData<OpsGovernanceSnapshot>("/ops/approval/approve", {
    method: "POST",
    body: { approval_id: approvalId, reason: "Governance command approved action." },
    priority: "critical",
  });
}

export function rejectOpsGovernanceApproval(approvalId: string) {
  return apiClient.requestData<OpsGovernanceSnapshot>("/ops/approval/reject", {
    method: "POST",
    body: { approval_id: approvalId, reason: "Governance command rejected action." },
    priority: "critical",
  });
}

export function delegateOpsGovernanceApproval(approvalId: string, delegateTo: string) {
  return apiClient.requestData<OpsGovernanceSnapshot>("/ops/approval/delegate", {
    method: "POST",
    body: { approval_id: approvalId, delegate_to: delegateTo, reason: `Delegated to ${delegateTo}.` },
    priority: "high",
  });
}

export function escalateOpsGovernanceApproval(approvalId: string) {
  return apiClient.requestData<OpsGovernanceSnapshot>("/ops/approval/escalate", {
    method: "POST",
    body: { approval_id: approvalId, reason: "Escalated due governance SLA pressure." },
    priority: "critical",
  });
}

export function runOpsAutomationAction(actionId: string) {
  return apiClient.requestData<OpsGovernanceSnapshot>("/ops/automation/run", {
    method: "POST",
    body: { action_id: actionId, reason: "Automation run from governance OS." },
    priority: "high",
  });
}

export function getOpsCommunications() {
  return apiClient.requestData<OpsCommunicationsSnapshot>("/ops/communications", {
    priority: "critical",
    cacheTtlMs: 5_000,
  });
}

export function sendOpsCommunication(templateId: string, audienceId: string, channels: string[]) {
  return apiClient.requestData<OpsCommunicationsSnapshot>("/ops/communications/send", {
    method: "POST",
    body: {
      template_id: templateId,
      audience_id: audienceId,
      channels,
      reason: "Mass notification sent from Communications OS.",
    },
    priority: "critical",
  });
}

export function respondOpsCommunication(personId: string, response: string) {
  return apiClient.requestData<OpsCommunicationsSnapshot>("/ops/communications/respond", {
    method: "POST",
    body: {
      person_id: personId,
      response,
      reason: "Two-way communications response captured.",
    },
    priority: "critical",
  });
}

export function getOpsResources() {
  return apiClient.requestData<OpsResourcesSnapshot>("/ops/resources", {
    priority: "critical",
    cacheTtlMs: 5_000,
  });
}

export function dispatchOpsResource(incidentId: string, unitId?: string) {
  return apiClient.requestData<OpsResourcesSnapshot>("/ops/resources/dispatch", {
    method: "POST",
    body: {
      incident_id: incidentId,
      unit_id: unitId,
      reason: "Resource dispatched from Resource Command OS.",
    },
    priority: "critical",
  });
}

export function getOpsRecovery() {
  return apiClient.requestData<OpsRecoverySnapshot>("/ops/recovery", {
    priority: "critical",
    cacheTtlMs: 5_000,
  });
}

export function runOpsRecovery(scenarioId?: string) {
  return apiClient.requestData<OpsRecoverySnapshot>("/ops/recovery/run", {
    method: "POST",
    body: {
      scenario_id: scenarioId,
      reason: "Recovery workflow launched from Continuity OS.",
    },
    priority: "critical",
  });
}

export function approveOpsRecovery(gateId: string) {
  return apiClient.requestData<OpsRecoverySnapshot>("/ops/recovery/approve", {
    method: "POST",
    body: {
      gate_id: gateId,
      reason: "Reopen governance gate approved from Continuity OS.",
    },
    priority: "critical",
  });
}

export function getOpsResilience() {
  return apiClient.requestData<OpsResilienceSnapshot>("/ops/resilience", {
    priority: "critical",
    cacheTtlMs: 5_000,
  });
}

export function runOpsResilienceHeal(actionId: string) {
  return apiClient.requestData<OpsResilienceSnapshot>("/ops/resilience/heal", {
    method: "POST",
    body: {
      action_id: actionId,
      reason: "Self-heal action executed from Resilience OS.",
    },
    priority: "critical",
  });
}

export function getOpsExecutive() {
  return apiClient.requestData<OpsExecutiveSnapshot>("/ops/executive", {
    priority: "critical",
    cacheTtlMs: 5_000,
  });
}

export function runOpsExecutiveAction(actionId: string) {
  return apiClient.requestData<OpsExecutiveSnapshot>("/ops/executive/action", {
    method: "POST",
    body: {
      action_id: actionId,
      reason: "CEO action launched from Executive Operations OS.",
    },
    priority: "critical",
  });
}

export function runOpsExecutiveSimulation(optionId: string) {
  return apiClient.requestData<OpsExecutiveSnapshot>("/ops/executive/simulate", {
    method: "POST",
    body: {
      option_id: optionId,
      reason: "Board strategy simulation launched from Executive Operations OS.",
    },
    priority: "critical",
  });
}
