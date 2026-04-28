from __future__ import annotations

from app.monopoly_expansion.models import ACQUISITION_TARGETS


def acquisition_targets() -> list[dict[str, object]]:
    return sorted(
        [
            {
                **target,
                "fit_value_score": round(
                    (float(target["strategic_fit"]) * 0.36)
                    + (float(target["engineering_talent"]) * 0.24)
                    + (float(target["integration_ease"]) * 0.22)
                    + ((100 - float(target["customer_overlap"])) * 0.18),
                    1,
                ),
                "recommended_move": "model diligence and founder-friendly acquisition path",
            }
            for target in ACQUISITION_TARGETS
        ],
        key=lambda item: float(item["fit_value_score"]),
        reverse=True,
    )


def acquisition_model(target_name: str | None = None) -> dict[str, object]:
    target = next((item for item in acquisition_targets() if item["name"] == target_name), acquisition_targets()[0])
    purchase_price = int(float(target["arr"]) * float(target["price_multiple"]))
    return {
        "target": target["name"],
        "purchase_price": purchase_price,
        "integration_months": 7,
        "customer_cross_sell": 1_900_000,
        "talent_retention_plan": "retain founding engineers with autonomy pod incentives",
        "strategic_rationale": "accelerates geography, data gravity, and enterprise workflow dependency without weakening trust posture",
        "board_recommendation": "advance to diligence if purchase price remains under 6.2x ARR",
    }

