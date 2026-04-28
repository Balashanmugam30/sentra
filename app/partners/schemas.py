from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


class Partner(BaseModel):
    partner_id: str
    name: str
    country: str
    partner_type: str
    tier: Literal["silver", "gold", "platinum"]
    specialization: str
    certifications: list[str]
    revenue_generated: int = Field(ge=0)
    leads_sent: int = Field(ge=0)
    win_rate: int = Field(ge=0, le=100)
    commission_due: int = Field(ge=0)
    health_score: int = Field(ge=0, le=100)
    status: str
    created_at: datetime
    updated_at: datetime


class PartnerReferral(BaseModel):
    referral_id: str
    tenant_id: str
    partner_id: str
    company_name: str
    contact_email: str
    deal_value: int
    status: str
    created_at: datetime


class PartnersLiveResponse(BaseModel):
    partner_count: int
    platinum_partners: int
    revenue_generated: int
    commission_due: int
    referred_pipeline: int
    avg_partner_health: int
    top_partners: list[Partner]


class PartnerNetworkResponse(BaseModel):
    partners: list[Partner]


class PartnerReferralsResponse(BaseModel):
    referrals: list[PartnerReferral]


class PartnerRevenueResponse(BaseModel):
    revenue_generated: int
    commission_due: int
    partner_revenue_share: int
    top_countries: list[dict[str, Any]]
    tier_mix: dict[str, int]


class PartnerCertificationsResponse(BaseModel):
    certifications: list[dict[str, Any]]


class PartnerCreateRequest(BaseModel):
    name: str
    country: str = "Global"
    partner_type: str = "reseller"
    tier: str = "silver"
    specialization: str = "Enterprise Sentra ecosystem partner"


class PartnerActionRequest(BaseModel):
    partner_id: str
    company_name: str | None = None
    contact_email: str | None = None
    deal_value: int | None = None


class PartnerMutationResponse(BaseModel):
    ok: bool
    message: str
    data: dict[str, Any] = Field(default_factory=dict)
