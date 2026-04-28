from __future__ import annotations

from app.monopoly_expansion.models import MONOPOLY_METRICS


def network_flywheel() -> dict[str, object]:
    return {
        "partner_led_wins": MONOPOLY_METRICS["partner_led_wins"],
        "referral_loop": MONOPOLY_METRICS["referral_loop"],
        "developer_growth": MONOPOLY_METRICS["developer_growth"],
        "data_compounding": 94,
        "ecosystem_stickiness": 92,
        "flywheel": [
            "more tenants create more operational patterns",
            "more patterns improve AI predictions",
            "better predictions improve trust and procurement wins",
            "more wins attract partners and developers",
            "more integrations deepen workflow dependency",
            "deeper dependency increases retention and expansion",
        ],
    }


def market_consolidation() -> dict[str, object]:
    return {
        "weak_rivals_identified": 5,
        "adjacent_markets": ["critical infrastructure", "sovereign command", "campus safety", "enterprise resilience"],
        "share_capture_simulation": [
            {"move": "Acquire OpsVision AI", "share_gain": 4.8, "pricing_power": 6, "risk": "medium"},
            {"move": "Bundle Data Empire", "share_gain": 6.2, "pricing_power": 9, "risk": "low"},
            {"move": "Partner-led government motion", "share_gain": 5.4, "pricing_power": 7, "risk": "low"},
            {"move": "Developer ecosystem expansion", "share_gain": 3.9, "pricing_power": 5, "risk": "low"},
        ],
        "responsible_growth_guardrail": "prioritize customer outcomes, interoperability, compliance, and fair procurement proof",
    }

