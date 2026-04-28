from __future__ import annotations

from app.platform.service import platform_service


class DevelopersStore:
    def summary(self, tenant_ids: list[str]) -> dict[str, object]:
        summary = platform_service.summary(tenant_ids)
        usage = platform_service.usage(tenant_ids)
        rate_limits = platform_service.rate_limits(tenant_ids)
        sdks = platform_service.sdks(tenant_ids)
        docs = platform_service.docs(tenant_ids)
        return {
            **summary,
            "api_docs": docs,
            "tenant_scoped_keys": platform_service.api_keys(tenant_ids),
            "rate_limits": rate_limits,
            "usage": usage,
            "webhook_subscriptions": platform_service.webhooks(tenant_ids),
            "sdk_examples": sdks,
            "sandbox": platform_service.sandbox(tenant_ids),
            "public_api_readiness": 94,
        }

    def create_key(self, tenant_ids: list[str], payload: dict[str, object]) -> dict[str, object]:
        return platform_service.create_api_key(tenant_ids, payload)


developers_store = DevelopersStore()
