from __future__ import annotations

from app.revenue_growth.models import revenue_growth_id


def seed_referral_programs(tenant_id: str) -> list[dict[str, object]]:
    return [
        {
            "program_id": revenue_growth_id("REF"),
            "tenant_id": tenant_id,
            "name": "Crisis Leader Referral",
            "tier": "invite_friend",
            "referrals_sent": 820,
            "referrals_accepted": 214,
            "revenue_generated": 42_000,
            "top_ambassador": "Bala University Safety Office",
            "reward": "1 free executive report pack",
        },
        {
            "program_id": revenue_growth_id("REF"),
            "tenant_id": tenant_id,
            "name": "Enterprise Partner Loop",
            "tier": "partner_referral",
            "referrals_sent": 360,
            "referrals_accepted": 92,
            "revenue_generated": 96_000,
            "top_ambassador": "CivicSecure Alliance",
            "reward": "12% first-year commission",
        },
        {
            "program_id": revenue_growth_id("REF"),
            "tenant_id": tenant_id,
            "name": "Government Continuity Network",
            "tier": "enterprise_referral",
            "referrals_sent": 94,
            "referrals_accepted": 27,
            "revenue_generated": 184_000,
            "top_ambassador": "GovSecure South",
            "reward": "priority sovereign onboarding",
        },
    ]


def launch_referral_campaign(programs: list[dict[str, object]], campaign: str) -> list[dict[str, object]]:
    uplifted: list[dict[str, object]] = []
    for program in programs:
        row = dict(program)
        if campaign.lower() in str(row["name"]).lower() or campaign == "executive_referral_sprint":
            row["referrals_sent"] = int(row["referrals_sent"]) + 120
            row["referrals_accepted"] = int(row["referrals_accepted"]) + 31
            row["revenue_generated"] = int(row["revenue_generated"]) + 28_000
        uplifted.append(row)
    return uplifted
