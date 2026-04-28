from __future__ import annotations

from typing import Any

from pydantic import BaseModel


class MonopolyLiveResponse(BaseModel):
    generated_at: str
    countries_active: int
    regions_controlled: int
    enterprise_customers: int
    government_contracts: int
    partner_revenue: int
    reseller_coverage: int
    rfp_preferred_vendor_rate: int
    installed_integrations: int
    avg_switching_cost_index: str
    partner_led_wins: int
    referral_loop: float
    developer_growth: int
    data_gravity_score: int
    monopoly_score: int
    label: str
    dominance_thesis: str


class MonopolyResponse(BaseModel):
    generated_at: str
    data: dict[str, Any]


class MonopolyMutationRequest(BaseModel):
    target: str | None = None
    bundle: str | None = None
    scenario: str | None = None


class MonopolyMutationResponse(BaseModel):
    ok: bool
    message: str
    data: dict[str, Any]

