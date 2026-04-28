"""Global threat matrix engine."""

from __future__ import annotations

from typing import Any

from .models import WorldMetrics


def build_threats(metrics: WorldMetrics) -> dict[str, Any]:
    threats = [
        ("war escalation", 78, 31, 4_800_000_000, "open diplomacy corridor and reroute energy exposure"),
        ("cyberattack waves", 82, 44, 2_100_000_000, "raise SOC posture and enforce zero-trust checks"),
        ("food shortage", 69, 28, 3_400_000_000, "activate reserve logistics and grain route monitoring"),
        ("banking collapse", 58, 18, 7_500_000_000, "stress-test liquidity and stabilize payment channels"),
        ("pandemic risk", 61, 22, 2_900_000_000, "expand surveillance and travel advisory readiness"),
        ("climate disaster", 74, 37, 5_600_000_000, "pre-stage disaster reserves in high exposure regions"),
        ("refugee pressure", 64, 24, 1_800_000_000, "coordinate health, transport, and humanitarian corridors"),
        ("energy shortage", 71, 33, 4_200_000_000, "rebalance LNG and backup power priorities"),
        ("misinformation waves", 67, 41, 950_000_000, "launch verified public narrative and OSINT watch"),
        ("satellite disruption", 54, 15, 1_600_000_000, "shift comms to terrestrial backup and verify GPS risk"),
    ]
    return {
        "threats_active": metrics.threats_active,
        "threats": [
            {
                "name": name,
                "severity": severity,
                "probability": probability,
                "economic_impact": economic_impact,
                "recommended_response": response,
            }
            for name, severity, probability, economic_impact, response in threats
        ],
    }

