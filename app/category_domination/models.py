from __future__ import annotations

from datetime import UTC, datetime
from uuid import uuid4

DEMO_TENANTS = ["TEN-BALA-UNI", "TEN-BALA-MFG", "TEN-BALA-HOSP", "TEN-GOV-SOUTH"]

CATEGORY_METRICS = {
    "tam": 48_000_000_000,
    "sam": 11_200_000_000,
    "som_capture_target": 1_600_000_000,
    "enterprise_wins": 42,
    "gov_shortlists": 11,
    "brand_mentions_month": 2_480,
    "positive_sentiment": 82,
    "analyst_rank": "Visionary",
    "competitive_win_rate": 74,
    "nps": 63,
    "renewal_confidence": 91,
    "avg_roi_delivered": 7.4,
    "ai_accuracy_advantage": 19,
    "operational_speed_gain": 44,
    "category_score": 96,
    "leadership_label": "MARKET LEADER",
}

COMPETITORS = [
    {
        "competitor_id": "legacyshield",
        "name": "LegacyShield",
        "pricing": "High services-heavy enterprise contract",
        "weaknesses": ["legacy architecture", "slow implementation", "limited AI governance"],
        "stale_features": ["static dashboards", "batch-only reporting", "manual escalation"],
        "trust_issues": ["opaque incident workflows", "weak executive reporting"],
        "slow_innovation": 86,
        "churn_risk": 68,
        "sentra_win_rate": 78,
    },
    {
        "competitor_id": "slowops-ai",
        "name": "SlowOps AI",
        "pricing": "Mid-market subscription",
        "weaknesses": ["shallow crisis workflows", "weak government fit", "limited telemetry"],
        "stale_features": ["single-agent assistant", "no data moat", "thin integrations"],
        "trust_issues": ["low explainability", "unclear tenant isolation"],
        "slow_innovation": 73,
        "churn_risk": 61,
        "sentra_win_rate": 72,
    },
    {
        "competitor_id": "crisisware",
        "name": "CrisisWare",
        "pricing": "Per-seat SaaS with add-on modules",
        "weaknesses": ["point solution sprawl", "poor executive story", "weak autonomy"],
        "stale_features": ["incident forms", "manual maps", "spreadsheet exports"],
        "trust_issues": ["fragmented audit trail", "limited sovereign readiness"],
        "slow_innovation": 79,
        "churn_risk": 64,
        "sentra_win_rate": 76,
    },
    {
        "competitor_id": "govmatrix",
        "name": "GovMatrix",
        "pricing": "Long procurement enterprise license",
        "weaknesses": ["slow UX", "legacy procurement motion", "limited SaaS monetization"],
        "stale_features": ["static risk matrices", "old GIS layers", "manual briefings"],
        "trust_issues": ["slow deployment", "weak commercial ecosystem"],
        "slow_innovation": 82,
        "churn_risk": 57,
        "sentra_win_rate": 69,
    },
    {
        "competitor_id": "commandos-inc",
        "name": "CommandOS Inc",
        "pricing": "Premium platform bundle",
        "weaknesses": ["narrow defense focus", "thin customer success", "limited growth OS"],
        "stale_features": ["closed ecosystem", "limited developer platform", "weak billing layer"],
        "trust_issues": ["low commercial transparency", "limited benchmark proof"],
        "slow_innovation": 66,
        "churn_risk": 52,
        "sentra_win_rate": 63,
    },
]

REGION_CAPTURE = [
    {"region": "North America", "capture": 18, "target": 34, "growth_rate": 42, "priority": "enterprise security"},
    {"region": "India", "capture": 24, "target": 48, "growth_rate": 61, "priority": "campus and government"},
    {"region": "Middle East", "capture": 16, "target": 42, "growth_rate": 58, "priority": "smart city and sovereign"},
    {"region": "Europe", "capture": 11, "target": 29, "growth_rate": 36, "priority": "critical infrastructure"},
    {"region": "SEA", "capture": 13, "target": 31, "growth_rate": 39, "priority": "airports and logistics"},
]


def category_id(prefix: str) -> str:
    return f"{prefix}-{uuid4().hex[:10].upper()}"


def utc_now_iso() -> str:
    return datetime.now(UTC).isoformat()

