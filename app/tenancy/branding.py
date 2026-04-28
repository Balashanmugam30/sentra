from __future__ import annotations

from typing import Any


def build_branding_payload(organization: dict[str, Any]) -> dict[str, Any]:
    return {
        "tenant_id": organization["id"],
        "organization_name": organization["name"],
        "logo_url": organization.get("logo_url") or "",
        "primary_color": organization.get("primary_color") or "#67e8f9",
        "pdf_report_header": f"{organization['name']} Command Intelligence Report",
        "email_template_signature": f"Sentra Command Center for {organization['name']}",
    }

