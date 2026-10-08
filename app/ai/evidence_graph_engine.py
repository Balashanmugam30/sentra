from __future__ import annotations

import math
from typing import List, Optional
from app.ai.intelligence_schemas import (
    ConflictEdge,
    CorroborationEdge,
    EvidenceGraph,
    EvidenceNode,
    ObservationNode,
    SourceNode,
    SourceType,
)


def build_evidence_graph_from_observations(
    sources: List[SourceNode],
    observations: List[ObservationNode],
) -> EvidenceGraph:
    """
    Constructs an Evidence DAG from multi-modal source observations.
    Calculates calibrated fused confidence, detects cross-sensor conflicts,
    and links corroboration chains.
    """
    if not observations:
        return EvidenceGraph(
            sources=sources,
            observations=[],
            evidence=[],
            corroborations=[],
            conflicts=[],
            fused_confidence=0.5,
            cross_modal_conflict_detected=False,
            conflict_summary="No observations present in telemetry buffer.",
        )

    sources_by_id = {s.id: s for s in sources}
    corroborations: List[CorroborationEdge] = []
    conflicts: List[ConflictEdge] = []

    # 1. Cross-modal comparison
    for i in range(len(observations)):
        for j in range(i + 1, len(observations)):
            obs_a = observations[i]
            obs_b = observations[j]
            src_a = sources_by_id.get(obs_a.source_id)
            src_b = sources_by_id.get(obs_b.source_id)

            # Different modalities (e.g., thermal vs particulate or camera vs sensor)
            is_cross_modal = (src_a and src_b and src_a.source_type != src_b.source_type)
            severity_diff = abs(obs_a.normalized_severity - obs_b.normalized_severity)

            if severity_diff <= 0.25:
                # Corroborating signals
                similarity = round(1.0 - severity_diff, 3)
                cross_factor = 1.25 if is_cross_modal else 1.0
                corroborations.append(
                    CorroborationEdge(
                        source_obs_id=obs_a.id,
                        target_obs_id=obs_b.id,
                        similarity_score=min(1.0, similarity),
                        cross_modal_factor=cross_factor,
                        corroboration_rationale=(
                            f"Modality {src_a.source_type.value if src_a else 'A'} corroborates "
                            f"{src_b.source_type.value if src_b else 'B'} with severity delta {round(severity_diff, 2)}"
                        ),
                    )
                )
            elif severity_diff >= 0.50:
                # Conflict / Contradiction between modalities
                discrepancy = round(severity_diff, 3)
                sev_level = "critical" if discrepancy > 0.7 else "high" if discrepancy > 0.6 else "moderate"
                conflicts.append(
                    ConflictEdge(
                        obs_a_id=obs_a.id,
                        obs_b_id=obs_b.id,
                        discrepancy_metric=discrepancy,
                        conflict_severity=sev_level,
                        explanation=(
                            f"Cross-modal anomaly: {obs_a.label} ({obs_a.raw_value}{obs_a.unit}) reports "
                            f"severity {obs_a.normalized_severity:.2f}, while {obs_b.label} ({obs_b.raw_value}{obs_b.unit}) "
                            f"reports {obs_b.normalized_severity:.2f}. Discrepancy delta: {discrepancy:.2f}."
                        ),
                    )
                )

    # 2. Cluster observations into Evidence Nodes
    evidence_nodes: List[EvidenceNode] = []
    # Primary thermal / combustion evidence
    thermal_obs = [o for o in observations if "thermal" in o.metric_type.lower() or "temperature" in o.metric_type.lower()]
    air_obs = [o for o in observations if "air" in o.metric_type.lower() or "particulate" in o.metric_type.lower() or "smoke" in o.label.lower()]
    optical_obs = [o for o in observations if "motion" in o.metric_type.lower() or "optical" in o.metric_type.lower() or "camera" in o.label.lower()]
    human_obs = [o for o in observations if "human" in o.metric_type.lower() or "voice" in o.metric_type.lower()]

    clusters = [
        ("EV-01", "Thermal Gradient Anomaly", SourceType.FLIR_THERMAL, thermal_obs),
        ("EV-02", "Atmospheric Particulate Combustion", SourceType.AIR_QUALITY, air_obs),
        ("EV-03", "Spatial Obstruction & Optical Verification", SourceType.CAMERA, optical_obs),
        ("EV-04", "Field Human Observations & Distress Reports", SourceType.HUMAN_REPORT, human_obs),
    ]

    for ev_id, title, prim_type, obs_group in clusters:
        if not obs_group:
            continue
        avg_conf = sum(o.confidence for o in obs_group) / len(obs_group)
        # Check if any observation in this group has active conflicts
        group_obs_ids = {o.id for o in obs_group}
        group_conflicts = [c for c in conflicts if c.obs_a_id in group_obs_ids or c.obs_b_id in group_obs_ids]
        conflict_penalty = min(0.35, len(group_conflicts) * 0.12)
        variance_penalty = 0.05 if len(obs_group) > 1 and max(o.normalized_severity for o in obs_group) - min(o.normalized_severity for o in obs_group) > 0.3 else 0.0

        calibrated_score = max(0.1, min(1.0, avg_conf - conflict_penalty - variance_penalty))

        status = "conflicted" if group_conflicts else "corroborated" if len(obs_group) > 1 else "verified"
        evidence_nodes.append(
            EvidenceNode(
                id=ev_id,
                title=title,
                description=f"Aggregated {len(obs_group)} telemetry streams across primary sector.",
                observation_ids=list(group_obs_ids),
                primary_source_type=prim_type,
                confidence_score=round(calibrated_score, 3),
                variance_penalty=round(variance_penalty, 3),
                conflict_score=round(conflict_penalty, 3),
                verification_status=status,
                provenance_chain=[o.source_id for o in obs_group],
            )
        )

    # 3. Compute overall fused confidence
    if evidence_nodes:
        base_fused = sum(e.confidence_score for e in evidence_nodes) / len(evidence_nodes)
    else:
        base_fused = sum(o.confidence for o in observations) / len(observations)

    # Cross-modal conflict dampening factor
    conflict_detected = len(conflicts) > 0
    conflict_dampener = 0.85 if conflict_detected else 1.0
    final_fused = max(0.05, min(0.99, base_fused * conflict_dampener))

    conflict_summary = (
        f"{len(conflicts)} sensor discrepancy detected: {conflicts[0].explanation}"
        if conflict_detected
        else "All multi-modal sensor streams corroborated within tolerance thresholds."
    )

    return EvidenceGraph(
        sources=sources,
        observations=observations,
        evidence=evidence_nodes,
        corroborations=corroborations,
        conflicts=conflicts,
        fused_confidence=round(final_fused, 3),
        cross_modal_conflict_detected=conflict_detected,
        conflict_summary=conflict_summary,
    )
