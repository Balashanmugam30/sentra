"""Action Safety Gate: Deterministic server-side evaluation of operational action proposals."""

from __future__ import annotations

from datetime import datetime, timezone
import logging
from typing import Any, Dict, List, Optional, Tuple

from app.operations.domain import (
    ActionProposalRecord,
    ActionRiskLevel,
    ActionType,
    AutonomyMode,
    AutonomyState,
    SafetyDecision,
    compute_proposal_hash,
)

logger = logging.getLogger(__name__)

# Minimum fused evidence confidence required for irreversible or critical actions
MIN_CRITICAL_EVIDENCE_CONFIDENCE = 0.65

# Actions permissible for bounded auto-execution in Mode 3
MODE_3_PERMISSIBLE_ACTIONS = {
    ActionType.DIAGNOSTIC_PING,
    ActionType.READ_STATUS,
    ActionType.SENSOR_RECALIBRATION,
}


class ActionSafetyGate:
    """Evaluates action proposals deterministically prior to human approval and prior to dispatch."""

    def evaluate_proposal(
        self,
        proposal: ActionProposalRecord,
        autonomy_state: AutonomyState,
        evidence_confidence: float = 0.85,
        target_adapter_configured: bool = True,
        is_simulation: bool = False,
    ) -> Tuple[SafetyDecision, List[str]]:
        reasons: List[str] = []

        # 1. Simulation Isolation Check
        if is_simulation:
            reasons.append("Simulation mode active: execution confined to synthetic digital twin.")
            return SafetyDecision.SIMULATION_ONLY, reasons

        # 2. Emergency Kill Switch Check
        if autonomy_state.kill_switch_engaged:
            reasons.append(
                f"Emergency Kill Switch engaged by {autonomy_state.kill_switch_tripped_by or 'operator'}: "
                f"{autonomy_state.kill_switch_reason or 'Emergency shutdown active'}."
            )
            return SafetyDecision.DENY, reasons

        # 3. Autonomy Mode 0 Check
        if autonomy_state.mode == AutonomyMode.MODE_0_OBSERVE:
            reasons.append("Autonomy Mode 0 (OBSERVE) active: all physical and operational executions are forbidden.")
            return SafetyDecision.DENY, reasons

        # 4. Expiration Check
        now = datetime.now(timezone.utc)
        if now > proposal.expires_at:
            reasons.append(
                f"Proposal expired at {proposal.expires_at.isoformat()} (current UTC time: {now.isoformat()})."
            )
            return SafetyDecision.DENY, reasons

        # 5. Evidence Sufficiency Check
        if proposal.risk_level in {ActionRiskLevel.HIGH, ActionRiskLevel.CRITICAL}:
            if evidence_confidence < MIN_CRITICAL_EVIDENCE_CONFIDENCE:
                reasons.append(
                    f"Evidence confidence ({evidence_confidence:.2f}) is below the required safety threshold "
                    f"({MIN_CRITICAL_EVIDENCE_CONFIDENCE:.2f}) for high-risk action."
                )
                return SafetyDecision.REQUIRE_ADDITIONAL_EVIDENCE, reasons

        # 6. Proposal Hash Integrity Check (if already approved)
        if proposal.approved_by is not None:
            current_hash = compute_proposal_hash(
                proposal.action_type.value,
                proposal.target_zone,
                proposal.parameters,
                proposal.incident_id,
                proposal.tenant_id,
            )
            if proposal.approval_hash != current_hash:
                reasons.append(
                    f"Proposal hash mismatch: approved hash ({proposal.approval_hash}) does not match "
                    f"current payload hash ({current_hash}). Proposal parameters were modified post-approval."
                )
                return SafetyDecision.DENY, reasons

        # 7. Two-Person Integrity / Separation of Proposer & Approver Check
        if proposal.approved_by is not None:
            if proposal.approved_by == proposal.proposer_id:
                reasons.append(
                    f"Two-person integrity violation: Proposer '{proposal.proposer_id}' cannot approve own proposal."
                )
                return SafetyDecision.DENY, reasons
            if proposal.proposer_role == "ai_agent" and proposal.approved_by.startswith("system_"):
                reasons.append("AI / System agents cannot authorize operational actions on behalf of human operators.")
                return SafetyDecision.DENY, reasons

        # 8. Autonomy Mode 3 (Bounded Automation) Check
        if autonomy_state.mode == AutonomyMode.MODE_3_BOUNDED_AUTOMATION:
            if proposal.action_type in MODE_3_PERMISSIBLE_ACTIONS and proposal.risk_level == ActionRiskLevel.LOW:
                reasons.append("Low-risk reversible action approved automatically under Mode 3 (Bounded Automation).")
                return SafetyDecision.ALLOW_READ_ONLY, reasons
            # High-impact actions in Mode 3 still require human approval
            if proposal.approved_by is None:
                reasons.append("High-impact action in Mode 3 requires explicit human operator authorization.")
                return SafetyDecision.REQUIRE_HUMAN_APPROVAL, reasons

        # 9. Autonomy Mode 1 & 2 Human Approval Requirement
        if proposal.approved_by is None:
            reasons.append(f"Action requires explicit operator approval in {autonomy_state.mode.value}.")
            return SafetyDecision.REQUIRE_HUMAN_APPROVAL, reasons

        # 10. Target Adapter Availability Check
        if not target_adapter_configured:
            reasons.append("NO REAL DISPATCH ADAPTER CONFIGURED for this target system.")
            return SafetyDecision.UNAVAILABLE, reasons

        reasons.append("Deterministic safety policy validated: human authorization verified with matching hash.")
        return SafetyDecision.ALLOW_RECOMMENDATION, reasons


safety_gate = ActionSafetyGate()
