from __future__ import annotations

from typing import Any


def build_signal_spikes(scenario: str | None, focus_keyword: str | None) -> list[dict[str, Any]]:
    signals = [
        {
            "signal_id": "SIG-101",
            "keyword": focus_keyword or "campus",
            "mention_volume": 18,
            "baseline": 12,
            "spike_score": 22,
            "trend": "stable",
        },
        {
            "signal_id": "SIG-102",
            "keyword": "incident",
            "mention_volume": 11,
            "baseline": 10,
            "spike_score": 12,
            "trend": "stable",
        },
    ]

    if scenario == "viral_fire_video":
        signals = [
            {
                "signal_id": "SIG-201",
                "keyword": "fire video",
                "mention_volume": 74,
                "baseline": 16,
                "spike_score": 91,
                "trend": "rising",
            },
            {
                "signal_id": "SIG-202",
                "keyword": "Zone 2",
                "mention_volume": 58,
                "baseline": 14,
                "spike_score": 84,
                "trend": "rising",
            },
        ]
    elif scenario == "fake_lockdown_rumor":
        signals = [
            {
                "signal_id": "SIG-203",
                "keyword": "city shutdown",
                "mention_volume": 63,
                "baseline": 8,
                "spike_score": 93,
                "trend": "rising",
            },
            {
                "signal_id": "SIG-204",
                "keyword": "lockdown rumor",
                "mention_volume": 49,
                "baseline": 9,
                "spike_score": 87,
                "trend": "rising",
            },
        ]
    elif scenario == "protest_near_gate":
        signals = [
            {
                "signal_id": "SIG-205",
                "keyword": "gate protest",
                "mention_volume": 54,
                "baseline": 10,
                "spike_score": 82,
                "trend": "rising",
            },
            {
                "signal_id": "SIG-206",
                "keyword": "crowd buildup",
                "mention_volume": 39,
                "baseline": 11,
                "spike_score": 71,
                "trend": "rising",
            },
        ]
    elif scenario == "toxic_cloud_posts":
        signals = [
            {
                "signal_id": "SIG-207",
                "keyword": "toxic cloud",
                "mention_volume": 47,
                "baseline": 7,
                "spike_score": 90,
                "trend": "rising",
            },
            {
                "signal_id": "SIG-208",
                "keyword": "chemical smell",
                "mention_volume": 33,
                "baseline": 6,
                "spike_score": 77,
                "trend": "rising",
            },
        ]
    elif scenario == "media_attention_spike":
        signals = [
            {
                "signal_id": "SIG-209",
                "keyword": "breaking news",
                "mention_volume": 66,
                "baseline": 15,
                "spike_score": 79,
                "trend": "rising",
            },
            {
                "signal_id": "SIG-210",
                "keyword": "media response",
                "mention_volume": 52,
                "baseline": 12,
                "spike_score": 74,
                "trend": "rising",
            },
        ]
    elif scenario == "competitor_incident":
        signals = [
            {
                "signal_id": "SIG-211",
                "keyword": "nearby incident",
                "mention_volume": 28,
                "baseline": 9,
                "spike_score": 58,
                "trend": "rising",
            }
        ]
    elif scenario == "calm_day":
        signals = [
            {
                "signal_id": "SIG-212",
                "keyword": focus_keyword or "campus",
                "mention_volume": 8,
                "baseline": 10,
                "spike_score": 6,
                "trend": "falling",
            }
        ]

    return signals
