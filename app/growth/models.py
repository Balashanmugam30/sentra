from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any
from uuid import uuid4


DEMO_TENANTS: tuple[str, ...] = ("TEN-BALA-UNI", "TEN-BALA-MFG", "TEN-BALA-HOSP", "TEN-GOVSECURE")

REGIONS: tuple[dict[str, Any], ...] = (
    {"region_id": "REG-INDIA", "name": "India", "status": "active", "regional_hq": "Bengaluru"},
    {"region_id": "REG-ME", "name": "Middle East", "status": "active", "regional_hq": "Dubai"},
    {"region_id": "REG-EU", "name": "Europe", "status": "active", "regional_hq": "Berlin"},
    {"region_id": "REG-NA", "name": "North America", "status": "active", "regional_hq": "New York"},
    {"region_id": "REG-SEA", "name": "SEA", "status": "active", "regional_hq": "Singapore"},
    {"region_id": "REG-AFRICA", "name": "Africa", "status": "active", "regional_hq": "Nairobi"},
    {"region_id": "REG-AUS", "name": "Australia", "status": "active", "regional_hq": "Sydney"},
)

COUNTRIES: tuple[dict[str, Any], ...] = (
    {"country_id": "CTY-INDIA", "name": "India", "region": "India", "currency": "INR", "market_score": 94, "compliance_complexity": 54, "sales_cycle_days": 54, "ARR_potential": 4_800_000, "competition_index": 48, "channel_strength": 88, "government_opportunity": 84, "deployment_readiness": 92, "status": "launched"},
    {"country_id": "CTY-UAE", "name": "UAE", "region": "Middle East", "currency": "AED", "market_score": 96, "compliance_complexity": 46, "sales_cycle_days": 68, "ARR_potential": 3_400_000, "competition_index": 42, "channel_strength": 82, "government_opportunity": 92, "deployment_readiness": 91, "status": "pilot"},
    {"country_id": "CTY-SAUDI", "name": "Saudi", "region": "Middle East", "currency": "SAR", "market_score": 88, "compliance_complexity": 68, "sales_cycle_days": 92, "ARR_potential": 3_100_000, "competition_index": 45, "channel_strength": 76, "government_opportunity": 95, "deployment_readiness": 78, "status": "pipeline"},
    {"country_id": "CTY-SINGAPORE", "name": "Singapore", "region": "SEA", "currency": "SGD", "market_score": 91, "compliance_complexity": 40, "sales_cycle_days": 61, "ARR_potential": 2_200_000, "competition_index": 58, "channel_strength": 79, "government_opportunity": 89, "deployment_readiness": 90, "status": "pilot"},
    {"country_id": "CTY-GERMANY", "name": "Germany", "region": "Europe", "currency": "EUR", "market_score": 86, "compliance_complexity": 76, "sales_cycle_days": 118, "ARR_potential": 2_900_000, "competition_index": 64, "channel_strength": 73, "government_opportunity": 82, "deployment_readiness": 74, "status": "pipeline"},
    {"country_id": "CTY-UK", "name": "UK", "region": "Europe", "currency": "GBP", "market_score": 84, "compliance_complexity": 62, "sales_cycle_days": 86, "ARR_potential": 2_400_000, "competition_index": 61, "channel_strength": 71, "government_opportunity": 78, "deployment_readiness": 82, "status": "pipeline"},
    {"country_id": "CTY-USA", "name": "USA", "region": "North America", "currency": "USD", "market_score": 93, "compliance_complexity": 72, "sales_cycle_days": 132, "ARR_potential": 5_800_000, "competition_index": 78, "channel_strength": 69, "government_opportunity": 81, "deployment_readiness": 80, "status": "pipeline"},
    {"country_id": "CTY-CANADA", "name": "Canada", "region": "North America", "currency": "CAD", "market_score": 79, "compliance_complexity": 58, "sales_cycle_days": 84, "ARR_potential": 1_300_000, "competition_index": 52, "channel_strength": 66, "government_opportunity": 74, "deployment_readiness": 76, "status": "pipeline"},
    {"country_id": "CTY-JAPAN", "name": "Japan", "region": "SEA", "currency": "JPY", "market_score": 82, "compliance_complexity": 70, "sales_cycle_days": 124, "ARR_potential": 1_900_000, "competition_index": 67, "channel_strength": 58, "government_opportunity": 76, "deployment_readiness": 71, "status": "blocked"},
    {"country_id": "CTY-AUSTRALIA", "name": "Australia", "region": "Australia", "currency": "AUD", "market_score": 81, "compliance_complexity": 50, "sales_cycle_days": 78, "ARR_potential": 1_600_000, "competition_index": 49, "channel_strength": 64, "government_opportunity": 73, "deployment_readiness": 83, "status": "pipeline"},
)

DEAL_TYPES: tuple[str, ...] = (
    "University Network",
    "Hospital Group",
    "Industrial Campus",
    "Airport Authority",
    "Smart City",
    "Government Security Grid",
)

CONTRACT_STAGES: tuple[str, ...] = (
    "lead",
    "qualified",
    "RFP",
    "security review",
    "pilot",
    "legal",
    "procurement",
    "won",
    "lost",
)


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def future_iso(days: int) -> str:
    return (datetime.now(timezone.utc) + timedelta(days=days)).isoformat()


def growth_id(prefix: str) -> str:
    return f"{prefix}-{uuid4().hex[:8].upper()}"

