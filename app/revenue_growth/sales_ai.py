from __future__ import annotations

from typing import Any

from app.revenue_growth.models import revenue_growth_id


def build_sales_actions(tenant_id: str) -> list[dict[str, Any]]:
    actions = [
        ("Hot leads", "Call 41 demo-request leads before 11:00", "critical", 128_000, 92, "Assign founder + senior AE sequence."),
        ("Stalled deals", "Unblock 7 procurement reviews", "high", 244_000, 86, "Send security packet and board ROI memo."),
        ("Upsell accounts", "Expand 12 crisis command tenants", "high", 172_000, 84, "Offer Executive + Autonomy bundle."),
        ("Renewal rescue", "Save 3 delayed annual renewals", "high", 96_000, 81, "Schedule CSM + executive risk review."),
        ("Enterprise whales", "Engage 5 airport and smart-city accounts", "critical", 520_000, 78, "Launch multi-threaded executive outreach."),
    ]
    return [
        {
            "action_id": revenue_growth_id("SDR"),
            "tenant_id": tenant_id,
            "title": title,
            "segment": segment,
            "priority": priority,
            "expected_revenue": expected_revenue,
            "confidence": confidence,
            "next_step": next_step,
        }
        for segment, title, priority, expected_revenue, confidence, next_step in actions
    ]


def create_lead_action(tenant_id: str, company_name: str, source: str, expected_value: int) -> dict[str, Any]:
    return {
        "action_id": revenue_growth_id("LEAD"),
        "tenant_id": tenant_id,
        "title": f"New high-intent lead: {company_name}",
        "segment": source,
        "priority": "high" if expected_value >= 100_000 else "normal",
        "expected_revenue": expected_value,
        "confidence": 83 if expected_value >= 100_000 else 74,
        "next_step": "Book crisis readiness demo and generate buyer risk memo.",
    }
