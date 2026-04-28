from __future__ import annotations

from typing import Any

from app.revenue_growth.models import revenue_growth_id


def build_conversion_metrics(tenant_id: str) -> list[dict[str, Any]]:
    raw = [
        ("landing_cvr", "Landing page CVR", 5.8, "%", 4.2, "Move crisis simulation video above the fold for government and campus visitors."),
        ("demo_booking", "Demo booking rate", 9.5, "%", 7.0, "Route high-intent traffic to founder-led demo slots within 4 hours."),
        ("trial_activation", "Trial activation rate", 62.0, "%", 48.0, "Auto-seed crisis demo playbooks inside trial workspace."),
        ("trial_to_paid", "Trial-to-paid", 21.5, "%", 16.0, "Trigger executive ROI report after first successful simulation."),
        ("proposal_close", "Proposal close", 31.0, "%", 24.0, "Attach readiness score and procurement risk checklist to proposals."),
        ("checkout_abandonment", "Checkout abandonment", 13.2, "%", 18.0, "Keep annual discount visible and shorten payment step."),
        ("lead_response", "Lead response speed", 11.0, "min", 30.0, "Route enterprise demos to AI SDR escalation queue immediately."),
    ]
    return [
        {
            "metric_id": metric_id,
            "tenant_id": tenant_id,
            "label": label,
            "value": value,
            "unit": unit,
            "benchmark": benchmark,
            "recommendation": recommendation,
        }
        for metric_id, label, value, unit, benchmark, recommendation in raw
    ]


def demo_to_paid(tenant_id: str) -> dict[str, Any]:
    return {
        "tenant_id": tenant_id,
        "demo_views": 18_400,
        "demos_booked": 780,
        "proposals_sent": 286,
        "paid_closed": 418,
        "avg_days_to_close": 19,
        "close_confidence": 87,
        "strongest_segment": "campus + government continuity teams",
    }


def conversion_recommendations(tenant_id: str) -> list[dict[str, Any]]:
    return [
        {
            "action_id": revenue_growth_id("ACT"),
            "tenant_id": tenant_id,
            "title": "Prioritize demo-request leads within 15 minutes",
            "segment": "Demo request",
            "priority": "critical",
            "expected_revenue": 132_000,
            "confidence": 91,
            "next_step": "Open founder-led calendar slots for safety executives.",
        },
        {
            "action_id": revenue_growth_id("ACT"),
            "tenant_id": tenant_id,
            "title": "Attach readiness benchmark to every proposal",
            "segment": "Enterprise procurement",
            "priority": "high",
            "expected_revenue": 218_000,
            "confidence": 88,
            "next_step": "Generate buyer-specific risk posture report.",
        },
        {
            "action_id": revenue_growth_id("ACT"),
            "tenant_id": tenant_id,
            "title": "Launch referral sprint for crisis leaders",
            "segment": "Referral",
            "priority": "high",
            "expected_revenue": 96_000,
            "confidence": 84,
            "next_step": "Invite top ambassadors with executive report credit.",
        },
    ]
