from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from uuid import uuid4


MARKETPLACE_CATEGORIES: tuple[dict[str, str], ...] = (
    {"key": "communication", "label": "Communication"},
    {"key": "maps_location", "label": "Maps / Location"},
    {"key": "cloud_infra", "label": "Cloud / Infra"},
    {"key": "security", "label": "Security"},
    {"key": "itsm_ticketing", "label": "ITSM / Ticketing"},
    {"key": "business_systems", "label": "Business Systems"},
    {"key": "field_facility_iot", "label": "Field / Facility / IoT"},
)

INSTALL_STATUSES: tuple[str, ...] = (
    "not_installed",
    "installing",
    "connected",
    "needs_config",
    "error",
    "disabled",
    "update_available",
)


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def installation_id() -> str:
    return f"INT-{uuid4().hex[:10].upper()}"


def event_id(prefix: str = "MKT-EVT") -> str:
    return f"{prefix}-{uuid4().hex[:8].upper()}"


def app(
    *,
    app_id: str,
    name: str,
    slug: str,
    vendor: str,
    category: str,
    description: str,
    logo_key: str,
    pricing_model: str,
    rating: float,
    review_count: int,
    security_verified: bool,
    enterprise_ready: bool,
    region_support: list[str],
    install_complexity: str,
    tags: list[str],
    version: str,
    monthly_price: int,
    trial_available: bool,
    featured: bool,
    status: str = "active",
) -> dict[str, Any]:
    return {
        "app_id": app_id,
        "name": name,
        "slug": slug,
        "vendor": vendor,
        "category": category,
        "description": description,
        "logo_key": logo_key,
        "pricing_model": pricing_model,
        "rating": rating,
        "review_count": review_count,
        "security_verified": security_verified,
        "enterprise_ready": enterprise_ready,
        "region_support": region_support,
        "install_complexity": install_complexity,
        "tags": tags,
        "version": version,
        "monthly_price": monthly_price,
        "trial_available": trial_available,
        "featured": featured,
        "status": status,
    }
