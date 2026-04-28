from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from app.environment.engine import apply_environment_test_scenario
from app.osint.anomaly import build_rumor_queue
from app.osint.narrative import build_external_alerts
from app.osint.news import apply_news_scenario
from app.osint.providers import fetch_osint_provider_payload
from app.osint.sentiment import build_sentiment_summary
from app.osint.signals import build_signal_spikes
from app.public_safety.engine import apply_public_safety_test_scenario


def _now() -> datetime:
    return datetime.now(timezone.utc)


_osint_state: dict[str, Any] = {
    "scenario": None,
    "focus_keyword": None,
    "history": [],
    "history_sequence": 100,
}


def _next_history_id() -> str:
    _osint_state["history_sequence"] = int(_osint_state.get("history_sequence", 100)) + 1
    return f"OSI-HIST-{_osint_state['history_sequence']}"


def _history_event(title: str, detail: str, severity: str) -> dict[str, Any]:
    return {
        "event_id": _next_history_id(),
        "timestamp": _now(),
        "severity": severity,
        "title": title,
        "detail": detail,
    }


def _append_history(title: str, detail: str, severity: str) -> None:
    _osint_state["history"].insert(0, _history_event(title, detail, severity))
    del _osint_state["history"][20:]


def _keywords(signals: list[dict[str, Any]], news_items: list[dict[str, Any]], focus_keyword: str | None) -> list[str]:
    keywords = [signal["keyword"] for signal in signals]
    if focus_keyword:
        keywords.insert(0, focus_keyword)
    for item in news_items[:3]:
        first = item["headline"].split(" ")[0].strip(",.:-")
        if first:
            keywords.append(first)
    deduped: list[str] = []
    for keyword in keywords:
        if keyword not in deduped:
            deduped.append(keyword)
    return deduped[:5]


def _hotspots(scenario: str | None, focus_keyword: str | None) -> list[dict[str, Any]]:
    base = [
        {"hotspot_id": "OSI-HOT-1", "label": focus_keyword or "Campus", "lat": 11.0168, "lng": 76.9558, "severity": "low", "source": "open_intelligence"},
    ]
    if scenario == "protest_near_gate":
        base.append({"hotspot_id": "OSI-HOT-2", "label": "Gate Protest", "lat": 11.0175, "lng": 76.9547, "severity": "high", "source": "open_intelligence"})
    elif scenario == "viral_fire_video":
        base.append({"hotspot_id": "OSI-HOT-3", "label": "Zone 2 Viral Clip", "lat": 11.0171, "lng": 76.9569, "severity": "high", "source": "open_intelligence"})
    elif scenario == "toxic_cloud_posts":
        base.append({"hotspot_id": "OSI-HOT-4", "label": "Airborne Hazard Posts", "lat": 11.0159, "lng": 76.9576, "severity": "critical", "source": "open_intelligence"})
    return base


def _build_state() -> dict[str, Any]:
    scenario = _osint_state["scenario"]
    focus_keyword = _osint_state["focus_keyword"]
    provider_payload = fetch_osint_provider_payload()
    news_items = apply_news_scenario(provider_payload["items"], scenario, focus_keyword)
    sentiment = build_sentiment_summary(scenario)
    spikes = build_signal_spikes(scenario, focus_keyword)
    rumors = build_rumor_queue(scenario)

    mention_volume = sum(int(item["mention_volume"]) for item in spikes)
    negative_weight = sentiment["negative"] * 0.42
    severity_weight = sum(
        {"low": 8, "medium": 18, "high": 28, "critical": 38}[item["severity"]]
        for item in news_items[:4]
    )
    spike_weight = max((item["spike_score"] for item in spikes), default=0) * 0.28
    rumor_weight = 18 if rumors else 0
    reputation_risk = max(8, min(100, round(negative_weight + severity_weight * 0.22 + spike_weight + rumor_weight)))

    threat_level = "low"
    if reputation_risk >= 80 or any(item["risk_level"] == "critical" for item in rumors):
        threat_level = "critical"
    elif reputation_risk >= 60 or any(item["severity"] in {"high", "critical"} for item in news_items[:2]):
        threat_level = "high"
    elif reputation_risk >= 35:
        threat_level = "medium"

    environment_cross_check = scenario == "toxic_cloud_posts"
    public_safety_cross_check = scenario == "protest_near_gate"
    external_alerts = build_external_alerts(
        scenario=scenario,
        reputation_risk=reputation_risk,
        rumors=rumors,
        environment_cross_check=environment_cross_check,
        public_safety_cross_check=public_safety_cross_check,
    )

    return {
        "provider": provider_payload["provider"],
        "updated_at": provider_payload["updated_at"],
        "threat_level": threat_level,
        "reputation_risk": reputation_risk,
        "mention_volume": mention_volume,
        "sentiment_summary": sentiment,
        "signal_spikes": spikes,
        "top_keywords": _keywords(spikes, news_items, focus_keyword),
        "external_alerts": external_alerts,
        "environment_cross_check": environment_cross_check,
        "public_safety_cross_check": public_safety_cross_check,
        "news": news_items[:8],
        "rumors": rumors[:6],
        "history": list(_osint_state["history"]),
        "hotspots": _hotspots(scenario, focus_keyword),
    }


def build_osint_live_snapshot(*, summary_only: bool) -> dict[str, Any]:
    state = _build_state()
    if summary_only:
        state["signal_spikes"] = state["signal_spikes"][:1]
        state["external_alerts"] = state["external_alerts"][:2]
        state["top_keywords"] = state["top_keywords"][:3]
    return {
        "summary_only": summary_only,
        "provider": state["provider"],
        "updated_at": state["updated_at"],
        "threat_level": state["threat_level"],
        "reputation_risk": state["reputation_risk"],
        "mention_volume": state["mention_volume"],
        "sentiment_summary": state["sentiment_summary"],
        "signal_spikes": state["signal_spikes"],
        "top_keywords": state["top_keywords"],
        "external_alerts": state["external_alerts"],
        "environment_cross_check": state["environment_cross_check"],
        "public_safety_cross_check": state["public_safety_cross_check"],
    }


def build_osint_news_snapshot(*, summary_only: bool) -> dict[str, Any]:
    state = _build_state()
    return {
        "summary_only": summary_only,
        "provider": state["provider"],
        "updated_at": state["updated_at"],
        "items": state["news"][:3] if summary_only else state["news"],
    }


def build_osint_rumor_snapshot(*, summary_only: bool) -> dict[str, Any]:
    state = _build_state()
    return {
        "summary_only": summary_only,
        "provider": state["provider"],
        "updated_at": state["updated_at"],
        "items": state["rumors"][:2] if summary_only else state["rumors"],
    }


def build_osint_history_snapshot(*, summary_only: bool) -> dict[str, Any]:
    state = _build_state()
    events = state["history"]
    if not events:
        now = _now()
        events = [
            {
                "event_id": "OSI-HIST-SEED-101",
                "timestamp": now,
                "severity": "low",
                "title": "Baseline monitoring active",
                "detail": "OSINT watch is stable with low external pressure.",
            },
            {
                "event_id": "OSI-HIST-SEED-102",
                "timestamp": now,
                "severity": "low",
                "title": "Local media calm",
                "detail": "Headline volume remains within normal range.",
            },
            {
                "event_id": "OSI-HIST-SEED-103",
                "timestamp": now,
                "severity": "low",
                "title": "No major rumor pressure",
                "detail": "Public rumor queue remains empty.",
            },
        ]
    return {
        "summary_only": summary_only,
        "provider": state["provider"],
        "updated_at": state["updated_at"],
        "events": events[:5] if summary_only else events,
    }


def build_osint_overlay() -> dict[str, Any]:
    state = _build_state()
    return {
        "threat_level": state["threat_level"],
        "reputation_risk": state["reputation_risk"],
        "hotspots": state["hotspots"],
    }


def apply_osint_focus(keyword: str, *, summary_only: bool) -> dict[str, Any]:
    _osint_state["focus_keyword"] = keyword.strip() or None
    _append_history("Focus keyword updated", f"OSINT focus shifted to {keyword}.", "low")
    return build_osint_live_snapshot(summary_only=summary_only)


def apply_osint_test_scenario(scenario: str, *, summary_only: bool) -> dict[str, Any]:
    _osint_state["scenario"] = scenario
    if scenario == "protest_near_gate":
        apply_public_safety_test_scenario("crowd_surge_gate")
        apply_environment_test_scenario("clear_day", summary_only=False)
    elif scenario == "toxic_cloud_posts":
        apply_environment_test_scenario("toxic_leak_wind", summary_only=False)
        apply_public_safety_test_scenario("normal_day")
    elif scenario == "calm_day":
        apply_public_safety_test_scenario("normal_day")
        apply_environment_test_scenario("clear_day", summary_only=False)
    else:
        apply_public_safety_test_scenario("normal_day")
        apply_environment_test_scenario("clear_day", summary_only=False)

    severity = "high"
    if scenario in {"fake_lockdown_rumor", "toxic_cloud_posts"}:
        severity = "critical"
    elif scenario in {"competitor_incident", "calm_day"}:
        severity = "medium" if scenario == "competitor_incident" else "low"
    _append_history(
        f"Scenario {scenario.replace('_', ' ')} applied",
        "External intelligence state updated for deterministic signal simulation.",
        severity,
    )
    return build_osint_live_snapshot(summary_only=summary_only)
