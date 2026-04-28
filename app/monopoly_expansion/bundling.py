from __future__ import annotations


def product_bundles() -> dict[str, object]:
    bundles = [
        {"name": "Command Core + AI", "attach_rate": 72, "margin": 84, "rival_pressure": 81, "annual_value": 1_800_000},
        {"name": "Platform + Government Suite", "attach_rate": 64, "margin": 87, "rival_pressure": 88, "annual_value": 2_400_000},
        {"name": "Platform + Data Empire", "attach_rate": 69, "margin": 91, "rival_pressure": 92, "annual_value": 3_100_000},
        {"name": "Full Enterprise Suite", "attach_rate": 58, "margin": 89, "rival_pressure": 96, "annual_value": 4_600_000},
    ]
    return {
        "bundles": bundles,
        "recommended_bundle": "Full Enterprise Suite",
        "bundle_strategy": "increase buyer value through integration depth, data gravity, executive proof, and lower operational fragmentation",
        "pricing_pressure_index": 86,
    }


def launch_bundle(bundle_name: str | None = None) -> dict[str, object]:
    return {
        "bundle": bundle_name or "Full Enterprise Suite",
        "status": "launched",
        "estimated_arr_lift": 2_700_000,
        "gross_margin": 89,
        "customer_value_message": "replace fragmented tools with one command intelligence operating system",
    }

