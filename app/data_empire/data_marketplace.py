from __future__ import annotations

from app.data_empire.models import DATA_PRODUCTS, data_empire_id, utc_now_iso


def data_products(tenant_id: str) -> list[dict[str, object]]:
    return [
        {
            "product_id": product_id,
            "tenant_id": tenant_id,
            "name": name,
            "annual_revenue": annual_revenue,
            "buyer_segment": "government" if "Government" in name else "enterprise",
            "status": "live" if index < 4 else "packaging",
            "gross_margin": 86 + index % 6,
        }
        for index, (product_id, name, annual_revenue) in enumerate(DATA_PRODUCTS)
    ]


def launch_data_product(tenant_id: str, product_id: str | None = None) -> dict[str, object]:
    product = next((item for item in data_products(tenant_id) if item["product_id"] == product_id), None)
    if product is None:
        product = {
            "product_id": data_empire_id("DPROD"),
            "tenant_id": tenant_id,
            "name": "Executive Data Intelligence Feed",
            "annual_revenue": 480_000,
            "buyer_segment": "enterprise",
            "status": "live",
            "gross_margin": 91,
        }
    product["launched_at"] = utc_now_iso()
    product["status"] = "live"
    return product
