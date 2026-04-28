from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any
from uuid import uuid4


DEMO_TENANTS: tuple[str, ...] = ("TEN-BALA-UNI", "TEN-BALA-MFG", "TEN-BALA-HOSP", "TEN-GOVSECURE")

BASE_INVESTOR_METRICS: dict[str, Any] = {
    "ARR": 4_800_000,
    "MRR": 400_000,
    "YoY_growth_percent": 182,
    "QoQ_growth_percent": 31,
    "net_revenue_retention": 129,
    "gross_margin_percent": 81,
    "CAC": 18_000,
    "LTV": 126_000,
    "CAC_payback_months": 9,
    "monthly_burn": 210_000,
    "net_burn": 210_000,
    "cash_on_hand": 6_400_000,
    "churn_percent": 3.1,
    "net_new_ARR": 1_020_000,
    "expansion_ARR": 1_380_000,
    "magic_number": 1.4,
    "EBITDA_margin_percent": -111,
}

DEMO_INVESTORS: tuple[dict[str, Any], ...] = (
    {"investor_id": "INV-SEQUOIA-SCOUT", "fund_name": "Sequoia Scout", "partner_name": "Maya Chen", "check_size": 1_000_000, "stage_fit": "Seed / Series A", "geography": "Global", "thesis_fit": "AI command operating systems", "warm_intro": "Founder network", "interest_score": 88, "probability_to_invest": 42, "status": "intro"},
    {"investor_id": "INV-ACCEL-PARTNER", "fund_name": "Accel Partner", "partner_name": "Daniel Ross", "check_size": 5_000_000, "stage_fit": "Series A", "geography": "US / Europe", "thesis_fit": "Vertical SaaS with durable NRR", "warm_intro": "Customer CFO", "interest_score": 91, "probability_to_invest": 48, "status": "partner meeting"},
    {"investor_id": "INV-LIGHTSPEED-ASSOC", "fund_name": "Lightspeed Associate", "partner_name": "Anika Rao", "check_size": 3_500_000, "stage_fit": "Seed / Series A", "geography": "India / US", "thesis_fit": "India-to-global enterprise platforms", "warm_intro": "Operator angel", "interest_score": 84, "probability_to_invest": 35, "status": "first meeting"},
    {"investor_id": "INV-TIGER-GROWTH", "fund_name": "Tiger Growth", "partner_name": "Elena Fischer", "check_size": 12_000_000, "stage_fit": "Growth", "geography": "Global", "thesis_fit": "Fast-scaling AI infrastructure", "warm_intro": "Cloud partner", "interest_score": 79, "probability_to_invest": 28, "status": "target"},
    {"investor_id": "INV-UAE-SOVEREIGN", "fund_name": "Sovereign UAE Fund", "partner_name": "Nadia Al Mansoori", "check_size": 15_000_000, "stage_fit": "Growth / Strategic", "geography": "GCC", "thesis_fit": "National resilience platforms", "warm_intro": "Government partner", "interest_score": 94, "probability_to_invest": 54, "status": "DD"},
    {"investor_id": "INV-STRATEGIC-GOVTECH", "fund_name": "Strategic GovTech Fund", "partner_name": "Omar Khalid", "check_size": 10_000_000, "stage_fit": "Strategic", "geography": "Middle East", "thesis_fit": "Sovereign resilience and crisis command", "warm_intro": "CivicSecure Alliance", "interest_score": 93, "probability_to_invest": 52, "status": "term sheet"},
)

DATAROOM_ITEMS: tuple[tuple[str, str], ...] = (
    ("Financial statements", "Ready"),
    ("Tax records", "In Progress"),
    ("Contracts", "Ready"),
    ("Security policies", "Ready"),
    ("SOC2 docs", "In Progress"),
    ("IP ownership", "Ready"),
    ("Customer references", "Ready"),
    ("Revenue schedules", "Ready"),
    ("Cohort retention", "Ready"),
    ("Churn cohorts", "In Progress"),
    ("Product roadmap", "Ready"),
    ("GTM funnel data", "Ready"),
    ("Legal docs", "In Progress"),
)


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def future_iso(days: int) -> str:
    return (datetime.now(timezone.utc) + timedelta(days=days)).isoformat()


def investor_id(prefix: str) -> str:
    return f"{prefix}-{uuid4().hex[:8].upper()}"
