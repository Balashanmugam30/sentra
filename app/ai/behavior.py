from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from app.ai.decision_engine import build_autonomous_snapshot
from app.ai.strategic_learning import build_trust_dashboard, build_weak_signals
from app.osint.engine import build_osint_live_snapshot
from app.public_safety.engine import build_public_safety_live_snapshot
from app.services.incident_service import get_all_incidents


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _clamp(value: float, minimum: int = 0, maximum: int = 100) -> int:
    return max(minimum, min(maximum, round(value)))


def _safe_snapshot(builder, fallback: dict[str, Any]) -> dict[str, Any]:
    try:
        return builder()
    except Exception:
        return fallback


def build_behavior_snapshot() -> dict[str, Any]:
    live = build_autonomous_snapshot()
    incidents = get_all_incidents()
    public = _safe_snapshot(
        lambda: build_public_safety_live_snapshot(summary_only=True, incidents=incidents),
        {"global_pressure": 20, "mobility": {}},
    )
    osint = _safe_snapshot(
        lambda: build_osint_live_snapshot(summary_only=True),
        {"reputation_risk": 18, "mention_volume": 0},
    )
    trust = build_trust_dashboard()
    weak = build_weak_signals()["highest_probability"]
    pressure = int(public.get("global_pressure", 20))
    reputation = int(osint.get("reputation_risk", 18))
    urgency = int(live["urgency_score"])
    trust_score = int(trust["avg_human_trust_score"])
    metrics = [
        ("panic_probability", urgency * 0.38 + reputation * 0.34 + pressure * 0.28),
        ("compliance_likelihood", trust_score * 0.48 + int(live["confidence_score"]) * 0.3 + (100 - reputation) * 0.22),
        ("evacuation_hesitation", pressure * 0.34 + reputation * 0.22 + (100 - trust_score) * 0.28),
        ("crowd_reversal_risk", pressure * 0.5 + weak["probability_of_incident"] * 0.28),
        ("responder_fatigue_risk", urgency * 0.46 + max(0, 74 - trust_score) * 0.24),
        ("trust_drop_risk", reputation * 0.5 + weak["probability_of_incident"] * 0.22),
        ("rumor_spread_velocity", reputation * 0.54 + int(osint.get("mention_volume", 0)) * 0.45),
    ]
    behavior_metrics = [
        {
            "metric": metric,
            "score": _clamp(score),
            "driver": "OSINT, public-safety pressure, trust, and current AI urgency",
        }
        for metric, score in metrics
    ]
    return {
        "generated_at": _now(),
        "behavior_state": "volatile" if behavior_metrics[0]["score"] >= 70 else "managed",
        "metrics": behavior_metrics,
        "recommended_interventions": [
            "Use verified, location-specific occupant messaging.",
            "Keep responders visible at corridor decision points.",
            "Avoid contradictory lockdown language while evacuation routes remain open.",
        ],
        "summary": f"Human behavior model predicts {behavior_metrics[0]['score']}% panic probability and {behavior_metrics[1]['score']}% compliance likelihood.",
    }
