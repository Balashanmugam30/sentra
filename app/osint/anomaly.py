from __future__ import annotations

from typing import Any


RUMOR_PHRASES: tuple[tuple[str, str, str], ...] = (
    ("explosion everywhere", "high", "critical"),
    ("all exits blocked", "high", "high"),
    ("no help coming", "medium", "high"),
    ("city shutdown", "high", "high"),
    ("toxic cloud everywhere", "high", "critical"),
)


def build_rumor_queue(scenario: str | None) -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = []

    if scenario == "fake_lockdown_rumor":
        items.append(
            {
                "rumor_id": "RMR-301",
                "claim": "City shutdown declared and all gates sealed",
                "confidence": "high",
                "risk_level": "high",
                "related_keyword": "city shutdown",
                "recommended_response": "Issue verified lockdown status immediately and suppress unconfirmed public claims.",
            }
        )
    elif scenario == "toxic_cloud_posts":
        items.append(
            {
                "rumor_id": "RMR-302",
                "claim": "Toxic cloud everywhere and no safe exit remains",
                "confidence": "high",
                "risk_level": "critical",
                "related_keyword": "toxic cloud",
                "recommended_response": "Cross-check AQI and wind, then publish zone-specific safety guidance with official routing.",
            }
        )
    elif scenario == "viral_fire_video":
        items.append(
            {
                "rumor_id": "RMR-303",
                "claim": "Explosion everywhere near the command campus",
                "confidence": "medium",
                "risk_level": "high",
                "related_keyword": "explosion everywhere",
                "recommended_response": "Publish verified incident scope and correct exaggerations in public-facing statements.",
            }
        )

    return items
