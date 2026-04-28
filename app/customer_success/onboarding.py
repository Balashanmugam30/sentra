from __future__ import annotations

from typing import Any

from app.customer_success.health import health_band


def onboarding_progress(account: dict[str, Any]) -> dict[str, Any]:
    completion = int(account["onboarding_completion"])
    progress = {
        "tenant_id": account["tenant_id"],
        "workspace_name": account["workspace_name"],
        "setup_complete": completion >= 20,
        "invited_users": int(account["seats_used"]) >= 3,
        "first_login": int(account["login_frequency"]) > 0,
        "first_report_created": int(account["report_usage"]) > 0,
        "first_AI_action_used": int(account["AI_actions_used"]) > 0,
        "integrations_connected": completion >= 65,
        "admin_trained": completion >= 75,
        "executive_review_complete": completion >= 90,
        "time_to_value": max(1, 21 - round(completion / 6)),
        "activation_score": round((completion + int(account["adoption_score"]) + int(account["login_frequency"])) / 3),
    }
    progress["onboarding_health"] = health_band(int(progress["activation_score"]))
    return progress
