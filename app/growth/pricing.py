from __future__ import annotations

from typing import Any


USD_RATES: dict[str, float] = {
    "USD": 1.0,
    "INR": 83.0,
    "AED": 3.67,
    "SAR": 3.75,
    "SGD": 1.35,
    "EUR": 0.92,
    "GBP": 0.79,
    "CAD": 1.36,
    "JPY": 155.0,
    "AUD": 1.52,
}

BASE_USD_MONTHLY: dict[str, int] = {
    "Starter": 799,
    "Business": 2499,
    "Enterprise": 11900,
    "Government": 18900,
}

TAX_BY_COUNTRY: dict[str, int] = {
    "India": 18,
    "UAE": 5,
    "Saudi": 15,
    "Singapore": 9,
    "Germany": 19,
    "UK": 20,
    "USA": 8,
    "Canada": 13,
    "Japan": 10,
    "Australia": 10,
}


def pricing_for_country(tenant_id: str, country: dict[str, Any]) -> list[dict[str, Any]]:
    currency = str(country["currency"])
    rate = USD_RATES.get(currency, 1.0)
    readiness = int(country["deployment_readiness"])
    premium = 1 + max(0, int(country["market_score"]) - 80) / 100
    discount = 12 if int(country["channel_strength"]) >= 80 else 8 if readiness >= 80 else 5
    plans = []
    for plan, usd_monthly in BASE_USD_MONTHLY.items():
        usd_equivalent = round(usd_monthly * premium)
        local_monthly = round(usd_equivalent * rate)
        plans.append(
            {
                "pricing_id": f"PRI-{tenant_id}-{country['country_id']}-{plan.upper()}",
                "tenant_id": tenant_id,
                "country": country["name"],
                "plan": plan,
                "currency": currency,
                "local_monthly": local_monthly,
                "local_annual": local_monthly * 10,
                "usd_equivalent_monthly": usd_equivalent,
                "tax_percent": TAX_BY_COUNTRY.get(str(country["name"]), 12),
                "discount_band_percent": discount,
                "partner_commission_percent": 18 if plan in ("Enterprise", "Government") else 12,
                "premium_uplift_percent": round((premium - 1) * 100),
            }
        )
    return plans

