from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any
from uuid import uuid4


DEMO_TENANTS: tuple[str, ...] = ("TEN-BALA-UNI", "TEN-BALA-MFG", "TEN-BALA-HOSP", "TEN-GOVSECURE")

BASE_EXECUTION_METRICS: dict[str, Any] = {
    "ARR": 8_200_000,
    "MRR": 683_000,
    "growth_percent": 171,
    "cash_balance": 9_400_000,
    "monthly_burn": 260_000,
    "runway_months": 36,
    "employees": 72,
    "countries": 10,
    "NPS": 61,
    "gross_margin_percent": 84,
    "LTV_CAC": 8.2,
    "board_readiness": 93,
    "CEO_confidence": 88,
    "pipeline": 18_400_000,
    "net_new_ARR": 2_600_000,
    "expansion_ARR": 1_850_000,
    "renewal_confidence": 91,
    "security_maturity": 92,
    "compliance_posture": 89,
    "team_health": 82,
    "productivity_score": 86,
}

DEPARTMENTS: tuple[dict[str, Any], ...] = (
    {"department": "Product", "owner": "Chief Product Office", "score": 91, "spend": 185_000, "strain": 64},
    {"department": "Engineering", "owner": "CTO", "score": 88, "spend": 420_000, "strain": 72},
    {"department": "Revenue", "owner": "CRO", "score": 86, "spend": 310_000, "strain": 66},
    {"department": "Customer Success", "owner": "CSO", "score": 84, "spend": 155_000, "strain": 58},
    {"department": "Security", "owner": "CISO", "score": 92, "spend": 140_000, "strain": 49},
    {"department": "People", "owner": "CHRO", "score": 79, "spend": 96_000, "strain": 61},
)

BOARD_ACTIONS: tuple[dict[str, Any], ...] = (
    {
        "action_id": "BOARD-RAISE-C",
        "title": "Prepare Series C narrative but raise only after UAE anchor closes",
        "upside": "Raises valuation leverage by 22% and avoids dilution while cash is strong.",
        "risk": "Competitor may capture government narrative first.",
        "cost": 180_000,
        "confidence": 87,
        "timeline": "90 days",
    },
    {
        "action_id": "BOARD-SG-HQ",
        "title": "Open Singapore regional command HQ",
        "upside": "Creates SEA government and hospital group credibility.",
        "risk": "Adds operating complexity across compliance regions.",
        "cost": 420_000,
        "confidence": 82,
        "timeline": "120 days",
    },
    {
        "action_id": "BOARD-CAC-20",
        "title": "Reduce CAC by 20% through partner-led government motion",
        "upside": "Improves magic number and pushes LTV/CAC above 10x.",
        "risk": "Partner enablement quality must be controlled.",
        "cost": 95_000,
        "confidence": 90,
        "timeline": "60 days",
    },
    {
        "action_id": "BOARD-ACQUIRE",
        "title": "Model acquisition of a civic alerting micro-SaaS",
        "upside": "Adds installed public-sector distribution and SMS depth.",
        "risk": "Integration distraction during expansion phase.",
        "cost": 1_800_000,
        "confidence": 76,
        "timeline": "6 months",
    },
)

WORKFLOWS: tuple[dict[str, Any], ...] = (
    {"workflow_id": "WF-LAUNCH-COUNTRY", "name": "Launch country", "owner": "COO", "status": "ready", "automation_level": 82, "steps": 12},
    {"workflow_id": "WF-HIRE-TEAM", "name": "Hire team", "owner": "CHRO", "status": "active", "automation_level": 68, "steps": 9},
    {"workflow_id": "WF-RAISE-ROUND", "name": "Raise round", "owner": "CEO", "status": "board_review", "automation_level": 74, "steps": 14},
    {"workflow_id": "WF-REDUCE-SPEND", "name": "Reduce spend", "owner": "CFO", "status": "ready", "automation_level": 79, "steps": 8},
    {"workflow_id": "WF-MNA-DILIGENCE", "name": "M&A diligence", "owner": "CEO", "status": "scenario", "automation_level": 62, "steps": 16},
    {"workflow_id": "WF-SECURITY-HARDEN", "name": "Security hardening", "owner": "CISO", "status": "active", "automation_level": 86, "steps": 11},
    {"workflow_id": "WF-SALES-BLITZ", "name": "Sales blitz", "owner": "CRO", "status": "ready", "automation_level": 78, "steps": 10},
    {"workflow_id": "WF-CUSTOMER-SAVE", "name": "Customer save motion", "owner": "CRO", "status": "active", "automation_level": 81, "steps": 7},
)


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def future_iso(days: int) -> str:
    return (datetime.now(timezone.utc) + timedelta(days=days)).isoformat()


def execution_id(prefix: str) -> str:
    return f"{prefix}-{uuid4().hex[:8].upper()}"
