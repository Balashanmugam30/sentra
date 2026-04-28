from __future__ import annotations

import json
from pathlib import Path
from threading import Lock
from typing import Any

from app.core.config import settings
from app.partners.models import DEMO_PARTNERS, PARTNER_TIERS, PARTNER_TYPES, partner_id, referral_id, utc_now_iso


class PartnerStore:
    def __init__(self, path: str) -> None:
        self._path = Path(path)
        self._path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = Lock()

    def _default_payload(self) -> dict[str, Any]:
        return {"partners": [], "referrals": [], "payouts": []}

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

    def seed_demo(self) -> dict[str, int]:
        created = 0
        with self._lock:
            payload = self._read()
            existing = {partner["partner_id"] for partner in payload["partners"]}
            for partner in DEMO_PARTNERS:
                if partner["partner_id"] in existing:
                    continue
                now = utc_now_iso()
                payload["partners"].append({**partner, "created_at": now, "updated_at": now})
                created += 1
            if not payload["referrals"]:
                payload["referrals"].extend(
                    [
                        _referral("TEN-BALA-UNI", "PAR-BHARAT-OPS", "Metro Campus Group", "ops@metrocampus.example", 180_000, "proposal"),
                        _referral("TEN-BALA-MFG", "PAR-SHIELD-GLOBAL", "Titan Industrial", "security@titan.example", 260_000, "demo"),
                        _referral("TEN-BALA-HOSP", "PAR-MEDFLOW", "SmartCare Network", "cxo@smartcare.example", 140_000, "qualified"),
                    ]
                )
            total = len(payload["partners"])
            self._write(payload)
        return {"created": created, "partners": total}

    def network(self) -> list[dict[str, Any]]:
        self.seed_demo()
        with self._lock:
            return sorted([dict(item) for item in self._read()["partners"]], key=lambda item: item["revenue_generated"], reverse=True)

    def referrals(self, tenant_ids: list[str] | None = None) -> list[dict[str, Any]]:
        self.seed_demo()
        with self._lock:
            referrals = [dict(item) for item in self._read()["referrals"]]
        if tenant_ids is not None:
            referrals = [item for item in referrals if item["tenant_id"] in tenant_ids]
        return sorted(referrals, key=lambda item: item["deal_value"], reverse=True)

    def live(self) -> dict[str, Any]:
        partners = self.network()
        referrals = self.referrals()
        total_revenue = sum(int(item["revenue_generated"]) for item in partners)
        return {
            "partner_count": len(partners),
            "platinum_partners": len([item for item in partners if item["tier"] == "platinum"]),
            "revenue_generated": total_revenue,
            "commission_due": sum(int(item["commission_due"]) for item in partners),
            "referred_pipeline": sum(int(item["deal_value"]) for item in referrals if item["status"] != "closed_lost"),
            "avg_partner_health": round(sum(int(item["health_score"]) for item in partners) / max(1, len(partners))),
            "top_partners": partners[:4],
        }

    def revenue(self) -> dict[str, Any]:
        partners = self.network()
        countries: dict[str, int] = {}
        tier_mix: dict[str, int] = {}
        for partner in partners:
            countries[partner["country"]] = countries.get(partner["country"], 0) + int(partner["revenue_generated"])
            tier_mix[partner["tier"]] = tier_mix.get(partner["tier"], 0) + 1
        revenue = sum(int(item["revenue_generated"]) for item in partners)
        return {
            "revenue_generated": revenue,
            "commission_due": sum(int(item["commission_due"]) for item in partners),
            "partner_revenue_share": round(revenue * 0.18),
            "top_countries": [{"country": country, "revenue": value} for country, value in sorted(countries.items(), key=lambda item: item[1], reverse=True)],
            "tier_mix": tier_mix,
        }

    def certifications(self) -> list[dict[str, Any]]:
        partners = self.network()
        rows: dict[str, dict[str, Any]] = {}
        for partner in partners:
            for certification in partner["certifications"]:
                row = rows.setdefault(certification, {"name": certification, "partners": 0, "tier_weight": 0})
                row["partners"] += 1
                row["tier_weight"] += {"silver": 1, "gold": 2, "platinum": 3}.get(partner["tier"], 1)
        return sorted(rows.values(), key=lambda item: item["tier_weight"], reverse=True)

    def create_partner(self, data: dict[str, Any]) -> dict[str, Any]:
        now = utc_now_iso()
        partner_type_value = data.get("partner_type") if data.get("partner_type") in PARTNER_TYPES else "reseller"
        tier = data.get("tier") if data.get("tier") in PARTNER_TIERS else "silver"
        partner = {
            "partner_id": partner_id(),
            "name": data["name"],
            "country": data.get("country") or "Global",
            "partner_type": partner_type_value,
            "tier": tier,
            "specialization": data.get("specialization") or "Enterprise Sentra ecosystem partner",
            "certifications": ["Sentra Partner Onboarding"],
            "revenue_generated": 0,
            "leads_sent": 0,
            "win_rate": 0,
            "commission_due": 0,
            "health_score": 64,
            "status": "pending",
            "created_at": now,
            "updated_at": now,
        }
        with self._lock:
            payload = self._read()
            payload["partners"].append(partner)
            self._write(payload)
        return partner

    def approve(self, partner_id_value: str) -> dict[str, Any] | None:
        return self._patch_partner(partner_id_value, {"status": "approved", "health_score": 78})

    def refer_lead(self, tenant_id: str, data: dict[str, Any]) -> dict[str, Any] | None:
        with self._lock:
            payload = self._read()
            partner = _find_partner(payload, data["partner_id"])
            if partner is None:
                return None
            referral = _referral(
                tenant_id,
                data["partner_id"],
                data.get("company_name") or "Enterprise Prospect",
                data.get("contact_email") or "buyer@example.com",
                int(data.get("deal_value") or 125_000),
                "qualified",
            )
            partner["leads_sent"] = int(partner.get("leads_sent") or 0) + 1
            partner["updated_at"] = utc_now_iso()
            payload["referrals"].append(referral)
            self._write(payload)
            return referral

    def payout(self, partner_id_value: str) -> dict[str, Any] | None:
        with self._lock:
            payload = self._read()
            partner = _find_partner(payload, partner_id_value)
            if partner is None:
                return None
            amount = int(partner.get("commission_due") or 0)
            partner["commission_due"] = 0
            partner["updated_at"] = utc_now_iso()
            payout = {"payout_id": f"PAY-{len(payload['payouts']) + 1:05d}", "partner_id": partner_id_value, "amount": amount, "paid_at": utc_now_iso()}
            payload["payouts"].append(payout)
            self._write(payload)
            return payout

    def _patch_partner(self, partner_id_value: str, updates: dict[str, Any]) -> dict[str, Any] | None:
        with self._lock:
            payload = self._read()
            partner = _find_partner(payload, partner_id_value)
            if partner is None:
                return None
            partner.update(updates)
            partner["updated_at"] = utc_now_iso()
            self._write(payload)
            return dict(partner)


def _find_partner(payload: dict[str, Any], partner_id_value: str) -> dict[str, Any] | None:
    return next((partner for partner in payload["partners"] if partner["partner_id"] == partner_id_value), None)


def _referral(tenant_id: str, partner_id_value: str, company_name: str, contact_email: str, deal_value: int, status: str) -> dict[str, Any]:
    return {
        "referral_id": referral_id(),
        "tenant_id": tenant_id,
        "partner_id": partner_id_value,
        "company_name": company_name,
        "contact_email": contact_email,
        "deal_value": deal_value,
        "status": status,
        "created_at": utc_now_iso(),
    }


partners_store = PartnerStore(settings.sentra_partners_store_path)
