from __future__ import annotations

from fastapi import APIRouter, Depends

from app.analyticshub.schemas import AnalyticsHubResponse
from app.analyticshub.service import analyticshub_service
from app.core.runtime_cache import cached_call
from app.rbac.guard import get_current_identity
from app.tenancy.context import identity_tenant_cache_key

router = APIRouter(prefix="/analytics", tags=["Analytics Supremacy"])


@router.get("/summary", response_model=AnalyticsHubResponse)
def get_analytics_summary(identity: dict[str, object] = Depends(get_current_identity)) -> AnalyticsHubResponse:
    return AnalyticsHubResponse(data=cached_call(identity_tenant_cache_key(identity, "analyticshub:summary"), 12, analyticshub_service.summary))

