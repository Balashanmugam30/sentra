from __future__ import annotations

from app.ecosystem.models import CERTIFICATION_TRACKS, ecosystem_id, utc_now_iso


def certification_network(tenant_id: str) -> list[dict[str, object]]:
    return [
        {
            "certification_id": track,
            "tenant_id": tenant_id,
            "name": name,
            "certified_count": count,
            "training_revenue": revenue,
            "completion_rate": 82 + index * 4,
            "badge": "platinum" if revenue >= 100_000 else "gold",
        }
        for index, (track, name, count, revenue) in enumerate(CERTIFICATION_TRACKS)
    ]


def issue_certification(tenant_id: str, track: str | None = None) -> dict[str, object]:
    return {
        "credential_id": ecosystem_id("ECERT"),
        "tenant_id": tenant_id,
        "track": track or "engineer",
        "recipient": "Certified Sentra Systems Engineer",
        "badge": "platinum",
        "issued_at": utc_now_iso(),
        "training_revenue": 1_800,
    }
