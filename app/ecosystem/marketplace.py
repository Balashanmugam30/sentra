from __future__ import annotations

from app.ecosystem.models import ECOSYSTEM_APPS, ecosystem_id


def seed_marketplace_apps(tenant_id: str) -> list[dict[str, object]]:
    apps = []
    for slug, name, category, rating, arr in ECOSYSTEM_APPS:
        apps.append(
            {
                "app_id": slug,
                "tenant_id": tenant_id,
                "name": name,
                "category": category,
                "status": "connected" if slug in {"slack", "google-maps", "twilio", "servicenow"} else "available",
                "rating": rating,
                "installs": 184 if slug == "slack" else 60 + len(name) * 4,
                "marketplace_arr": arr,
                "retention_lift": 11 if category in {"Communication", "ITSM"} else 8,
                "security_verified": True,
                "featured": category in {"Communication", "Maps", "Developer"},
            }
        )
    return apps


def install_app_row(tenant_id: str, app_id: str, installed_by: str) -> dict[str, object]:
    app = next((item for item in seed_marketplace_apps(tenant_id) if item["app_id"] == app_id), None)
    if app is None:
        app = {
            "app_id": app_id,
            "tenant_id": tenant_id,
            "name": "Custom Webhook Apps",
            "category": "Developer",
            "rating": 4.7,
            "installs": 1,
            "marketplace_arr": 31_000,
            "retention_lift": 7,
            "security_verified": True,
            "featured": False,
        }
    return {
        **app,
        "install_id": ecosystem_id("EAPP"),
        "status": "connected",
        "sync_health": 98,
        "installed_by": installed_by,
    }
