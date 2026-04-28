from __future__ import annotations

from typing import Any

from app.behavior.store import behavior_store, utc_now_iso


def _clamp(value: float) -> int:
    return max(0, min(100, round(value)))


def panic_score(zone: dict[str, Any]) -> int:
    visible_exit_penalty = 100 - int(zone["visible_exits"])
    alarm_penalty = 100 - int(zone["alarm_clarity"])
    exit_pressure = max(0, int(zone["density"]) - int(zone["exits"]) * 12)
    return _clamp(
        int(zone["fire_severity"]) * 0.22
        + int(zone["smoke_level"]) * 0.18
        + alarm_penalty * 0.16
        + int(zone["density"]) * 0.16
        + visible_exit_penalty * 0.12
        + int(zone["time_pressure"]) * 0.1
        + int(zone["noise_level"]) * 0.05
        + int(zone["previous_alerts"]) * 2
        + exit_pressure * 0.08
    )


def freeze_score(zone: dict[str, Any]) -> int:
    return _clamp(
        (100 - int(zone["alarm_clarity"])) * 0.18
        + int(zone["conflicting_instructions"]) * 0.18
        + (100 - int(zone["visibility_score"])) * 0.18
        + int(zone["mobility_percent"]) * 0.18
        + (100 - int(zone["leadership_presence"])) * 0.16
        + int(zone["smoke_level"]) * 0.08
        + int(zone["density"]) * 0.04
    )


def compliance_scores(zone: dict[str, Any]) -> dict[str, int]:
    obey = _clamp(
        int(zone["alarm_clarity"]) * 0.28
        + int(zone["leadership_presence"]) * 0.24
        + int(zone["visible_exits"]) * 0.18
        + int(zone["visibility_score"]) * 0.14
        - int(zone["conflicting_instructions"]) * 0.16
        - int(zone["noise_level"]) * 0.07
        + 18
    )
    delay = _clamp(52 + freeze_score(zone) * 0.28 - obey * 0.18)
    ignore = _clamp(34 + int(zone["previous_alerts"]) * 5 + int(zone["conflicting_instructions"]) * 0.22 - obey * 0.28)
    opposite = _clamp(18 + (100 - int(zone["visible_exits"])) * 0.18 + int(zone["density"]) * 0.12 + int(zone["conflicting_instructions"]) * 0.26)
    return {
        "obey_immediately": obey,
        "delay_then_comply": delay,
        "ignore_warning": ignore,
        "move_opposite_direction": opposite,
    }


def vulnerability_score(zone: dict[str, Any]) -> int:
    age_factor = 16 if "elderly" in str(zone["avg_age_band"]).lower() else 10 if "families" in str(zone["avg_age_band"]).lower() else 4
    return _clamp(
        int(zone["mobility_percent"]) * 0.42
        + int(zone["population"]) / 38
        + int(zone["smoke_level"]) * 0.11
        + (100 - int(zone["visibility_score"])) * 0.13
        + age_factor
    )


def herd_score(zone: dict[str, Any]) -> int:
    return _clamp(
        int(zone["density"]) * 0.32
        + (100 - int(zone["visible_exits"])) * 0.2
        + int(zone["noise_level"]) * 0.14
        + int(zone["conflicting_instructions"]) * 0.16
        + (100 - int(zone["leadership_presence"])) * 0.12
    )


def bottleneck_score(zone: dict[str, Any]) -> int:
    persons_per_exit = int(zone["population"]) / max(1, int(zone["exits"]))
    return _clamp(persons_per_exit / 5 + int(zone["density"]) * 0.26 + herd_score(zone) * 0.24 + (100 - int(zone["visible_exits"])) * 0.12)


def communication_style(zone: dict[str, Any]) -> str:
    panic = panic_score(zone)
    freeze = freeze_score(zone)
    if int(zone["mobility_percent"]) >= 30:
        return "Clinical calm voice alert with responder escort and repeated bedside instructions"
    if panic >= 68:
        return "Authoritative command, bright directional arrows, and multilingual repetition"
    if freeze >= 58:
        return "Calm voice alert, staff leader presence, and simple one-step instructions"
    if herd_score(zone) >= 65:
        return "Split-flow signage, responder marshals, and exit balancing language"
    return "Clear directional message with calm confirmation loop"


def enrich_zone(zone: dict[str, Any]) -> dict[str, Any]:
    compliance = compliance_scores(zone)
    vulnerable_people = round(int(zone["population"]) * vulnerability_score(zone) / 100)
    return {
        **zone,
        "panic_score": panic_score(zone),
        "freeze_score": freeze_score(zone),
        "compliance": compliance,
        "vulnerability_score": vulnerability_score(zone),
        "vulnerable_occupants": vulnerable_people,
        "herd_score": herd_score(zone),
        "bottleneck_score": bottleneck_score(zone),
        "recommended_communication": communication_style(zone),
        "intervention": intervention_for_zone(zone),
        "explanation": explain_zone(zone),
    }


def intervention_for_zone(zone: dict[str, Any]) -> str:
    if vulnerability_score(zone) >= 62:
        return "Dispatch assistance team and preserve slow-mobility lane"
    if bottleneck_score(zone) >= 72:
        return "Open secondary exit flow and station responder marshal"
    if panic_score(zone) >= 66:
        return "Switch to authoritative voice command with visible leader cue"
    if freeze_score(zone) >= 56:
        return "Reduce instruction ambiguity and repeat a single action"
    return "Maintain calm guidance and monitor acknowledgement drift"


def explain_zone(zone: dict[str, Any]) -> str:
    drivers = []
    if int(zone["density"]) >= 80:
        drivers.append("high density")
    if int(zone["smoke_level"]) >= 30:
        drivers.append("smoke signal")
    if int(zone["alarm_clarity"]) < 65:
        drivers.append("alarm ambiguity")
    if int(zone["visible_exits"]) < 55:
        drivers.append("low exit visibility")
    if int(zone["mobility_percent"]) >= 20:
        drivers.append("mobility assistance")
    return f"{zone['name']} risk is driven by {', '.join(drivers) if drivers else 'stable guidance and visible exits'}."


class BehaviorService:
    def zones(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        return [enrich_zone(zone) for zone in behavior_store.zones(tenant_ids)]

    def summary(self, tenant_ids: list[str]) -> dict[str, Any]:
        zones = self.zones(tenant_ids)
        total_population = sum(int(zone["population"]) for zone in zones)
        weighted_risk = round(sum((zone["panic_score"] + zone["freeze_score"] + zone["bottleneck_score"]) / 3 * int(zone["population"]) for zone in zones) / max(1, total_population))
        highest = max(zones, key=lambda zone: zone["panic_score"] + zone["bottleneck_score"])
        compliance_avg = round(sum(zone["compliance"]["obey_immediately"] for zone in zones) / max(1, len(zones)))
        return {
            "generated_at": utc_now_iso(),
            "human_risk_score": weighted_risk,
            "panic_index": round(sum(zone["panic_score"] for zone in zones) / max(1, len(zones))),
            "freeze_risk": round(sum(zone["freeze_score"] for zone in zones) / max(1, len(zones))),
            "compliance_confidence": compliance_avg,
            "evacuation_confidence": _clamp(compliance_avg * 0.64 + (100 - weighted_risk) * 0.36),
            "vulnerable_occupants": sum(int(zone["vulnerable_occupants"]) for zone in zones),
            "bottleneck_risk": round(sum(zone["bottleneck_score"] for zone in zones) / max(1, len(zones))),
            "highest_risk_zone": highest["name"],
            "recommended_style": highest["recommended_communication"],
            "trust_score": 91,
            "population_modeled": total_population,
            "at_risk_population": round(total_population * weighted_risk / 100),
        }

    def panic(self, tenant_ids: list[str]) -> dict[str, Any]:
        zones = self.zones(tenant_ids)
        return {"global_panic_score": self.summary(tenant_ids)["panic_index"], "zones": [{"zone": zone["name"], "score": zone["panic_score"], "drivers": zone["explanation"]} for zone in zones]}

    def freeze(self, tenant_ids: list[str]) -> dict[str, Any]:
        zones = self.zones(tenant_ids)
        return {"global_freeze_score": self.summary(tenant_ids)["freeze_risk"], "zones": [{"zone": zone["name"], "score": zone["freeze_score"], "intervention": zone["intervention"]} for zone in zones]}

    def compliance(self, tenant_ids: list[str]) -> dict[str, Any]:
        zones = self.zones(tenant_ids)
        return {"zones": [{"zone": zone["name"], **zone["compliance"]} for zone in zones], "forecast": "Most zones comply after clear voice guidance; Food Court and Stadium Gate A need marshals."}

    def vulnerable(self, tenant_ids: list[str]) -> dict[str, Any]:
        zones = self.zones(tenant_ids)
        return {
            "total_vulnerable_occupants": self.summary(tenant_ids)["vulnerable_occupants"],
            "groups": [
                {"group": "mobility impaired", "count": sum(round(int(zone["population"]) * int(zone["mobility_percent"]) / 100) for zone in zones), "action": "Preserve slow-mobility lanes"},
                {"group": "children/families", "count": 156, "action": "Use calm parent-oriented instructions"},
                {"group": "isolated persons", "count": 42, "action": "Send responder sweep and app check-in"},
                {"group": "injured/high stress", "count": 31, "action": "Dispatch medical triage support"},
            ],
            "zones": [{"zone": zone["name"], "count": zone["vulnerable_occupants"], "score": zone["vulnerability_score"]} for zone in zones],
        }

    def recommendations(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        zones = self.zones(tenant_ids)
        ranked = sorted(zones, key=lambda zone: zone["panic_score"] + zone["freeze_score"] + zone["bottleneck_score"], reverse=True)
        recommendations = []
        for index, zone in enumerate(ranked[:6], start=1):
            recommendations.append(
                {
                    "recommendation_id": f"BEH-REC-{index:02d}",
                    "zone": zone["name"],
                    "priority": "critical" if index <= 2 else "high" if index <= 4 else "watch",
                    "message_style": zone["recommended_communication"],
                    "action": zone["intervention"],
                    "confidence": _clamp(96 - index * 4 + zone["compliance"]["obey_immediately"] * 0.08),
                    "why": zone["explanation"],
                }
            )
        return recommendations

    def delay_timeline(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        summary = self.summary(tenant_ids)
        return [
            {"time": "0-2 min", "risk": summary["panic_index"], "event": "Alarm interpretation and first movement split"},
            {"time": "2-5 min", "risk": summary["bottleneck_risk"], "event": "Exit choice convergence and herd pressure"},
            {"time": "5-10 min", "risk": summary["freeze_risk"], "event": "Hesitation pockets require responder prompts"},
            {"time": "10-20 min", "risk": max(18, summary["human_risk_score"] - 22), "event": "Residual vulnerable occupants need assisted sweep"},
        ]

    def trust_ledger(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        return [
            {"signal": "Occupancy and density", "confidence": 94, "explanation": "Derived from zone population, crowd density, and exit pressure."},
            {"signal": "Alarm clarity", "confidence": 89, "explanation": "Modeled from synchronized PA/mobile/signage quality."},
            {"signal": "Vulnerability estimate", "confidence": 86, "explanation": "Uses mobility percentage, age band, and visibility constraints."},
            {"signal": "Compliance forecast", "confidence": 84, "explanation": "Weighted by leadership presence, instruction clarity, and noise."},
        ]

    def executive(self, tenant_ids: list[str]) -> dict[str, Any]:
        summary = self.summary(tenant_ids)
        return {
            "generated_at": utc_now_iso(),
            "occupant_stability_score": _clamp(100 - summary["human_risk_score"] * 0.55),
            "panic_spread_risk": summary["panic_index"],
            "evacuation_confidence": summary["evacuation_confidence"],
            "at_risk_population": summary["at_risk_population"],
            "recommended_executive_actions": [
                "Authorize responder marshals for Food Court and Stadium Gate A",
                "Switch high-density zones to authoritative multilingual instructions",
                "Preserve ICU assisted evacuation lane and clinical quiet-alert posture",
                "Send public safety narrative emphasizing clear exits and staffed assistance",
            ],
            "public_safety_narrative": "Sentra is modeling human movement, hesitation, and assistance needs in real time so operators can prevent panic, reduce bottlenecks, and protect vulnerable occupants.",
        }

    def run(self, tenant_ids: list[str], scenario: str | None = None) -> dict[str, Any]:
        event = behavior_store.run(tenant_ids, scenario)
        return {"event": event, "summary": self.summary(tenant_ids), "recommendations": self.recommendations(tenant_ids)}


behavior_service = BehaviorService()

