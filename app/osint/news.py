from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any


def _now() -> datetime:
    return datetime.now(timezone.utc)


def demo_news_items() -> list[dict[str, Any]]:
    now = _now()
    return [
        {
            "headline": "Campus command drill improves coordinated evacuation timing",
            "source": "Sentra City Watch",
            "published_at": now - timedelta(minutes=34),
            "category": "operations",
            "location_relevance": 82,
            "severity": "low",
            "summary": "Routine preparedness coverage highlights improved command coordination across key zones.",
            "url": None,
        },
        {
            "headline": "Regional weather desk tracks heat stress concerns near industrial corridor",
            "source": "District Weather Radio",
            "published_at": now - timedelta(hours=1, minutes=12),
            "category": "environment",
            "location_relevance": 74,
            "severity": "medium",
            "summary": "Environmental reporters are monitoring elevated heat exposure for field teams and commuters.",
            "url": None,
        },
        {
            "headline": "Transit agency reports stable shuttle flow around the civic campus",
            "source": "Metro Mobility Bulletin",
            "published_at": now - timedelta(hours=2, minutes=6),
            "category": "mobility",
            "location_relevance": 69,
            "severity": "low",
            "summary": "Public transport conditions remain normal with no major disruption around the command footprint.",
            "url": None,
        },
    ]


def apply_news_scenario(base: list[dict[str, Any]], scenario: str | None, focus_keyword: str | None) -> list[dict[str, Any]]:
    news = [dict(item) for item in base]
    now = _now()

    if scenario == "viral_fire_video":
        news.insert(
            0,
            {
                "headline": "Viral fire video from Zone 2 drives public alarm and media pickup",
                "source": "Regional Breaking Desk",
                "published_at": now - timedelta(minutes=9),
                "category": "incident",
                "location_relevance": 94,
                "severity": "high",
                "summary": "User-shared footage is accelerating external scrutiny and raising demand for verified updates.",
                "url": None,
            },
        )
    elif scenario == "fake_lockdown_rumor":
        news.insert(
            0,
            {
                "headline": "Unverified posts claim full city lockdown despite no official order",
                "source": "Local Public Watch",
                "published_at": now - timedelta(minutes=14),
                "category": "misinformation",
                "location_relevance": 88,
                "severity": "high",
                "summary": "Conflicting public claims are spreading faster than formal status updates, increasing rumor pressure.",
                "url": None,
            },
        )
    elif scenario == "protest_near_gate":
        news.insert(
            0,
            {
                "headline": "Small protest gathers near campus gate and slows incoming traffic",
                "source": "Civic Streetwire",
                "published_at": now - timedelta(minutes=11),
                "category": "crowd",
                "location_relevance": 91,
                "severity": "high",
                "summary": "Crowd movement near the gate is raising external visibility and commuter pressure.",
                "url": None,
            },
        )
    elif scenario == "toxic_cloud_posts":
        news.insert(
            0,
            {
                "headline": "Residents post concerns about a drifting toxic cloud near the industrial edge",
                "source": "Open Emergency Feed",
                "published_at": now - timedelta(minutes=13),
                "category": "environment",
                "location_relevance": 93,
                "severity": "critical",
                "summary": "Public reports of airborne hazard require rapid cross-check against wind and AQI conditions.",
                "url": None,
            },
        )
    elif scenario == "media_attention_spike":
        news.insert(
            0,
            {
                "headline": "National media attention intensifies around campus command response",
                "source": "National Desk",
                "published_at": now - timedelta(minutes=8),
                "category": "media",
                "location_relevance": 85,
                "severity": "high",
                "summary": "Headline volume is increasing and executive communications pressure is rising.",
                "url": None,
            },
        )
    elif scenario == "competitor_incident":
        news.insert(
            0,
            {
                "headline": "Nearby industrial operator reports disruption after safety alarm",
                "source": "Regional Incident Wire",
                "published_at": now - timedelta(minutes=18),
                "category": "regional",
                "location_relevance": 72,
                "severity": "medium",
                "summary": "A nearby incident may shift public concern and resource expectations toward the wider district.",
                "url": None,
            },
        )
    elif scenario == "calm_day":
        return news

    if focus_keyword:
        keyword = focus_keyword.lower()
        focus_items = [item for item in news if keyword in item["headline"].lower() or keyword in item["summary"].lower()]
        if focus_items:
            return focus_items + [item for item in news if item not in focus_items]
    return news
