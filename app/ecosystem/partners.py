from __future__ import annotations

from app.ecosystem.models import PARTNER_TYPES, ecosystem_id


def seed_partner_network(tenant_id: str) -> list[dict[str, object]]:
    countries = ["UAE", "India", "Singapore", "Germany", "USA", "Saudi", "UK"]
    rows = []
    for index, (partner_type, label, active, pipeline) in enumerate(PARTNER_TYPES):
        rows.append(
            {
                "partner_id": ecosystem_id("EPRT"),
                "tenant_id": tenant_id,
                "name": f"Sentra {label} Alliance",
                "partner_type": partner_type,
                "active_partners": active,
                "pipeline": pipeline,
                "sourced_arr": round(pipeline * 0.33),
                "close_rate": 22 + index * 3,
                "top_country": countries[index % len(countries)],
                "status": "active",
            }
        )
    return rows


def launch_partner_row(tenant_id: str, partner_type: str | None = None) -> dict[str, object]:
    partner_kind = partner_type or "government_si"
    return {
        "partner_id": ecosystem_id("EPRT"),
        "tenant_id": tenant_id,
        "name": "Civic Command Systems Partner",
        "partner_type": partner_kind,
        "active_partners": 1,
        "pipeline": 420_000,
        "sourced_arr": 138_000,
        "close_rate": 34,
        "top_country": "UAE",
        "status": "active",
    }
