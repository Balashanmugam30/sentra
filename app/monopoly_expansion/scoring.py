from __future__ import annotations

from app.monopoly_expansion.models import MONOPOLY_METRICS


def live_snapshot() -> dict[str, object]:
    return {
        **MONOPOLY_METRICS,
        "generated_at_label": "live",
        "dominance_thesis": "Sentra becomes the default global choice by compounding customer value, trusted procurement proof, ecosystem depth, and responsible data gravity.",
    }


def monopoly_score() -> dict[str, object]:
    return {
        "monopoly_score": MONOPOLY_METRICS["monopoly_score"],
        "label": MONOPOLY_METRICS["label"],
        "acquisition_score": 91,
        "partnership_score": 92,
        "global_conquest_score": 90,
        "bundling_score": 94,
        "lockin_score": 96,
        "channel_score": 89,
        "procurement_default_score": 88,
        "network_effect_score": 95,
        "regulatory_health_score": 89,
        "posture": "responsible winner-take-most expansion",
    }


def board_strategy() -> dict[str, object]:
    return {
        "strategy_id": "BOARD-MONOPOLY-001",
        "title": "Default Global Choice Expansion Plan",
        "priorities": [
            "Acquire OpsVision AI for workflow depth and talent.",
            "Launch Full Enterprise Suite bundle with Data Empire proof.",
            "Activate Azure Sovereign and AWS GovCloud procurement lanes.",
            "Publish interoperability and trust guardrails before scale pressure rises.",
        ],
        "confidence": 93,
    }

