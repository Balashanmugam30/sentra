from __future__ import annotations

import json
from pathlib import Path
from threading import Lock
from typing import Any
from uuid import uuid4

from app.core.config import settings
from app.crm.forecast import build_forecast, build_growth_metrics
from app.crm.models import DEMO_OWNER_BY_TENANT, DEMO_TENANT_MARKETS, future_date, utc_now_iso
from app.crm.scoring import lead_recommendations, score_lead, scoring_factors
from app.tenancy.provisioning import tenancy_store


class CrmStore:
    def __init__(self, path: str) -> None:
        self._path = Path(path)
        self._path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = Lock()

    def _default_payload(self) -> dict[str, Any]:
        return {"leads": [], "deals": [], "activities": [], "demos": []}

    def _read(self) -> dict[str, Any]:
        if not self._path.exists():
            return self._default_payload()
        try:
            payload = json.loads(self._path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            return self._default_payload()
        default = self._default_payload()
        for key, value in default.items():
            payload.setdefault(key, value)
        return payload

    def _write(self, payload: dict[str, Any]) -> None:
        self._path.write_text(json.dumps(payload, indent=2), encoding="utf-8")

    def seed_demo(self) -> None:
        tenancy_store.seed_demo()
        with self._lock:
            payload = self._read()
            existing_tenants = {lead["tenant_id"] for lead in payload["leads"]}
            for tenant_id, market in DEMO_TENANT_MARKETS.items():
                if tenant_id in existing_tenants:
                    continue
                owner = DEMO_OWNER_BY_TENANT.get(tenant_id, "Sentra Growth")
                for index, (company, contact, role, industry, country, size) in enumerate(market["companies"], start=1):
                    lead = _lead(
                        tenant_id=tenant_id,
                        company_name=company,
                        contact_name=contact,
                        email=f"{contact.split()[0].lower()}@{company.lower().replace(' ', '').replace(',', '')}.example",
                        role=role,
                        industry=industry,
                        country=country,
                        company_size=size,
                        source=["inbound", "partner", "webinar"][index % 3],
                        status=["qualified", "demo_booked", "proposal_sent"][index - 1],
                        notes="Board budget signal and urgent command center evaluation requested.",
                        owner=owner,
                        deal_value_estimate=90_000 + index * 85_000,
                    )
                    payload["leads"].append(lead)
                    deal = _deal_from_lead(lead, stage=["qualified", "demo", "proposal"][index - 1])
                    payload["deals"].append(deal)
                    payload["activities"].append(
                        _activity(
                            tenant_id=tenant_id,
                            lead_id=lead["id"],
                            deal_id=deal["id"],
                            activity_type="demo" if index == 2 else "emails",
                            subject=f"{company} growth motion",
                            notes="Enterprise discovery completed with crisis operations stakeholders.",
                            owner=owner,
                        )
                    )
                    if index == 2:
                        payload["demos"].append(_demo(tenant_id, lead, owner))
            self._write(payload)

    def list_leads(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        self.seed_demo()
        with self._lock:
            return _sorted_by_score([_score(dict(lead)) for lead in self._read()["leads"] if lead["tenant_id"] in tenant_ids])

    def create_lead(self, tenant_id: str, data: dict[str, Any]) -> dict[str, Any]:
        with self._lock:
            payload = self._read()
            lead = _lead(tenant_id=tenant_id, **data)
            payload["leads"].append(lead)
            self._write(payload)
            return _score(dict(lead))

    def import_leads(self, tenant_id: str, leads: list[dict[str, Any]]) -> list[dict[str, Any]]:
        created = []
        with self._lock:
            payload = self._read()
            for data in leads:
                lead = _lead(tenant_id=tenant_id, **data)
                payload["leads"].append(lead)
                created.append(_score(dict(lead)))
            self._write(payload)
        return created

    def patch_lead(self, tenant_ids: list[str], lead_id: str, updates: dict[str, Any]) -> dict[str, Any] | None:
        with self._lock:
            payload = self._read()
            lead = _find(payload["leads"], lead_id, tenant_ids)
            if lead is None:
                return None
            for key, value in updates.items():
                if value is not None and key in lead:
                    lead[key] = value
            lead["score"] = score_lead(lead)
            self._write(payload)
            return dict(lead)

    def delete_lead(self, tenant_ids: list[str], lead_id: str) -> bool:
        with self._lock:
            payload = self._read()
            before = len(payload["leads"])
            payload["leads"] = [lead for lead in payload["leads"] if not (lead["id"] == lead_id and lead["tenant_id"] in tenant_ids)]
            self._write(payload)
            return len(payload["leads"]) != before

    def list_deals(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        self.seed_demo()
        with self._lock:
            return [dict(deal) for deal in self._read()["deals"] if deal["tenant_id"] in tenant_ids]

    def create_deal(self, tenant_id: str, data: dict[str, Any]) -> dict[str, Any]:
        with self._lock:
            payload = self._read()
            deal = _deal(tenant_id=tenant_id, **data)
            payload["deals"].append(deal)
            self._write(payload)
            return dict(deal)

    def patch_deal(self, tenant_ids: list[str], deal_id: str, updates: dict[str, Any]) -> dict[str, Any] | None:
        with self._lock:
            payload = self._read()
            deal = _find(payload["deals"], deal_id, tenant_ids)
            if deal is None:
                return None
            for key, value in updates.items():
                if value is not None and key in deal:
                    deal[key] = value
            deal["updated_at"] = utc_now_iso()
            self._write(payload)
            return dict(deal)

    def move_deal(self, tenant_ids: list[str], deal_id: str, stage: str) -> dict[str, Any] | None:
        with self._lock:
            payload = self._read()
            deal = _find(payload["deals"], deal_id, tenant_ids)
            if deal is None:
                return None
            timeline = list(deal.get("timeline") or [])
            timeline.append(f"Moved to {stage} at {utc_now_iso()}")
            deal["stage"] = stage
            deal["timeline"] = timeline[-8:]
            deal["updated_at"] = utc_now_iso()
            if stage == "closed_won":
                deal["probability"] = 100
            if stage == "closed_lost":
                deal["probability"] = 0
            self._write(payload)
            return dict(deal)

    def list_activities(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        self.seed_demo()
        with self._lock:
            return sorted(
                [dict(item) for item in self._read()["activities"] if item["tenant_id"] in tenant_ids],
                key=lambda item: item["created_at"],
                reverse=True,
            )

    def log_activity(self, tenant_id: str, data: dict[str, Any]) -> dict[str, Any]:
        with self._lock:
            payload = self._read()
            activity = _activity(tenant_id=tenant_id, **data)
            payload["activities"].append(activity)
            self._write(payload)
            return dict(activity)

    def list_demos(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        self.seed_demo()
        with self._lock:
            return sorted(
                [dict(item) for item in self._read()["demos"] if item["tenant_id"] in tenant_ids],
                key=lambda item: item["scheduled_at"],
            )

    def book_demo(self, tenant_id: str, data: dict[str, Any]) -> dict[str, Any]:
        with self._lock:
            payload = self._read()
            lead = next((item for item in payload["leads"] if item["id"] == data.get("lead_id") and item["tenant_id"] == tenant_id), None)
            demo = _demo(
                tenant_id,
                lead
                or {
                    "id": data.get("lead_id"),
                    "company_name": data["company_name"],
                    "contact_name": data["contact_name"],
                },
                data.get("owner") or "Sentra Growth",
                scheduled_at=data.get("scheduled_at"),
                agenda=data.get("agenda"),
            )
            payload["demos"].append(demo)
            self._write(payload)
            return dict(demo)

    def forecast(self, tenant_ids: list[str]) -> dict[str, Any]:
        return build_forecast(self.list_deals(tenant_ids), self.list_activities(tenant_ids))

    def scoring(self, tenant_ids: list[str]) -> dict[str, Any]:
        leads = self.list_leads(tenant_ids)
        return {
            "scored_leads": leads,
            "model_factors": scoring_factors(),
            "recommendations": lead_recommendations(leads),
        }

    def metrics(self, tenant_ids: list[str]) -> dict[str, Any]:
        return build_growth_metrics(self.list_leads(tenant_ids), self.list_deals(tenant_ids))


def tenant_scope(identity: dict[str, object], tenant: dict[str, object]) -> list[str]:
    if identity.get("role") == "super_admin":
        return list(DEMO_TENANT_MARKETS.keys())
    return [str(tenant["tenant_id"])]


def _lead(
    *,
    tenant_id: str,
    company_name: str,
    contact_name: str,
    email: str,
    phone: str = "",
    role: str,
    industry: str,
    country: str,
    company_size: str,
    source: str,
    status: str = "new",
    notes: str = "",
    owner: str,
    deal_value_estimate: int,
) -> dict[str, Any]:
    lead = {
        "id": f"LEAD-{uuid4().hex[:10].upper()}",
        "tenant_id": tenant_id,
        "company_name": company_name,
        "contact_name": contact_name,
        "email": email,
        "phone": phone,
        "role": role,
        "industry": industry,
        "country": country,
        "company_size": company_size,
        "source": source,
        "score": 0,
        "status": status,
        "notes": notes,
        "created_at": utc_now_iso(),
        "owner": owner,
        "deal_value_estimate": deal_value_estimate,
    }
    return _score(lead)


def _deal(
    *,
    tenant_id: str,
    company_name: str,
    value: int,
    probability: int,
    owner: str,
    risk: str,
    stage: str = "pipeline",
    lead_id: str | None = None,
    expected_close_date=None,
    competitors: list[str] | None = None,
    timeline: list[str] | None = None,
) -> dict[str, Any]:
    now = utc_now_iso()
    return {
        "id": f"DEAL-{uuid4().hex[:10].upper()}",
        "tenant_id": tenant_id,
        "lead_id": lead_id,
        "company_name": company_name,
        "stage": stage,
        "value": value,
        "probability": probability,
        "expected_close_date": str(expected_close_date or future_date(24)),
        "owner": owner,
        "risk": risk,
        "competitors": competitors or ["legacy BMS", "manual command center"],
        "timeline": timeline or ["Discovery complete", "Economic buyer identified"],
        "created_at": now,
        "updated_at": now,
    }


def _deal_from_lead(lead: dict[str, Any], *, stage: str) -> dict[str, Any]:
    probability = {"qualified": 35, "demo": 52, "proposal": 68}.get(stage, 40)
    return _deal(
        tenant_id=lead["tenant_id"],
        lead_id=lead["id"],
        company_name=lead["company_name"],
        stage=stage,
        value=int(lead["deal_value_estimate"]),
        probability=probability,
        expected_close_date=future_date(18 + probability // 4),
        owner=lead["owner"],
        risk="medium" if probability < 60 else "low",
    )


def _activity(
    *,
    tenant_id: str,
    subject: str,
    notes: str,
    owner: str,
    activity_type: str = "follow_up",
    lead_id: str | None = None,
    deal_id: str | None = None,
    next_step: str | None = "Schedule stakeholder demo",
) -> dict[str, Any]:
    return {
        "id": f"ACT-{uuid4().hex[:10].upper()}",
        "tenant_id": tenant_id,
        "lead_id": lead_id,
        "deal_id": deal_id,
        "activity_type": activity_type,
        "subject": subject,
        "notes": notes,
        "owner": owner,
        "created_at": utc_now_iso(),
        "next_step": next_step,
    }


def _demo(
    tenant_id: str,
    lead: dict[str, Any],
    owner: str,
    *,
    scheduled_at: str | None = None,
    agenda: str | None = None,
) -> dict[str, Any]:
    return {
        "id": f"DEMO-{uuid4().hex[:10].upper()}",
        "tenant_id": tenant_id,
        "lead_id": lead.get("id"),
        "company_name": lead["company_name"],
        "contact_name": lead["contact_name"],
        "scheduled_at": scheduled_at or f"{future_date(5)}T15:00:00+00:00",
        "owner": owner,
        "status": "scheduled",
        "agenda": agenda or "Executive crisis intelligence platform walkthrough",
        "meeting_url": f"https://meet.sentra.local/demo/{uuid4().hex[:8]}",
    }


def _score(lead: dict[str, Any]) -> dict[str, Any]:
    lead["score"] = score_lead(lead)
    return lead


def _sorted_by_score(leads: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return sorted(leads, key=lambda lead: (int(lead["score"]), int(lead["deal_value_estimate"])), reverse=True)


def _find(items: list[dict[str, Any]], item_id: str, tenant_ids: list[str]) -> dict[str, Any] | None:
    return next((item for item in items if item["id"] == item_id and item["tenant_id"] in tenant_ids), None)


crm_store = CrmStore(settings.sentra_crm_store_path)
