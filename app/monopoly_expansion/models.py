from __future__ import annotations

from datetime import UTC, datetime
from uuid import uuid4

DEMO_TENANTS = ["TEN-BALA-UNI", "TEN-BALA-MFG", "TEN-BALA-HOSP", "TEN-GOV-SOUTH"]

MONOPOLY_METRICS = {
    "countries_active": 24,
    "regions_controlled": 9,
    "enterprise_customers": 188,
    "government_contracts": 21,
    "partner_revenue": 8_400_000,
    "reseller_coverage": 71,
    "rfp_preferred_vendor_rate": 63,
    "installed_integrations": 420,
    "avg_switching_cost_index": "Extreme",
    "partner_led_wins": 39,
    "referral_loop": 1.52,
    "developer_growth": 28,
    "data_gravity_score": 94,
    "monopoly_score": 97,
    "label": "DEFAULT GLOBAL CHOICE",
}

ACQUISITION_TARGETS = [
    {"name": "OpsVision AI", "arr": 5_800_000, "price_multiple": 5.8, "strategic_fit": 94, "customer_overlap": 38, "engineering_talent": 91, "integration_ease": 87},
    {"name": "CivicGrid Systems", "arr": 3_900_000, "price_multiple": 4.9, "strategic_fit": 92, "customer_overlap": 44, "engineering_talent": 82, "integration_ease": 84},
    {"name": "ShieldMatrix", "arr": 7_200_000, "price_multiple": 6.4, "strategic_fit": 89, "customer_overlap": 31, "engineering_talent": 88, "integration_ease": 76},
    {"name": "UrbanTwin Labs", "arr": 2_700_000, "price_multiple": 4.2, "strategic_fit": 86, "customer_overlap": 29, "engineering_talent": 93, "integration_ease": 90},
    {"name": "GovSignal Tech", "arr": 4_600_000, "price_multiple": 5.2, "strategic_fit": 95, "customer_overlap": 52, "engineering_talent": 79, "integration_ease": 81},
]

STRATEGIC_PARTNERS = [
    {"name": "Azure Sovereign", "type": "cloud vendor", "reach_score": 94, "revenue_potential": 3_200_000, "trust_lift": 91, "status": "active pursuit"},
    {"name": "Google Public Sector", "type": "cloud vendor", "reach_score": 88, "revenue_potential": 2_600_000, "trust_lift": 86, "status": "co-sell ready"},
    {"name": "AWS GovCloud", "type": "cloud vendor", "reach_score": 91, "revenue_potential": 3_000_000, "trust_lift": 89, "status": "procurement aligned"},
    {"name": "Accenture Federal", "type": "system integrator", "reach_score": 87, "revenue_potential": 2_400_000, "trust_lift": 88, "status": "implementation partner"},
    {"name": "Deloitte Risk", "type": "risk advisory", "reach_score": 84, "revenue_potential": 2_100_000, "trust_lift": 85, "status": "executive channel"},
]

COUNTRY_CONQUEST = [
    {"country": "USA", "entered": True, "readiness": 92, "legal_complexity": 68, "channel_coverage": 74, "pricing_fit": 88},
    {"country": "India", "entered": True, "readiness": 94, "legal_complexity": 52, "channel_coverage": 81, "pricing_fit": 91},
    {"country": "UAE", "entered": True, "readiness": 91, "legal_complexity": 47, "channel_coverage": 78, "pricing_fit": 89},
    {"country": "Germany", "entered": True, "readiness": 83, "legal_complexity": 74, "channel_coverage": 62, "pricing_fit": 76},
    {"country": "Singapore", "entered": True, "readiness": 90, "legal_complexity": 45, "channel_coverage": 72, "pricing_fit": 85},
    {"country": "Saudi Arabia", "entered": False, "readiness": 86, "legal_complexity": 58, "channel_coverage": 67, "pricing_fit": 84},
    {"country": "Japan", "entered": False, "readiness": 79, "legal_complexity": 64, "channel_coverage": 55, "pricing_fit": 73},
    {"country": "Australia", "entered": True, "readiness": 84, "legal_complexity": 51, "channel_coverage": 66, "pricing_fit": 82},
]


def monopoly_id(prefix: str) -> str:
    return f"{prefix}-{uuid4().hex[:10].upper()}"


def utc_now_iso() -> str:
    return datetime.now(UTC).isoformat()

