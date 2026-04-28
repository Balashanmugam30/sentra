from __future__ import annotations

import json
from pathlib import Path
from threading import Lock
from typing import Any

from app.core.config import settings
from app.ml.store import DEMO_TENANTS


SEEDED_AT = "2026-04-26T00:00:00+00:00"
STORE_VERSION = "phase27c-2026-04-26"

PARTNERS: tuple[dict[str, Any], ...] = (
    {"partner_id": "PAR-TATA-SI", "tenant_id": "TEN-BALA-UNI", "name": "Tata Systems Integrator", "type": "regional system integrator", "region": "India", "countries": ["India", "UAE"], "tier": "Platinum", "status": "active", "support_grade": "A", "certification_level": "Sentra Elite", "support_sla_hours": 6, "pipeline_arr": 4200000, "partner_arr": 1380000, "score": 94},
    {"partner_id": "PAR-ACCENTURE-PS", "tenant_id": "TEN-GRAND-MERIDIAN", "name": "Accenture Public Safety", "type": "implementation partner", "region": "Global", "countries": ["USA", "UK", "Australia"], "tier": "Diamond", "status": "active", "support_grade": "A+", "certification_level": "Global Command", "support_sla_hours": 4, "pipeline_arr": 7800000, "partner_arr": 2680000, "score": 97},
    {"partner_id": "PAR-DELOITTE-RISK", "tenant_id": "TEN-GOVSECURE", "name": "Deloitte Risk Advisory", "type": "government consultant", "region": "UK + EU", "countries": ["UK", "Saudi Arabia"], "tier": "Gold", "status": "security_review", "support_grade": "A", "certification_level": "Procurement Ready", "support_sla_hours": 8, "pipeline_arr": 3100000, "partner_arr": 940000, "score": 89},
    {"partner_id": "PAR-UAE-SMART", "tenant_id": "TEN-GOVSECURE", "name": "UAE Smart City Group", "type": "public sector channel", "region": "Middle East", "countries": ["UAE", "Saudi Arabia"], "tier": "Platinum", "status": "active", "support_grade": "A", "certification_level": "Sovereign Pilot", "support_sla_hours": 5, "pipeline_arr": 6400000, "partner_arr": 1820000, "score": 95},
    {"partner_id": "PAR-INFOSYS-INFRA", "tenant_id": "TEN-BALA-HOSP", "name": "Infosys Command Infra", "type": "implementation partner", "region": "APAC", "countries": ["India", "Singapore", "Australia"], "tier": "Gold", "status": "active", "support_grade": "A-", "certification_level": "Enterprise Deployment", "support_sla_hours": 9, "pipeline_arr": 2800000, "partner_arr": 760000, "score": 87},
    {"partner_id": "PAR-SG-GOVTECH", "tenant_id": "TEN-GOVSECURE", "name": "Singapore GovTech Partner", "type": "government partner", "region": "Singapore", "countries": ["Singapore"], "tier": "Platinum", "status": "active", "support_grade": "A", "certification_level": "Gov Cloud Ready", "support_sla_hours": 5, "pipeline_arr": 3600000, "partner_arr": 1160000, "score": 92},
)

RESELLERS: tuple[dict[str, Any], ...] = (
    {"reseller_id": "RES-INDIA-WEST", "tenant_id": "TEN-BALA-UNI", "name": "India West Safety Channel", "country": "India", "tier": "Platinum", "mrr": 186000, "commission_rate": 18, "commission_due": 33480, "open_deals": 18, "seats_under_management": 7400, "status": "active"},
    {"reseller_id": "RES-UAE-GOV", "tenant_id": "TEN-GOVSECURE", "name": "UAE Gov Safety Channel", "country": "UAE", "tier": "Diamond", "mrr": 242000, "commission_rate": 16, "commission_due": 38720, "open_deals": 11, "seats_under_management": 5200, "status": "active"},
    {"reseller_id": "RES-SG-HEALTH", "tenant_id": "TEN-BALA-HOSP", "name": "Singapore HealthTech Reseller", "country": "Singapore", "tier": "Gold", "mrr": 98000, "commission_rate": 15, "commission_due": 14700, "open_deals": 7, "seats_under_management": 2100, "status": "watch"},
)

WHITE_LABEL_BRANDS: tuple[dict[str, Any], ...] = (
    {"brand_id": "BR-SAFECITY", "tenant_id": "TEN-GOVSECURE", "name": "SafeCity Command", "client": "SmartCity Authority", "region": "Middle East", "custom_domain": "command.safecity.demo", "theme": "civic blue", "language_packs": ["English", "Arabic"], "license_seats": 18000, "licensing_arr": 1420000, "status": "live", "domain_status": "verified"},
    {"brand_id": "BR-GOVSHIELD", "tenant_id": "TEN-GOVSECURE", "name": "GovShield OS", "client": "GovSecure South", "region": "APAC Gov", "custom_domain": "ops.govshield.demo", "theme": "sovereign green", "language_packs": ["English", "Hindi"], "license_seats": 24000, "licensing_arr": 1880000, "status": "pilot", "domain_status": "pending"},
    {"brand_id": "BR-METROSECURE", "tenant_id": "TEN-GRAND-MERIDIAN", "name": "MetroSecure AI", "client": "Nova Mall Group", "region": "USA", "custom_domain": "security.metrosecure.demo", "theme": "metro noir", "language_packs": ["English", "Spanish"], "license_seats": 12800, "licensing_arr": 960000, "status": "live", "domain_status": "verified"},
    {"brand_id": "BR-CAMPUSGUARD", "tenant_id": "TEN-BALA-UNI", "name": "CampusGuard Pro", "client": "Skyline University", "region": "India", "custom_domain": "guard.campuspro.demo", "theme": "campus amber", "language_packs": ["English", "Tamil", "Hindi"], "license_seats": 9200, "licensing_arr": 540000, "status": "implementation", "domain_status": "verified"},
)

OEM_CONTRACTS: tuple[dict[str, Any], ...] = (
    {"oem_id": "OEM-BMS", "tenant_id": "TEN-BALA-MFG", "name": "Building Management Suite OEM", "sector": "smart buildings", "partner": "BuildingSoft Global", "annual_commitment": 2100000, "seats": 42000, "api_embedded_usage": 11800000, "revenue_model": "per-building + API", "status": "active", "renewal": "2026-12-15"},
    {"oem_id": "OEM-HOSP", "tenant_id": "TEN-BALA-HOSP", "name": "Hospital Ops Console OEM", "sector": "healthcare", "partner": "MetroCare Platform", "annual_commitment": 1600000, "seats": 26000, "api_embedded_usage": 7200000, "revenue_model": "annual license", "status": "legal_review", "renewal": "2026-10-01"},
    {"oem_id": "OEM-AIRPORT", "tenant_id": "TEN-GOVSECURE", "name": "Smart Airport Grid OEM", "sector": "airports", "partner": "AeroGrid Systems", "annual_commitment": 3400000, "seats": 58000, "api_embedded_usage": 16400000, "revenue_model": "minimum commit + usage", "status": "active", "renewal": "2027-01-20"},
)

COUNTRIES: tuple[dict[str, Any], ...] = (
    {"country_id": "CTY-IN", "tenant_id": "TEN-BALA-UNI", "name": "India", "region": "South Asia", "readiness_score": 94, "legal_complexity": 42, "pricing_fit": 91, "partner_coverage": 88, "procurement_readiness": 86, "language_readiness": 92, "status": "live", "blocked": False, "next_action": "Scale university and hospital verticals"},
    {"country_id": "CTY-UAE", "tenant_id": "TEN-GOVSECURE", "name": "UAE", "region": "Middle East", "readiness_score": 91, "legal_complexity": 48, "pricing_fit": 95, "partner_coverage": 82, "procurement_readiness": 90, "language_readiness": 86, "status": "launch_ready", "blocked": False, "next_action": "Launch sovereign smart-city pilot"},
    {"country_id": "CTY-SG", "tenant_id": "TEN-GOVSECURE", "name": "Singapore", "region": "APAC", "readiness_score": 88, "legal_complexity": 36, "pricing_fit": 89, "partner_coverage": 79, "procurement_readiness": 92, "language_readiness": 96, "status": "launch_ready", "blocked": False, "next_action": "Close GovTech partner reference"},
    {"country_id": "CTY-SA", "tenant_id": "TEN-GOVSECURE", "name": "Saudi Arabia", "region": "Middle East", "readiness_score": 79, "legal_complexity": 62, "pricing_fit": 93, "partner_coverage": 68, "procurement_readiness": 74, "language_readiness": 77, "status": "legal_review", "blocked": False, "next_action": "Complete data residency review"},
    {"country_id": "CTY-UK", "tenant_id": "TEN-GRAND-MERIDIAN", "name": "UK", "region": "Europe", "readiness_score": 82, "legal_complexity": 54, "pricing_fit": 83, "partner_coverage": 72, "procurement_readiness": 80, "language_readiness": 100, "status": "pipeline", "blocked": False, "next_action": "Secure NHS-compliant channel motion"},
    {"country_id": "CTY-USA", "tenant_id": "TEN-GRAND-MERIDIAN", "name": "USA", "region": "North America", "readiness_score": 86, "legal_complexity": 58, "pricing_fit": 96, "partner_coverage": 74, "procurement_readiness": 78, "language_readiness": 91, "status": "pipeline", "blocked": False, "next_action": "Build state-by-state reseller playbook"},
    {"country_id": "CTY-AUS", "tenant_id": "TEN-BALA-HOSP", "name": "Australia", "region": "APAC", "readiness_score": 81, "legal_complexity": 46, "pricing_fit": 82, "partner_coverage": 64, "procurement_readiness": 77, "language_readiness": 99, "status": "partner_search", "blocked": False, "next_action": "Recruit emergency-services integrator"},
)

FRANCHISE_OPERATORS: tuple[dict[str, Any], ...] = (
    {"operator_id": "FR-MUMBAI", "tenant_id": "TEN-BALA-UNI", "name": "Mumbai Managed Safety Operator", "country": "India", "city_exclusivity": "Mumbai West", "managed_deployments": 46, "onboarding_score": 93, "arr": 640000, "potential_arr": 1900000, "status": "active"},
    {"operator_id": "FR-DUBAI", "tenant_id": "TEN-GOVSECURE", "name": "Dubai Civil Command Operator", "country": "UAE", "city_exclusivity": "Dubai hospitality district", "managed_deployments": 28, "onboarding_score": 91, "arr": 880000, "potential_arr": 2600000, "status": "pilot"},
    {"operator_id": "FR-LONDON", "tenant_id": "TEN-GRAND-MERIDIAN", "name": "London Critical Facilities Operator", "country": "UK", "city_exclusivity": "London health + campuses", "managed_deployments": 12, "onboarding_score": 84, "arr": 340000, "potential_arr": 1400000, "status": "ramp"},
)

REGIONAL_PIPELINES: tuple[dict[str, Any], ...] = (
    {"pipeline_id": "PIPE-IN-HOSP", "tenant_id": "TEN-BALA-HOSP", "region": "India", "country": "India", "segment": "hospital networks", "stage": "proposal", "weighted_arr": 1280000, "probability": 72, "next_step": "CISO trust room review", "owner": "Tata Systems Integrator"},
    {"pipeline_id": "PIPE-UAE-CITY", "tenant_id": "TEN-GOVSECURE", "region": "Middle East", "country": "UAE", "segment": "smart city command", "stage": "security review", "weighted_arr": 2460000, "probability": 68, "next_step": "Sovereign data controls", "owner": "UAE Smart City Group"},
    {"pipeline_id": "PIPE-USA-MALL", "tenant_id": "TEN-GRAND-MERIDIAN", "region": "North America", "country": "USA", "segment": "mall groups", "stage": "discovery", "weighted_arr": 940000, "probability": 44, "next_step": "Reseller shortlist", "owner": "Accenture Public Safety"},
    {"pipeline_id": "PIPE-SG-GOV", "tenant_id": "TEN-GOVSECURE", "region": "APAC", "country": "Singapore", "segment": "government pilots", "stage": "partner meeting", "weighted_arr": 1120000, "probability": 63, "next_step": "GovTech reference architecture", "owner": "Singapore GovTech Partner"},
)

PARTNER_REVENUE: tuple[dict[str, Any], ...] = (
    {"revenue_id": "CHREV-001", "tenant_id": "TEN-BALA-UNI", "partner_id": "PAR-TATA-SI", "country": "India", "arr": 1380000, "mrr": 115000, "commission_due": 20700, "payout_status": "scheduled", "take_rate": 82, "forecast_arr": 2480000},
    {"revenue_id": "CHREV-002", "tenant_id": "TEN-GOVSECURE", "partner_id": "PAR-UAE-SMART", "country": "UAE", "arr": 1820000, "mrr": 151667, "commission_due": 24267, "payout_status": "approved", "take_rate": 84, "forecast_arr": 4100000},
    {"revenue_id": "CHREV-003", "tenant_id": "TEN-GRAND-MERIDIAN", "partner_id": "PAR-ACCENTURE-PS", "country": "USA", "arr": 2680000, "mrr": 223333, "commission_due": 35733, "payout_status": "pending_invoice", "take_rate": 86, "forecast_arr": 6200000},
)

COMMISSIONS: tuple[dict[str, Any], ...] = (
    {"commission_id": "COM-001", "tenant_id": "TEN-BALA-UNI", "partner_id": "PAR-TATA-SI", "amount": 20700, "status": "due", "due_at": "2026-05-01", "paid_at": None},
    {"commission_id": "COM-002", "tenant_id": "TEN-GOVSECURE", "partner_id": "PAR-UAE-SMART", "amount": 24267, "status": "approved", "due_at": "2026-05-05", "paid_at": None},
    {"commission_id": "COM-003", "tenant_id": "TEN-GRAND-MERIDIAN", "partner_id": "PAR-ACCENTURE-PS", "amount": 35733, "status": "invoice_pending", "due_at": "2026-05-08", "paid_at": None},
)

CERTIFICATIONS: tuple[dict[str, Any], ...] = (
    {"certification_id": "CERT-TATA-ELITE", "tenant_id": "TEN-BALA-UNI", "partner_id": "PAR-TATA-SI", "name": "Sentra Elite Implementer", "level": "Elite", "trained_staff": 128, "score": 94, "expires_at": "2027-04-01", "status": "active"},
    {"certification_id": "CERT-ACC-GLOBAL", "tenant_id": "TEN-GRAND-MERIDIAN", "partner_id": "PAR-ACCENTURE-PS", "name": "Global Command Deployment", "level": "Diamond", "trained_staff": 260, "score": 97, "expires_at": "2027-06-15", "status": "active"},
    {"certification_id": "CERT-DELOITTE-GOV", "tenant_id": "TEN-GOVSECURE", "partner_id": "PAR-DELOITTE-RISK", "name": "Government Risk Advisory", "level": "Gold", "trained_staff": 76, "score": 88, "expires_at": "2026-11-30", "status": "renewal_due"},
)

PARTNER_TIERS: tuple[dict[str, Any], ...] = (
    {"tier_id": "TIER-DIAMOND", "name": "Diamond", "min_arr": 2000000, "commission_rate": 16, "support_sla_hours": 4, "benefits": ["joint enterprise account planning", "priority sandbox", "boardroom co-sell"]},
    {"tier_id": "TIER-PLATINUM", "name": "Platinum", "min_arr": 1000000, "commission_rate": 18, "support_sla_hours": 6, "benefits": ["regional exclusivity", "implementation academy", "deal desk support"]},
    {"tier_id": "TIER-GOLD", "name": "Gold", "min_arr": 350000, "commission_rate": 15, "support_sla_hours": 10, "benefits": ["certification portal", "demo lab access", "quarterly pipeline review"]},
)

BLOCKED_COUNTRIES: tuple[dict[str, Any], ...] = (
    {"block_id": "BLK-001", "tenant_id": "TEN-GOVSECURE", "country": "Restricted Market A", "reason": "Sanctions and export control review", "severity": "critical", "review_date": "2026-07-01"},
    {"block_id": "BLK-002", "tenant_id": "TEN-GRAND-MERIDIAN", "country": "Restricted Market B", "reason": "Local data hosting unavailable", "severity": "high", "review_date": "2026-08-15"},
)

LEGAL_READINESS: tuple[dict[str, Any], ...] = (
    {"legal_id": "LEGAL-IN", "tenant_id": "TEN-BALA-UNI", "country": "India", "privacy_ready": 91, "procurement_ready": 86, "data_residency": "available", "contract_pack": "DPDP + enterprise"},
    {"legal_id": "LEGAL-UAE", "tenant_id": "TEN-GOVSECURE", "country": "UAE", "privacy_ready": 84, "procurement_ready": 90, "data_residency": "partner-hosted", "contract_pack": "sovereign pilot"},
    {"legal_id": "LEGAL-USA", "tenant_id": "TEN-GRAND-MERIDIAN", "country": "USA", "privacy_ready": 79, "procurement_ready": 76, "data_residency": "available", "contract_pack": "state addendum required"},
)

PRICING_BY_REGION: tuple[dict[str, Any], ...] = (
    {"pricing_id": "PRICE-IN", "tenant_id": "TEN-BALA-UNI", "country": "India", "currency": "INR", "base_platform_mrr": 6200, "per_site_mrr": 980, "partner_margin": 18, "pricing_fit": 91, "status": "approved"},
    {"pricing_id": "PRICE-UAE", "tenant_id": "TEN-GOVSECURE", "country": "UAE", "currency": "AED", "base_platform_mrr": 11200, "per_site_mrr": 1800, "partner_margin": 16, "pricing_fit": 95, "status": "approved"},
    {"pricing_id": "PRICE-USA", "tenant_id": "TEN-GRAND-MERIDIAN", "country": "USA", "currency": "USD", "base_platform_mrr": 14800, "per_site_mrr": 2400, "partner_margin": 14, "pricing_fit": 96, "status": "board_review"},
)

EXPANSION_SCORECARDS: tuple[dict[str, Any], ...] = (
    {"scorecard_id": "SCORE-IN", "tenant_id": "TEN-BALA-UNI", "country": "India", "expansion_score": 94, "next_best_action": "Scale hospital and campus partner pods", "weak_signal": "Partner enablement backlog rising"},
    {"scorecard_id": "SCORE-UAE", "tenant_id": "TEN-GOVSECURE", "country": "UAE", "expansion_score": 91, "next_best_action": "Launch SafeCity Command sovereign pilot", "weak_signal": "Legal review must close before national rollout"},
    {"scorecard_id": "SCORE-SG", "tenant_id": "TEN-GOVSECURE", "country": "Singapore", "expansion_score": 88, "next_best_action": "Package GovTech reference architecture", "weak_signal": "Need one more local implementation partner"},
)


class ChannelStore:
    def __init__(self, path: str) -> None:
        self._path = Path(path)
        self._path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = Lock()

    def _default_payload(self) -> dict[str, Any]:
        return {
            "store_version": STORE_VERSION,
            "partners": [],
            "resellers": [],
            "white_label_brands": [],
            "oem_contracts": [],
            "countries": [],
            "franchise_operators": [],
            "regional_pipelines": [],
            "partner_revenue": [],
            "commissions": [],
            "certifications": [],
            "partner_tiers": [],
            "blocked_countries": [],
            "legal_readiness": [],
            "pricing_by_region": [],
            "expansion_scorecards": [],
            "events": [],
        }

    def _read(self) -> dict[str, Any]:
        if not self._path.exists():
            return self._default_payload()
        try:
            payload = json.loads(self._path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            return self._default_payload()
        if payload.get("store_version") != STORE_VERSION:
            return self._default_payload()
        default = self._default_payload()
        for key, value in default.items():
            payload.setdefault(key, value)
        return payload

    def _write(self, payload: dict[str, Any]) -> None:
        self._path.write_text(json.dumps(payload, indent=2), encoding="utf-8")

    def seed_demo(self) -> dict[str, int]:
        created = 0
        seed_groups = {
            "partners": (PARTNERS, "partner_id"),
            "resellers": (RESELLERS, "reseller_id"),
            "white_label_brands": (WHITE_LABEL_BRANDS, "brand_id"),
            "oem_contracts": (OEM_CONTRACTS, "oem_id"),
            "countries": (COUNTRIES, "country_id"),
            "franchise_operators": (FRANCHISE_OPERATORS, "operator_id"),
            "regional_pipelines": (REGIONAL_PIPELINES, "pipeline_id"),
            "partner_revenue": (PARTNER_REVENUE, "revenue_id"),
            "commissions": (COMMISSIONS, "commission_id"),
            "certifications": (CERTIFICATIONS, "certification_id"),
            "partner_tiers": (PARTNER_TIERS, "tier_id"),
            "blocked_countries": (BLOCKED_COUNTRIES, "block_id"),
            "legal_readiness": (LEGAL_READINESS, "legal_id"),
            "pricing_by_region": (PRICING_BY_REGION, "pricing_id"),
            "expansion_scorecards": (EXPANSION_SCORECARDS, "scorecard_id"),
        }
        with self._lock:
            payload = self._read()
            for table, (rows, key) in seed_groups.items():
                existing = {row[key] for row in payload[table] if key in row}
                for row in rows:
                    if row[key] in existing:
                        continue
                    payload[table].append({**row, "updated_at": SEEDED_AT})
                    created += 1
            self._write(payload)
        return {"created": created}

    def rows(self, table: str, tenant_ids: list[str]) -> list[dict[str, Any]]:
        self.seed_demo()
        with self._lock:
            rows = [dict(row) for row in self._read()[table]]
        if set(tenant_ids) == set(DEMO_TENANTS):
            return rows
        return [row for row in rows if row.get("tenant_id") in tenant_ids or "tenant_id" not in row]

    def partner_apply(self, tenant_id: str, payload_data: dict[str, Any]) -> dict[str, Any]:
        with self._lock:
            payload = self._read()
            partner_index = len(payload["partners"]) + 1
            partner = {
                "partner_id": f"PAR-CUSTOM-{partner_index:03d}",
                "tenant_id": tenant_id,
                "name": payload_data.get("name") or "New Regional Partner",
                "type": payload_data.get("type") or "regional applicant",
                "region": payload_data.get("region") or "Expansion Region",
                "countries": [payload_data.get("country") or "India"],
                "tier": payload_data.get("tier") or "Applicant",
                "status": "applied",
                "support_grade": "B",
                "certification_level": "Pending",
                "support_sla_hours": 24,
                "pipeline_arr": int(payload_data.get("pipeline_arr") or 240000),
                "partner_arr": 0,
                "score": 74,
                "updated_at": SEEDED_AT,
            }
            payload["partners"].append(partner)
            event = self._event(payload, tenant_id, "partner_applied", {"partner_id": partner["partner_id"]})
            self._write(payload)
            return {"partner": partner, "event": event}

    def update_partner(self, tenant_ids: list[str], partner_id: str, action: str, tier: str | None = None) -> dict[str, Any] | None:
        with self._lock:
            payload = self._read()
            partner = _find(payload["partners"], "partner_id", partner_id, tenant_ids)
            if partner is None:
                return None
            if action == "approve":
                partner["status"] = "active"
                partner["score"] = max(int(partner.get("score", 0)), 88)
                event_action = "partner_approved"
            elif action == "reject":
                partner["status"] = "rejected"
                event_action = "partner_rejected"
            else:
                partner["tier"] = tier or "Platinum"
                partner["score"] = min(100, int(partner.get("score", 0)) + 4)
                event_action = "partner_tier_upgraded"
            partner["updated_at"] = SEEDED_AT
            event = self._event(payload, str(partner["tenant_id"]), event_action, {"partner_id": partner_id, "tier": partner.get("tier")})
            self._write(payload)
            return {"partner": dict(partner), "event": event}

    def launch_country(self, tenant_id: str, country: str) -> dict[str, Any]:
        with self._lock:
            payload = self._read()
            country_row = next((row for row in payload["countries"] if str(row["name"]).lower() == country.lower() or row["country_id"] == country), None)
            if country_row is None:
                country_row = {
                    "country_id": f"CTY-CUSTOM-{len(payload['countries']) + 1:03d}",
                    "tenant_id": tenant_id,
                    "name": country,
                    "region": "New Market",
                    "readiness_score": 76,
                    "legal_complexity": 58,
                    "pricing_fit": 81,
                    "partner_coverage": 62,
                    "procurement_readiness": 70,
                    "language_readiness": 75,
                    "status": "launched",
                    "blocked": False,
                    "next_action": "Recruit launch partner and localize procurement pack",
                    "updated_at": SEEDED_AT,
                }
                payload["countries"].append(country_row)
            else:
                country_row["status"] = "launched"
                country_row["blocked"] = False
                country_row["updated_at"] = SEEDED_AT
            event = self._event(payload, str(country_row["tenant_id"]), "country_launched", {"country": country_row["name"]})
            self._write(payload)
            return {"country": dict(country_row), "event": event}

    def create_brand(self, tenant_id: str, payload_data: dict[str, Any]) -> dict[str, Any]:
        with self._lock:
            payload = self._read()
            brand_index = len(payload["white_label_brands"]) + 1
            name = payload_data.get("name") or "New Sentra White Label"
            brand = {
                "brand_id": f"BR-CUSTOM-{brand_index:03d}",
                "tenant_id": tenant_id,
                "name": name,
                "client": payload_data.get("client") or "Strategic Channel Client",
                "region": payload_data.get("region") or "Global",
                "custom_domain": payload_data.get("custom_domain") or f"{str(name).lower().replace(' ', '-')}.sentra-channel.demo",
                "theme": payload_data.get("theme") or "executive graphite",
                "language_packs": payload_data.get("language_packs") or ["English"],
                "license_seats": int(payload_data.get("license_seats") or 5000),
                "licensing_arr": int(payload_data.get("licensing_arr") or 420000),
                "status": "implementation",
                "domain_status": "pending",
                "updated_at": SEEDED_AT,
            }
            payload["white_label_brands"].append(brand)
            event = self._event(payload, tenant_id, "brand_created", {"brand_id": brand["brand_id"]})
            self._write(payload)
            return {"brand": brand, "event": event}

    def create_oem(self, tenant_id: str, payload_data: dict[str, Any]) -> dict[str, Any]:
        with self._lock:
            payload = self._read()
            oem_index = len(payload["oem_contracts"]) + 1
            oem = {
                "oem_id": f"OEM-CUSTOM-{oem_index:03d}",
                "tenant_id": tenant_id,
                "name": payload_data.get("name") or "New Embedded Sentra OEM",
                "sector": payload_data.get("sector") or "critical infrastructure",
                "partner": payload_data.get("partner") or "Strategic OEM Partner",
                "annual_commitment": int(payload_data.get("annual_commitment") or 900000),
                "seats": int(payload_data.get("seats") or 12000),
                "api_embedded_usage": int(payload_data.get("api_embedded_usage") or 2400000),
                "revenue_model": payload_data.get("revenue_model") or "annual commit + embedded usage",
                "status": "contract_draft",
                "renewal": "2027-04-26",
                "updated_at": SEEDED_AT,
            }
            payload["oem_contracts"].append(oem)
            event = self._event(payload, tenant_id, "oem_created", {"oem_id": oem["oem_id"]})
            self._write(payload)
            return {"oem": oem, "event": event}

    def pay_commission(self, tenant_ids: list[str], commission_id: str) -> dict[str, Any] | None:
        with self._lock:
            payload = self._read()
            commission = _find(payload["commissions"], "commission_id", commission_id, tenant_ids)
            if commission is None:
                return None
            commission["status"] = "paid"
            commission["paid_at"] = SEEDED_AT
            commission["updated_at"] = SEEDED_AT
            event = self._event(payload, str(commission["tenant_id"]), "commission_paid", {"commission_id": commission_id, "amount": commission["amount"]})
            self._write(payload)
            return {"commission": dict(commission), "event": event}

    def update_pricing(self, tenant_ids: list[str], pricing_id: str, payload_data: dict[str, Any]) -> dict[str, Any] | None:
        with self._lock:
            payload = self._read()
            pricing = _find(payload["pricing_by_region"], "pricing_id", pricing_id, tenant_ids)
            if pricing is None:
                return None
            for key in ("base_platform_mrr", "per_site_mrr", "partner_margin", "pricing_fit", "status"):
                if key in payload_data and payload_data[key] is not None:
                    pricing[key] = payload_data[key]
            pricing["updated_at"] = SEEDED_AT
            event = self._event(payload, str(pricing["tenant_id"]), "pricing_updated", {"pricing_id": pricing_id})
            self._write(payload)
            return {"pricing": dict(pricing), "event": event}

    def update_pipeline(self, tenant_ids: list[str], pipeline_id: str, payload_data: dict[str, Any]) -> dict[str, Any] | None:
        with self._lock:
            payload = self._read()
            pipeline = _find(payload["regional_pipelines"], "pipeline_id", pipeline_id, tenant_ids)
            if pipeline is None:
                return None
            for key in ("stage", "probability", "weighted_arr", "next_step", "owner"):
                if key in payload_data and payload_data[key] is not None:
                    pipeline[key] = payload_data[key]
            pipeline["updated_at"] = SEEDED_AT
            event = self._event(payload, str(pipeline["tenant_id"]), "pipeline_updated", {"pipeline_id": pipeline_id})
            self._write(payload)
            return {"pipeline": dict(pipeline), "event": event}

    def _event(self, payload: dict[str, Any], tenant_id: str, action: str, detail: dict[str, Any]) -> dict[str, Any]:
        event = {
            "event_id": f"CH-EVT-{len(payload['events']) + 1:05d}",
            "tenant_id": tenant_id,
            "action": action,
            "detail": detail,
            "created_at": SEEDED_AT,
        }
        payload["events"].append(event)
        return event


def _find(rows: list[dict[str, Any]], key: str, value: str, tenant_ids: list[str]) -> dict[str, Any] | None:
    return next((row for row in rows if row.get(key) == value and row.get("tenant_id") in tenant_ids), None)


channel_store = ChannelStore(settings.sentra_channel_store_path)

