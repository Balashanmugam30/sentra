"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GlassCard,
  GlassPanel,
  Button,
  StatusBadge,
  ConfidenceIndicator,
} from "@/components/ui";
import type {
  ActionProposal,
  IncidentCommanderAssessment,
  SpecialistAgentAssessment,
} from "@/lib/ai/intelligence-types";
import {
  fetchIncidentIntelligence,
  submitProposalReview,
} from "@/lib/ai/intelligence-service";

interface IncidentIntelligencePanelProps {
  incidentId: string;
  incidentTitle?: string;
  incidentLocation?: string;
}

export function IncidentIntelligencePanel({
  incidentId,
  incidentTitle = "Active Thermal Gradient Anomaly",
  incidentLocation = "Research Wing B - Sector 4",
}: IncidentIntelligencePanelProps) {
  const [assessment, setAssessment] = useState<IncidentCommanderAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<"graph" | "agents" | "proposals" | "citations">("graph");
  const [actionProcessingId, setActionProcessingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchIncidentIntelligence(incidentId, incidentTitle, incidentLocation)
      .then((data) => {
        if (isMounted) {
          setAssessment(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [incidentId, incidentTitle, incidentLocation]);

  const handleReview = async (proposalId: string, decision: "approve" | "reject") => {
    if (!assessment) return;
    setActionProcessingId(proposalId);
    try {
      const updated = await submitProposalReview(proposalId, {
        operator_id: "USR-BALA-HQ",
        operator_name: "Operations Commander Bala",
        decision,
        rejection_reason: decision === "reject" ? "Operation deferred by incident commander." : undefined,
      });

      setAssessment((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          action_proposals: prev.action_proposals.map((p) =>
            p.id === proposalId ? updated : p
          ),
        };
      });

      setStatusMessage(
        decision === "approve"
          ? `Proposal ${proposalId} AUTHORIZED. Command dispatch order transmitted.`
          : `Proposal ${proposalId} DECLINED by human incident commander.`
      );
      setTimeout(() => setStatusMessage(null), 5000);
    } finally {
      setActionProcessingId(null);
    }
  };

  if (loading && !assessment) {
    return (
      <GlassPanel tier="elevated" className="flex min-h-[300px] flex-col items-center justify-center p-8 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
        <p className="mt-4 font-mono text-xs uppercase tracking-widest text-cyan-300">
          Synthesizing Multimodal Evidence & AI Council...
        </p>
      </GlassPanel>
    );
  }

  if (!assessment) return null;

  const { evidence_graph: graph, action_proposals: proposals, specialist_debates: debates, citations } = assessment;

  return (
    <div className="space-y-5" data-testid="incident-intelligence-panel">
      {/* Top Banner: Commander Synthesis & Threat Gauge */}
      <GlassPanel tier="elevated" className="relative overflow-hidden p-6 border-cyan-500/30">
        <div className="absolute right-0 top-0 h-32 w-32 bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded bg-rose-500/20 px-2 py-0.5 font-mono text-[11px] font-bold uppercase text-rose-300 ring-1 ring-rose-500/40">
                AI COMMANDER: {assessment.threat_level} THREAT
              </span>
              <span
                className={`rounded px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${
                  assessment.inference_source === "GEMINI_LIVE_INFERENCE"
                    ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30"
                    : "bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/30"
                }`}
              >
                {assessment.inference_source === "GEMINI_LIVE_INFERENCE"
                  ? "⚡ GEMINI 2.5 FLASH LIVE INFERENCE"
                  : "🛡️ DETERMINISTIC FALLBACK MODE"}
              </span>
              <span className="font-mono text-xs text-white/40">
                Latency: {Math.round(assessment.latency_ms)}ms
              </span>
            </div>

            <h3 className="text-xl font-semibold tracking-tight text-white">
              Executive Situation Assessment
            </h3>
            <p className="text-sm leading-relaxed text-white/80 max-w-3xl">
              {assessment.executive_summary}
            </p>
          </div>

          <div className="flex flex-col items-end gap-1.5 self-start sm:self-auto">
            <span className="text-[11px] uppercase tracking-wider text-white/45">Fused Confidence</span>
            <ConfidenceIndicator score={Math.round(assessment.consensus_score * 100)} size="lg" />
            <span className="font-mono text-[10px] text-cyan-300">
              Cross-Modal Consensus: {Math.round(graph.fused_confidence * 100)}%
            </span>
          </div>
        </div>

        {/* Conflict Alert Banner if detected */}
        {graph.cross_modal_conflict_detected && (
          <div className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3.5 text-xs text-amber-200">
            <div className="flex items-center gap-2 font-semibold uppercase tracking-wider">
              <span>⚠️ Cross-Modal Telemetry Discrepancy Detected</span>
            </div>
            <p className="mt-1 text-white/80">{graph.conflict_summary}</p>
          </div>
        )}

        {/* Action Status Notification */}
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-xl border border-cyan-400/40 bg-cyan-950/60 p-3 text-xs font-medium text-cyan-200"
          >
            {statusMessage}
          </motion.div>
        )}

        {/* Intelligence Sub-Navigation Tabs */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={() => setActiveSubTab("graph")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
              activeSubTab === "graph"
                ? "bg-cyan-500/20 text-cyan-200 ring-1 ring-cyan-500/30"
                : "text-white/60 hover:bg-white/5 hover:text-white"
            }`}
          >
            Evidence Graph DAG ({graph.evidence.length} Nodes)
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab("agents")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
              activeSubTab === "agents"
                ? "bg-cyan-500/20 text-cyan-200 ring-1 ring-cyan-500/30"
                : "text-white/60 hover:bg-white/5 hover:text-white"
            }`}
          >
            Specialist Agents ({debates.length} Roles)
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab("proposals")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
              activeSubTab === "proposals"
                ? "bg-cyan-500/20 text-cyan-200 ring-1 ring-cyan-500/30"
                : "text-white/60 hover:bg-white/5 hover:text-white"
            }`}
          >
            Human Approval Gate ({proposals.length} Proposals)
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab("citations")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
              activeSubTab === "citations"
                ? "bg-cyan-500/20 text-cyan-200 ring-1 ring-cyan-500/30"
                : "text-white/60 hover:bg-white/5 hover:text-white"
            }`}
          >
            RAG SOP Citations ({citations.length} Standards)
          </button>
        </div>
      </GlassPanel>

      {/* Tab 1: Evidence Graph DAG */}
      {activeSubTab === "graph" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/70">
              Topological Evidence Lineage (Sources → Observations → Fused Evidence)
            </h4>
            <span className="font-mono text-xs text-white/40">
              {graph.sources.length} Sources | {graph.observations.length} Observations | {graph.corroborations.length} Links
            </span>
          </div>

          <div className="grid gap-3.5 md:grid-cols-3">
            {graph.evidence.map((ev) => (
              <GlassCard
                key={ev.id}
                tier="subtle"
                className="flex flex-col justify-between p-4 border-white/10 hover:border-cyan-400/30"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-cyan-300">{ev.id}</span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                        ev.verification_status === "corroborated"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : ev.verification_status === "conflicted"
                          ? "bg-amber-500/20 text-amber-300"
                          : "bg-cyan-500/20 text-cyan-200"
                      }`}
                    >
                      {ev.verification_status}
                    </span>
                  </div>

                  <h5 className="text-sm font-semibold text-white">{ev.title}</h5>
                  <p className="text-xs text-white/70">{ev.description}</p>
                </div>

                <div className="mt-4 border-t border-white/5 pt-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/45">Calibrated Confidence</span>
                    <span className="font-mono font-semibold text-cyan-300">
                      {Math.round(ev.confidence_score * 100)}%
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-white/40">
                    <span>Source: {ev.primary_source_type}</span>
                    <span>Provenance: {ev.provenance_chain.join(", ")}</span>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Raw Ingestion Feed Summary */}
          <GlassPanel tier="subtle" className="p-4">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-2">
              Ingested Observation Nodes & Modality Telemetry
            </h5>
            <div className="divide-y divide-white/5">
              {graph.observations.map((obs) => (
                <div key={obs.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white/80">{obs.id}</span>
                    <span className="text-white/60">[{obs.metric_type}]</span>
                    <span className="text-white font-medium">{obs.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-amber-300">
                      {obs.raw_value} {obs.unit}
                    </span>
                    <span className="font-mono text-white/50">
                      Severity: {Math.round(obs.normalized_severity * 100)}%
                    </span>
                    <span className="font-mono text-cyan-300">
                      Certainty: {Math.round(obs.confidence * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>
      )}

      {/* Tab 2: Specialist Agent Deliberation */}
      {activeSubTab === "agents" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/70">
              Multi-Agent Specialist Deliberation & Rationale
            </h4>
            <span className="font-mono text-xs text-white/40">
              5 Specialist Roles Active
            </span>
          </div>

          <div className="grid gap-3.5 md:grid-cols-2">
            {debates.map((agent) => (
              <GlassCard
                key={agent.agent_id}
                tier="subtle"
                className="flex flex-col justify-between p-5 border-white/10"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-base font-semibold text-white">{agent.role}</h5>
                      <span className="font-mono text-[10px] text-white/40">{agent.agent_id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-white/10 px-2 py-0.5 font-mono text-[10px] font-bold text-white/70">
                        SEV-{agent.severity_rating}
                      </span>
                      <ConfidenceIndicator score={Math.round(agent.confidence * 100)} size="sm" />
                    </div>
                  </div>

                  <p className="text-xs leading-relaxed text-white/80">
                    {agent.rationale}
                  </p>

                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-wider text-white/45">Proposed Immediate Tactics</p>
                    <ul className="list-disc list-inside space-y-0.5 text-xs text-cyan-200">
                      {agent.proposed_actions.map((act, idx) => (
                        <li key={idx}>{act}</li>
                      ))}
                    </ul>
                  </div>

                  {agent.dissent_or_caveats && (
                    <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-2.5 text-[11px] text-amber-200/90">
                      <span className="font-semibold uppercase text-amber-300">Operational Caveat: </span>
                      {agent.dissent_or_caveats}
                    </div>
                  )}
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Action Proposals & Human Approval Gate */}
      {activeSubTab === "proposals" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/70">
              Mandatory Human Safety Boundary — Operational Action Proposals
            </h4>
            <span className="text-xs text-rose-300">
              ⚠️ Physical intervention requires verified operator authorization
            </span>
          </div>

          <div className="space-y-3">
            {proposals.map((proposal) => {
              const isPending = proposal.approval_status === "pending_review";
              const isApproved = proposal.approval_status === "approved";
              const isRejected = proposal.approval_status === "rejected";

              return (
                <GlassPanel
                  key={proposal.id}
                  tier="elevated"
                  className={`flex flex-col justify-between gap-4 p-5 transition-all ${
                    isPending
                      ? "border-amber-400/40 bg-amber-500/[0.03]"
                      : isApproved
                      ? "border-emerald-400/40 bg-emerald-500/[0.03]"
                      : "border-rose-400/40 bg-rose-500/[0.03]"
                  }`}
                >
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div className="space-y-1.5 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-white">{proposal.id}</span>
                        <span
                          className={`rounded px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${
                            isPending
                              ? "bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40"
                              : isApproved
                              ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40"
                              : "bg-rose-500/20 text-rose-300 ring-1 ring-rose-500/40"
                          }`}
                        >
                          {isPending
                            ? "⏳ PENDING OPERATOR SIGN-OFF"
                            : isApproved
                            ? "✅ AUTHORIZED & DISPATCHED"
                            : "❌ REJECTED BY COMMANDER"}
                        </span>
                        <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-white/70">
                          PRIORITY: {proposal.priority}
                        </span>
                        <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-white/70">
                          RISK: {proposal.risk_level}
                        </span>
                      </div>

                      <h5 className="text-base font-semibold text-white tracking-tight">
                        {proposal.title}
                      </h5>
                      <p className="text-xs leading-relaxed text-white/80">
                        {proposal.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-white/50">
                        <span>Target: <strong className="text-white/80">{proposal.target_zone}</strong></span>
                        <span>Role Required: <strong className="text-white/80">{proposal.requires_operator_role}</strong></span>
                        <span>SOPs: <strong className="text-cyan-300">{proposal.sop_citations.join(", ")}</strong></span>
                      </div>

                      {proposal.approved_by && (
                        <p className="text-[11px] font-mono text-emerald-300">
                          Sign-off verified: {proposal.approved_by} at {proposal.approved_at}
                        </p>
                      )}
                    </div>

                    {/* Operator Approval Action Buttons */}
                    <div className="flex flex-col gap-2 self-end sm:self-auto min-w-[160px]">
                      {isPending ? (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            disabled={actionProcessingId === proposal.id}
                            onClick={() => handleReview(proposal.id, "approve")}
                          >
                            {actionProcessingId === proposal.id ? "Authorizing..." : "Authorize & Execute"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={actionProcessingId === proposal.id}
                            onClick={() => handleReview(proposal.id, "reject")}
                          >
                            Reject Proposal
                          </Button>
                        </>
                      ) : (
                        <div className="text-right font-mono text-xs text-white/50">
                          {isApproved ? "Command Logged #SEC-EXEC" : "Command Cancelled"}
                        </div>
                      )}
                    </div>
                  </div>
                </GlassPanel>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: RAG SOP Citations */}
      {activeSubTab === "citations" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/70">
              Verifiable Emergency Standard Operating Procedures (RAG Knowledge Engine)
            </h4>
            <span className="font-mono text-xs text-white/40">
              Tenant Isolated | Multi-Agency Verified
            </span>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {citations.map((cit) => (
              <GlassCard
                key={cit.chunk_id}
                tier="subtle"
                className="flex flex-col justify-between p-4 border-white/10"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-cyan-300">{cit.standard}</span>
                    <span className="font-mono text-[10px] text-white/40">
                      Relevance: {Math.round(cit.relevance_score * 100)}%
                    </span>
                  </div>

                  <h5 className="text-sm font-semibold text-white">{cit.title}</h5>
                  <span className="inline-block text-[11px] font-medium text-white/50">{cit.section}</span>
                  <p className="text-xs leading-relaxed text-white/70 border-l-2 border-cyan-500/40 pl-2.5 mt-2">
                    &ldquo;{cit.excerpt}&rdquo;
                  </p>
                </div>

                <div className="mt-4 border-t border-white/5 pt-2 text-[10px] font-mono text-white/40">
                  Chunk: {cit.chunk_id}
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
