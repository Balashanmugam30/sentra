from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from uuid import uuid4


PARTNER_TYPES: tuple[str, ...] = (
    "reseller",
    "implementation_partner",
    "systems_integrator",
    "technology_partner",
    "consultant",
    "government_partner",
)

PARTNER_TIERS: tuple[str, ...] = ("silver", "gold", "platinum")


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def partner_id() -> str:
    return f"PAR-{uuid4().hex[:8].upper()}"


def referral_id() -> str:
    return f"REF-{uuid4().hex[:8].upper()}"


DEMO_PARTNERS: tuple[dict[str, Any], ...] = (
    {
        "partner_id": "PAR-SHIELD-GLOBAL",
        "name": "ShieldGrid Global",
        "country": "United States",
        "partner_type": "systems_integrator",
        "tier": "platinum",
        "specialization": "SOC transformation and critical infrastructure deployments",
        "certifications": ["Sentra SOC Architect", "Zero Trust Integration", "Public Safety Command"],
        "revenue_generated": 840_000,
        "leads_sent": 34,
        "win_rate": 41,
        "commission_due": 68_400,
        "health_score": 92,
        "status": "approved",
    },
    {
        "partner_id": "PAR-BHARAT-OPS",
        "name": "Bharat Ops Consulting",
        "country": "India",
        "partner_type": "implementation_partner",
        "tier": "gold",
        "specialization": "University, hospital, and smart campus rollout programs",
        "certifications": ["Sentra Implementation Lead", "GIS Command Specialist"],
        "revenue_generated": 420_000,
        "leads_sent": 27,
        "win_rate": 37,
        "commission_due": 31_500,
        "health_score": 86,
        "status": "approved",
    },
    {
        "partner_id": "PAR-CIVIC-GOV",
        "name": "CivicSecure Alliance",
        "country": "Singapore",
        "partner_type": "government_partner",
        "tier": "platinum",
        "specialization": "Government crisis command and sovereign deployments",
        "certifications": ["Government Hardened Audit", "Partner Revenue Elite"],
        "revenue_generated": 1_240_000,
        "leads_sent": 19,
        "win_rate": 52,
        "commission_due": 124_000,
        "health_score": 95,
        "status": "approved",
    },
    {
        "partner_id": "PAR-MEDFLOW",
        "name": "MedFlow Systems",
        "country": "United Kingdom",
        "partner_type": "reseller",
        "tier": "silver",
        "specialization": "Hospital command centers and clinical safety operations",
        "certifications": ["Healthcare Response Partner"],
        "revenue_generated": 210_000,
        "leads_sent": 16,
        "win_rate": 29,
        "commission_due": 18_900,
        "health_score": 78,
        "status": "approved",
    },
)
