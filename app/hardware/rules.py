from __future__ import annotations


def _as_float(value: object) -> float:
    if isinstance(value, bool):
        return 1.0 if value else 0.0
    try:
        return float(value)
    except (TypeError, ValueError):
        return 0.0


def evaluate_telemetry_rules(
    *,
    telemetry: dict[str, object],
    system_mode: str,
) -> list[dict[str, str]]:
    rules: list[dict[str, str]] = []
    temperature = _as_float(telemetry.get("temperature"))
    smoke = _as_float(telemetry.get("smoke"))
    gas = _as_float(telemetry.get("gas"))
    motion = _as_float(telemetry.get("motion"))
    panic_button = _as_float(telemetry.get("panic_button"))
    power_loss = _as_float(telemetry.get("power_loss"))

    if temperature > 65 and smoke > 70:
        rules.append(
            {
                "rule_name": "fire_risk",
                "alert_label": "hardware fire risk",
                "incident_type": "fire",
                "reason": "temperature and smoke thresholds exceeded",
            }
        )

    if gas > 75:
        rules.append(
            {
                "rule_name": "gas_leak",
                "alert_label": "hardware gas leak",
                "incident_type": "hazardous_gas",
                "reason": "gas threshold exceeded",
            }
        )

    if motion >= 1 and system_mode == "lockdown":
        rules.append(
            {
                "rule_name": "intrusion_watch",
                "alert_label": "lockdown intrusion watch",
                "incident_type": "anomaly",
                "reason": "motion detected during lockdown posture",
            }
        )

    if panic_button >= 1:
        rules.append(
            {
                "rule_name": "emergency_manual_alert",
                "alert_label": "manual panic alert",
                "incident_type": "crowd_panic",
                "reason": "panic button activated",
            }
        )

    if power_loss >= 1:
        rules.append(
            {
                "rule_name": "infrastructure_failure",
                "alert_label": "infrastructure failure",
                "incident_type": "anomaly",
                "reason": "power loss detected by edge gateway",
            }
        )

    deduped: list[dict[str, str]] = []
    seen: set[str] = set()
    for rule in rules:
        if rule["rule_name"] in seen:
            continue
        seen.add(rule["rule_name"])
        deduped.append(rule)
    return deduped
