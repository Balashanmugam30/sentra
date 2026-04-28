from __future__ import annotations

from typing import Any


def build_sentiment_summary(scenario: str | None) -> dict[str, int]:
    summary = {
        "positive": 24,
        "neutral": 54,
        "negative": 22,
        "fear": 16,
        "anger": 12,
        "urgency": 18,
    }

    if scenario == "viral_fire_video":
        summary.update({"positive": 10, "neutral": 32, "negative": 58, "fear": 64, "anger": 38, "urgency": 72})
    elif scenario == "fake_lockdown_rumor":
        summary.update({"positive": 12, "neutral": 28, "negative": 60, "fear": 57, "anger": 42, "urgency": 68})
    elif scenario == "protest_near_gate":
        summary.update({"positive": 14, "neutral": 37, "negative": 49, "fear": 34, "anger": 48, "urgency": 54})
    elif scenario == "toxic_cloud_posts":
        summary.update({"positive": 8, "neutral": 24, "negative": 68, "fear": 72, "anger": 29, "urgency": 78})
    elif scenario == "media_attention_spike":
        summary.update({"positive": 18, "neutral": 34, "negative": 48, "fear": 36, "anger": 22, "urgency": 62})
    elif scenario == "competitor_incident":
        summary.update({"positive": 18, "neutral": 49, "negative": 33, "fear": 20, "anger": 15, "urgency": 26})
    elif scenario == "calm_day":
        summary.update({"positive": 34, "neutral": 56, "negative": 10, "fear": 6, "anger": 5, "urgency": 8})

    return summary
