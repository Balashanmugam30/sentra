from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4


DEMO_TENANTS = ["TEN-BALA-UNI", "TEN-BALA-MFG", "TEN-BALA-HOSP"]

DATA_SOURCES = [
    ("crm", "CRM", 920_000, "commercial"),
    ("billing", "Billing", 410_000, "financial"),
    ("incidents", "Incidents", 1_840_000, "crisis"),
    ("sensors", "Sensors", 3_900_000, "physical"),
    ("social", "Social signals", 1_120_000, "public"),
    ("weather", "Weather", 780_000, "environment"),
    ("traffic", "Traffic", 1_460_000, "mobility"),
    ("government", "Government feeds", 540_000, "sovereign"),
    ("financial", "Financial feeds", 320_000, "market"),
    ("api_usage", "API usage", 2_400_000, "platform"),
    ("ecosystem_apps", "Ecosystem apps", 860_000, "ecosystem"),
    ("user_actions", "User actions", 1_180_000, "behavioral"),
    ("telemetry", "Operational telemetry", 790_000, "ops"),
    ("ai_decisions", "AI decisions", 168_000, "autonomy"),
    ("support", "Support tickets", 110_000, "success"),
]

GRAPH_ENTITY_TYPES = [
    ("people", "People", 240_000),
    ("companies", "Companies", 86_000),
    ("locations", "Locations", 310_000),
    ("incidents", "Incidents", 420_000),
    ("assets", "Assets", 280_000),
    ("risks", "Risks", 198_000),
    ("deals", "Deals", 74_000),
    ("signals", "Signals", 350_000),
    ("agencies", "Agencies", 62_000),
    ("devices", "Devices", 118_000),
    ("workflows", "Workflows", 52_000),
]

DATA_PRODUCTS = [
    ("benchmark_reports", "Benchmark Reports", 820_000),
    ("industry_intelligence_api", "Industry Intelligence API", 710_000),
    ("risk_signals_api", "Risk Signals API", 640_000),
    ("geo_forecast_api", "Geo Forecast API", 520_000),
    ("market_intelligence_feed", "Market Intelligence Feed", 410_000),
    ("executive_insights_subscription", "Executive Insights Subscription", 190_000),
    ("government_watch_dashboard", "Government Watch Dashboard", 110_000),
]


def data_empire_id(prefix: str) -> str:
    return f"{prefix}-{uuid4().hex[:10].upper()}"


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()
