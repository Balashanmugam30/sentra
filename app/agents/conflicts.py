from __future__ import annotations


def detect_agent_conflicts(council: dict[str, object], scenario: str) -> list[dict[str, object]]:
    agents = council["agents"]
    agent_map = {agent["name"]: agent for agent in agents}
    conflicts: list[dict[str, object]] = []

    fire = agent_map.get("Fire Commander AI")
    medical = agent_map.get("Medical Commander AI")
    security = agent_map.get("Security Commander AI")
    logistics = agent_map.get("Logistics Commander AI")
    executive = agent_map.get("Executive Strategy AI")
    comms = agent_map.get("Communications AI")

    if fire and medical and security:
        fire_zone = fire.get("priority_zone")
        medical_zone = medical.get("priority_zone")
        if fire_zone and medical_zone and fire_zone == medical_zone:
            conflicts.append(
                {
                    "conflict_type": "lockdown_vs_evacuation_access",
                    "title": "Fire containment vs medical corridor access",
                    "description": f"Fire wants hard control in {fire_zone} while medical needs a protected casualty lane.",
                    "parties": ["Fire Commander AI", "Medical Commander AI", "Security Commander AI"],
                }
            )

    if executive and fire and executive.get("status") in {"watch", "critical"} and fire.get("stance") == "urgent":
        conflicts.append(
            {
                "conflict_type": "continuity_vs_shutdown",
                "title": "Continuity posture vs shutdown pressure",
                "description": "Executive continuity goals compete with aggressive containment and shutdown actions.",
                "parties": ["Executive Strategy AI", "Fire Commander AI", "Security Commander AI"],
            }
        )

    if logistics and fire and logistics.get("priority_zone") and fire.get("priority_zone") and logistics.get("priority_zone") == fire.get("priority_zone"):
        conflicts.append(
            {
                "conflict_type": "resource_concentration_vs_coverage",
                "title": "Concentrated surge vs broader coverage",
                "description": "Logistics and fire both favor concentrating assets, risking thin coverage elsewhere.",
                "parties": ["Logistics Commander AI", "Fire Commander AI", "Medical Commander AI"],
            }
        )

    if comms and executive and (scenario == "comms_breakdown" or comms.get("confidence", 0) >= 70):
        conflicts.append(
            {
                "conflict_type": "alert_volume_vs_alert_fatigue",
                "title": "Alert cadence vs executive fatigue concerns",
                "description": "Communications wants higher cadence while executive strategy prefers tighter information control.",
                "parties": ["Communications AI", "Executive Strategy AI"],
            }
        )

    if scenario in {"resource_shortage", "dual_incident"}:
        conflicts.append(
            {
                "conflict_type": "cost_vs_response_strength",
                "title": "Mutual aid cost vs response strength",
                "description": "Escalating support improves resilience but increases executive cost and continuity impact.",
                "parties": ["Executive Strategy AI", "Logistics Commander AI", "Fire Commander AI"],
            }
        )

    if scenario in {"critical_fire", "gas_leak", "dual_incident"}:
        conflicts.append(
            {
                "conflict_type": "speed_vs_safety",
                "title": "Speed of lockdown vs safety of controlled movement",
                "description": "Rapid shutdown reduces spread risk but can compress evacuation and triage flow.",
                "parties": ["Security Commander AI", "Medical Commander AI", "Fire Commander AI"],
            }
        )

    seen: set[str] = set()
    unique_conflicts: list[dict[str, object]] = []
    for conflict in conflicts:
        if conflict["title"] in seen:
            continue
        seen.add(str(conflict["title"]))
        unique_conflicts.append(conflict)
    return unique_conflicts[:6]
