from __future__ import annotations

from typing import Any


def build_external_alerts(
    *,
    scenario: str | None,
    reputation_risk: int,
    rumors: list[dict[str, Any]],
    environment_cross_check: bool,
    public_safety_cross_check: bool,
) -> list[dict[str, Any]]:
    alerts: list[dict[str, Any]] = []

    if reputation_risk >= 70:
        alerts.append(
            {
                "alert_id": "ALT-401",
                "severity": "high",
                "action": "Publish executive-approved public statement",
                "audience": "communications",
                "rationale": "Negative volume and external scrutiny now require a verified narrative.",
            }
        )
    if rumors:
        alerts.append(
            {
                "alert_id": "ALT-402",
                "severity": "critical" if any(item["risk_level"] == "critical" for item in rumors) else "high",
                "action": "Issue rumor correction bulletin",
                "audience": "public",
                "rationale": "High-confidence misinformation is affecting trust and directional safety behavior.",
            }
        )
    if public_safety_cross_check:
        alerts.append(
            {
                "alert_id": "ALT-403",
                "severity": "high",
                "action": "Coordinate with public safety on crowd and mobility advisory",
                "audience": "operations",
                "rationale": "External chatter indicates crowd movement pressure near access corridors.",
            }
        )
    if environment_cross_check:
        alerts.append(
            {
                "alert_id": "ALT-404",
                "severity": "high",
                "action": "Cross-check airborne hazard claims against environmental telemetry",
                "audience": "operations",
                "rationale": "Public hazard claims require environmental validation before issuing mass guidance.",
            }
        )
    if scenario == "media_attention_spike":
        alerts.append(
            {
                "alert_id": "ALT-405",
                "severity": "medium",
                "action": "Prepare executive media holding line",
                "audience": "executive",
                "rationale": "Headline intensity is increasing faster than normal operational coverage.",
            }
        )
    if not alerts:
        alerts.append(
            {
                "alert_id": "ALT-406",
                "severity": "low",
                "action": "Maintain passive monitoring and keep verified updates ready",
                "audience": "communications",
                "rationale": "External intelligence is currently stable with no urgent public narrative gap.",
            }
        )

    return alerts[:4]
