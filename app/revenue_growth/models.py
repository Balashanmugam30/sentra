from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4


DEMO_TENANTS = ["TEN-BALA-UNI", "TEN-BALA-MFG", "TEN-BALA-HOSP"]

FUNNEL_STAGES = [
    ("visitors", "Visitors", 142_000),
    ("leads", "Leads", 8_240),
    ("trials", "Trials", 1_940),
    ("qualified_demos", "Qualified demos", 780),
    ("paid_conversions", "Paid conversions", 418),
    ("enterprise_deals", "Enterprise deals", 12),
]

LEAD_SOURCES = [
    ("website", "Website", 3_460, 5.2, 124),
    ("referral", "Referral", 1_180, 11.8, 64),
    ("linkedin", "LinkedIn", 1_040, 6.9, 146),
    ("cold_outbound", "Cold outbound", 920, 3.6, 192),
    ("demo_request", "Demo request", 640, 18.4, 82),
    ("partnership", "Partnership", 520, 13.1, 70),
    ("organic_search", "Organic search", 360, 7.4, 108),
    ("waitlist", "Waitlist", 120, 9.2, 56),
]

PRICING_EXPERIMENTS = [
    ("starter_49", "Starter $49", "Starter", "$49/mo entry anchor", 6.2, 128),
    ("starter_59", "Starter $59", "Starter", "$59/mo confidence anchor", 5.7, 151),
    ("annual_badge", "Annual with most-popular badge", "Growth", "Annual discount + social proof", 9.8, 412),
    ("free_trial", "14-day free trial", "Business", "Trial-first activation", 8.9, 355),
    ("no_trial_demo", "Demo-gated enterprise", "Enterprise", "High-intent sales-led path", 14.6, 1840),
    ("gov_anchor", "Government continuity anchor", "Government", "Sovereign readiness premium", 12.4, 2400),
]

AUTHORITY_SIGNALS = [
    ("case_studies", "Case studies", 18, "enterprise proof"),
    ("reports_exported", "Reports exported", 12_480, "proof of recurring workflow"),
    ("simulations_run", "Simulations run", 84_200, "mission-critical usage"),
    ("enterprise_tenants", "Enterprise tenants", 42, "market validation"),
    ("government_tenants", "Government tenants", 7, "sovereign trust"),
    ("investor_interest", "Investor interest", 31, "fundraising pull"),
    ("press_mentions", "Press mentions", 26, "category authority"),
]


def revenue_growth_id(prefix: str) -> str:
    return f"{prefix}-{uuid4().hex[:10].upper()}"


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()
