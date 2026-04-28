from __future__ import annotations

from typing import Any


HIGH_FIT_INDUSTRIES = {
    "university",
    "smart campus",
    "factory",
    "industrial campus",
    "hospital",
    "government",
    "airport",
    "enterprise",
}


def score_lead(lead: dict[str, Any]) -> int:
    industry = str(lead.get("industry", "")).lower()
    size = str(lead.get("company_size", "")).lower()
    source = str(lead.get("source", "")).lower()
    status = str(lead.get("status", "")).lower()
    notes = str(lead.get("notes", "")).lower()
    value = int(lead.get("deal_value_estimate") or 0)

    score = 18
    if industry in HIGH_FIT_INDUSTRIES:
        score += 18
    if any(token in size for token in ["1000", "4,", "7,", "8,", "11,", "18,", "32,", "beds", "sites"]):
        score += 14
    if value >= 150_000:
        score += 16
    elif value >= 75_000:
        score += 10
    if source in {"referral", "partner", "demo", "inbound", "webinar"}:
        score += 12
    if status in {"demo_booked", "proposal_sent", "negotiation"}:
        score += 14
    if any(token in notes for token in ["urgent", "budget", "board", "security incident", "pilot", "procurement"]):
        score += 14
    if "demo" in notes or status == "demo_booked":
        score += 8
    if "slow" in notes or status == "nurture":
        score -= 10

    return max(0, min(100, score))


def scoring_factors() -> dict[str, int]:
    return {
        "industry_fit": 18,
        "company_size": 14,
        "budget_signal": 16,
        "engagement": 12,
        "urgency_signal": 14,
        "demo_requested": 8,
        "nurture_penalty": -10,
    }


def lead_recommendations(scored_leads: list[dict[str, Any]]) -> list[str]:
    hot = [lead for lead in scored_leads if int(lead.get("score", 0)) >= 80]
    demo_ready = [lead for lead in scored_leads if lead.get("status") in {"qualified", "contacted"}]
    recommendations = []
    if hot:
        recommendations.append(f"Prioritize founder-led outreach for {hot[0]['company_name']}.")
    if demo_ready:
        recommendations.append(f"Book executive demo for {demo_ready[0]['company_name']} within 48 hours.")
    recommendations.append("Route hospital, campus, and industrial accounts into enterprise security narrative.")
    recommendations.append("Upsell high-seat tenants into Enterprise with SSO and advanced AI positioning.")
    return recommendations
