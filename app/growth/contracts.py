from __future__ import annotations

from typing import Any

from app.growth.models import future_iso, growth_id, utc_now_iso


DEMO_CONTRACTS: tuple[dict[str, Any], ...] = (
    {"account_name": "UAE Smart Safety Authority", "country": "UAE", "deal_type": "Government Security Grid", "stage": "pilot", "value": 1_850_000, "probability": 62, "owner": "Maya Global"},
    {"account_name": "India South University Network", "country": "India", "deal_type": "University Network", "stage": "procurement", "value": 1_240_000, "probability": 74, "owner": "Arjun GTM"},
    {"account_name": "US Healthcare Resilience Group", "country": "USA", "deal_type": "Hospital Group", "stage": "security review", "value": 2_600_000, "probability": 48, "owner": "Nora Enterprise"},
    {"account_name": "Germany Public Sector Command", "country": "Germany", "deal_type": "Government Security Grid", "stage": "RFP", "value": 1_420_000, "probability": 38, "owner": "Lena EU"},
    {"account_name": "Singapore Civic Response Grid", "country": "Singapore", "deal_type": "Smart City", "stage": "legal", "value": 980_000, "probability": 69, "owner": "Kai SEA"},
    {"account_name": "Australia Airport Authority", "country": "Australia", "deal_type": "Airport Authority", "stage": "qualified", "value": 720_000, "probability": 34, "owner": "Ava APAC"},
)


def seed_contracts(tenant_id: str) -> list[dict[str, Any]]:
    contracts = []
    for index, contract in enumerate(DEMO_CONTRACTS, start=1):
        contracts.append(
            {
                "contract_id": f"CON-{tenant_id}-{index:03d}",
                "tenant_id": tenant_id,
                "created_at": utc_now_iso(),
                "expected_close_date": future_iso(30 + index * 18),
                "risk": "watch" if int(contract["probability"]) < 45 else "healthy",
                "competitors": ["ServiceNow", "Palantir", "Datadog"][: 1 + index % 3],
                **contract,
            }
        )
    return contracts


def create_contract(tenant_id: str, data: dict[str, Any], government: bool = False) -> dict[str, Any]:
    value = int(data.get("value") or (1_500_000 if government else 650_000))
    return {
        "contract_id": growth_id("CON"),
        "tenant_id": tenant_id,
        "account_name": data.get("account_name") or ("Government Security Program" if government else "Enterprise Command Program"),
        "country": data.get("country") or ("UAE" if government else "India"),
        "deal_type": data.get("deal_type") or ("Government Security Grid" if government else "Industrial Campus"),
        "stage": "RFP" if government else "qualified",
        "value": value,
        "probability": 54 if government else 46,
        "expected_close_date": future_iso(75 if government else 45),
        "owner": data.get("owner") or "Global Expansion",
        "risk": "watch",
        "competitors": data.get("competitors") or ["ServiceNow", "Palantir"],
        "created_at": utc_now_iso(),
    }

