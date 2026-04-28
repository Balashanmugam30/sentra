from __future__ import annotations

from app.developers.store import developers_store


class DevelopersService:
    def summary(self, tenant_ids: list[str]) -> dict[str, object]:
        return developers_store.summary(tenant_ids)

    def create_key(self, tenant_ids: list[str], payload: dict[str, object]) -> dict[str, object]:
        return developers_store.create_key(tenant_ids, payload)


developers_service = DevelopersService()

