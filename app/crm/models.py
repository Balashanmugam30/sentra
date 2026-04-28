from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any


LEAD_STATUSES: tuple[str, ...] = (
    "new",
    "qualified",
    "contacted",
    "demo_booked",
    "proposal_sent",
    "negotiation",
    "won",
    "lost",
    "nurture",
)

DEAL_STAGES: tuple[str, ...] = (
    "pipeline",
    "qualified",
    "demo",
    "proposal",
    "legal",
    "procurement",
    "closed_won",
    "closed_lost",
)

ACTIVITY_TYPES: tuple[str, ...] = ("calls", "emails", "meetings", "demo", "follow_up", "contract")


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def future_date(days: int) -> str:
    return (datetime.now(timezone.utc) + timedelta(days=days)).date().isoformat()


DEMO_TENANT_MARKETS: dict[str, dict[str, Any]] = {
    "TEN-BALA-UNI": {
        "segment": "campus",
        "companies": [
            ("Coimbatore Smart University", "Dr. Priya Menon", "CISO", "university", "India", "18,000"),
            ("Western State College", "Marcus Lee", "VP Operations", "university", "United States", "32,000"),
            ("Riverfront Tech Campus", "Nina Shah", "Campus Safety Director", "smart campus", "India", "7,500"),
        ],
    },
    "TEN-BALA-MFG": {
        "segment": "industrial",
        "companies": [
            ("Orion Advanced Manufacturing", "Elena Vargas", "COO", "factory", "Mexico", "4,200"),
            ("Axis Battery Gigafactory", "Jonah Kim", "Plant Director", "factory", "South Korea", "8,900"),
            ("Kaveri Industrial Park", "Arun Nair", "Security Head", "industrial campus", "India", "11,000"),
        ],
    },
    "TEN-BALA-HOSP": {
        "segment": "healthcare",
        "companies": [
            ("Northbridge Medical Center", "Sarah Whitman", "Chief Resilience Officer", "hospital", "United Kingdom", "900 beds"),
            ("Aster Emergency Network", "Ravi Iyer", "Emergency Director", "hospital", "India", "1,400 beds"),
            ("Metro Health Authority", "Camille Dubois", "Public Safety Lead", "government", "France", "22 sites"),
        ],
    },
}


DEMO_OWNER_BY_TENANT: dict[str, str] = {
    "TEN-BALA-UNI": "Sentra Growth Alpha",
    "TEN-BALA-MFG": "Sentra Enterprise East",
    "TEN-BALA-HOSP": "Sentra Public Sector",
}
