from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4


DEMO_TENANTS = ["TEN-BALA-UNI", "TEN-BALA-MFG", "TEN-BALA-HOSP"]

ECOSYSTEM_APPS = [
    ("slack", "Slack", "Communication", 4.8, 42_000),
    ("microsoft-teams", "Microsoft Teams", "Communication", 4.7, 48_000),
    ("whatsapp", "WhatsApp Business", "Communication", 4.6, 36_000),
    ("twilio", "Twilio", "Communication", 4.7, 58_000),
    ("google-maps", "Google Maps", "Maps", 4.9, 72_000),
    ("stripe", "Stripe", "Billing", 4.9, 66_000),
    ("salesforce", "Salesforce", "Business Systems", 4.8, 124_000),
    ("hubspot", "HubSpot", "Business Systems", 4.7, 84_000),
    ("servicenow", "ServiceNow", "ITSM", 4.8, 136_000),
    ("aws", "AWS", "Cloud", 4.9, 156_000),
    ("azure", "Microsoft Azure", "Cloud", 4.9, 148_000),
    ("google-cloud", "Google Cloud", "Cloud", 4.8, 132_000),
    ("sap", "SAP", "Enterprise Resource Planning", 4.6, 118_000),
    ("oracle", "Oracle", "Enterprise Resource Planning", 4.5, 104_000),
    ("custom-webhook", "Custom Webhook Apps", "Developer", 4.7, 31_000),
]

PARTNER_TYPES = [
    ("reseller", "Reseller", 14, 2_180_000),
    ("integrator", "Integrator", 12, 2_760_000),
    ("consulting", "Consulting", 9, 940_000),
    ("oem", "OEM", 6, 1_420_000),
    ("government_si", "Government SI", 8, 1_820_000),
    ("regional_channel", "Regional channel", 10, 1_110_000),
    ("affiliate", "Affiliate", 4, 320_000),
]

CERTIFICATION_TRACKS = [
    ("admin", "Certified Admins", 220, 88_000),
    ("consultant", "Certified Consultants", 126, 112_000),
    ("engineer", "Certified Engineers", 118, 142_000),
    ("agency", "Certified Agencies", 76, 68_000),
]


def ecosystem_id(prefix: str) -> str:
    return f"{prefix}-{uuid4().hex[:10].upper()}"


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()
