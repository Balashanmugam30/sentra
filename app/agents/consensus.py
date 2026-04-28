from __future__ import annotations


def build_consensus_result(
    council: dict[str, object],
    conflicts: list[dict[str, object]],
    scenario: str,
) -> dict[str, object]:
    agents = council["agents"]
    alignment = int(council["alignment_score"])
    avg_confidence = round(sum(agent["confidence"] for agent in agents) / max(len(agents), 1))
    urgency = len([agent for agent in agents if agent["stance"] == "urgent"])
    unresolved = max(len(conflicts) - 2, 0)
    consensus_score = max(
        0,
        min(100, round((alignment * 0.4) + (avg_confidence * 0.35) + (urgency * 6) - (unresolved * 8))),
    )

    if scenario == "critical_fire":
        winning_strategy = "approved controlled lockdown with protected medical corridor"
        final_plan = [
            "Approve controlled lockdown around the top fused fire zone",
            "Keep one protected medical corridor open for casualty movement",
            "Concentrate fire suppression and corridor security on the same priority zone",
            "Push executive and occupant updates in staggered cadence",
        ]
    elif scenario == "gas_leak":
        winning_strategy = "approved hvac shutdown and sector evacuation"
        final_plan = [
            "Approve sector evacuation before gas migration expands",
            "Execute HVAC shutdown in the affected sector with facility confirmation",
            "Stage medical readiness for smoke and exposure support",
            "Restrict corridor access while preserving responder lane",
        ]
    elif scenario == "mass_panic":
        winning_strategy = "approved crowd stabilization with protected exit lanes"
        final_plan = [
            "Protect exit lanes with security corridor control",
            "Sequence calming guidance before broad lockdown actions",
            "Push medical and responder staging near crowd pressure zones",
        ]
    elif scenario == "resource_shortage":
        winning_strategy = "conditional mutual aid and asset rebalancing"
        final_plan = [
            "Authorize targeted mutual aid for the highest pressure zone",
            "Rebalance drones and backup assets to preserve coverage",
            "Shift continuity posture to reduce noncritical load",
        ]
    elif scenario == "comms_breakdown":
        winning_strategy = "approved alternate-channel cadence recovery"
        final_plan = [
            "Move critical updates onto fallback communication channels",
            "Reduce duplicate alerts while preserving role-specific cadence",
            "Escalate executive briefings until queue backlog stabilizes",
        ]
    else:
        winning_strategy = "conditional dual-incident surge posture"
        final_plan = [
            "Split command focus between the top two threat domains",
            "Authorize mutual aid and preserve one medical corridor",
            "Move continuity posture to partial shutdown until alignment improves",
        ]

    support_count = 0
    participants: list[dict[str, object]] = []
    for agent in agents:
        initial_position = agent["top_recommendation"]
        concerns = [conflict["title"] for conflict in conflicts if agent["name"] in conflict["parties"]][:2]
        counterpoints = []
        for conflict in conflicts:
            if agent["name"] not in conflict["parties"]:
                continue
            if conflict["conflict_type"] == "lockdown_vs_evacuation_access":
                counterpoints.append("Preserve one controlled lane instead of total closure")
            elif conflict["conflict_type"] == "continuity_vs_shutdown":
                counterpoints.append("Temporary continuity reduction avoids larger recovery cost")
            elif conflict["conflict_type"] == "resource_concentration_vs_coverage":
                counterpoints.append("Concentrate surge assets while holding minimum backup coverage")
            elif conflict["conflict_type"] == "alert_volume_vs_alert_fatigue":
                counterpoints.append("Use role-targeted cadence rather than broad repeated alerts")
            elif conflict["conflict_type"] == "cost_vs_response_strength":
                counterpoints.append("Selective mutual aid beats delayed full collapse")
            elif conflict["conflict_type"] == "speed_vs_safety":
                counterpoints.append("Sequence protective closure after moving casualties")

        if agent["domain"] in {"medical_response", "security_control"} and scenario in {"critical_fire", "gas_leak", "dual_incident"}:
            revised_position = f"{initial_position} while keeping one protected medical lane open"
            final_vote = "conditional"
            confidence_after = max(0, min(100, agent["confidence"] + 2))
        elif agent["domain"] == "executive_strategy" and scenario in {"resource_shortage", "dual_incident"}:
            revised_position = "Support targeted mutual aid with continuity safeguards"
            final_vote = "conditional"
            confidence_after = max(0, min(100, agent["confidence"] + 1))
        else:
            revised_position = initial_position if scenario not in {"critical_fire", "gas_leak"} else initial_position.replace("Commit", "Coordinate")
            final_vote = "support" if consensus_score >= 70 else "conditional"
            confidence_after = max(0, min(100, agent["confidence"] + (3 if consensus_score >= 70 else -2 if len(concerns) > 1 else 1)))

        if final_vote == "support":
            support_count += 1
        participants.append(
            {
                "agent_id": agent["agent_id"],
                "name": agent["name"],
                "initial_position": initial_position,
                "concerns": concerns,
                "counterpoints": counterpoints[:2],
                "revised_position": revised_position,
                "final_vote": final_vote,
                "confidence_before": agent["confidence"],
                "confidence_after": confidence_after,
            }
        )

    if support_count >= 4:
        recommended_next_action = "approved"
    elif consensus_score >= 58:
        recommended_next_action = "conditional consensus"
    else:
        recommended_next_action = "escalate to governance override recommendation"

    executive_note = (
        "Council reached strong consensus after critique and revision rounds."
        if recommended_next_action == "approved"
        else "Council resolved core disagreements but retained conditional constraints."
        if recommended_next_action == "conditional consensus"
        else "Council remains split under severe urgency and recommends governance intervention."
    )

    return {
        "consensus_score": consensus_score,
        "winning_strategy": winning_strategy,
        "participants": participants,
        "final_plan": final_plan,
        "executive_note": executive_note,
        "recommended_next_action": recommended_next_action,
        "status": "resolved" if recommended_next_action != "escalate to governance override recommendation" else "active",
    }
