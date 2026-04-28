from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.audit.engine import append_audit_event
from app.category_domination.schemas import CategoryLiveResponse, CategoryMutationRequest, CategoryMutationResponse, CategoryResponse
from app.category_domination.service import category_domination_store, tenant_scope
from app.core.runtime_cache import cached_call, clear_runtime_cache
from app.rbac.guard import get_current_identity
from app.tenancy.context import get_tenant_context, identity_tenant_cache_key

router = APIRouter(prefix="/category", tags=["Category Domination"])

CATEGORY_APP_ROLES = {"super_admin", "admin", "security_manager", "executive", "operations_commander", "security_lead"}
CATEGORY_ORG_ROLES = {"owner", "org_admin", "billing_admin", "executive", "ops_admin", "security_admin"}


def _require_access(identity: dict[str, object], tenant: dict[str, object]) -> None:
    if str(identity.get("role")) in CATEGORY_APP_ROLES or str(tenant.get("org_role") or "") in CATEGORY_ORG_ROLES:
        return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Category Domination access required")


def _scope(identity: dict[str, object], tenant: dict[str, object]) -> list[str]:
    return tenant_scope(identity, tenant)


def _tenant_id(tenant: dict[str, object]) -> str:
    return str(tenant["tenant_id"])


def _clear(identity: dict[str, object]) -> None:
    clear_runtime_cache(identity_tenant_cache_key(identity, "category:"))


def _log(request: Request, identity: dict[str, object], tenant: dict[str, object], action: str, reason: str, target_id: str | None = None) -> None:
    append_audit_event(
        category="category_domination",
        action=action,
        severity="medium",
        target_module="category_domination",
        target_id=target_id,
        status="success",
        reason=reason,
        request=request,
        identity=identity,
        tenant_id=_tenant_id(tenant),
        risk_score=32,
    )


def _response(name: str, ttl: int, builder, tenant: dict[str, object], identity: dict[str, object]) -> CategoryResponse:
    _require_access(identity, tenant)
    data = cached_call(identity_tenant_cache_key(identity, f"category:{name}"), ttl, lambda: builder(_scope(identity, tenant)))
    return CategoryResponse(generated_at=category_domination_store.live(_scope(identity, tenant))["generated_at"], data=data)


@router.get("/live", response_model=CategoryLiveResponse)
def get_category_live(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> CategoryLiveResponse:
    _require_access(identity, tenant)
    return CategoryLiveResponse(**cached_call(identity_tenant_cache_key(identity, "category:live"), 10, lambda: category_domination_store.live(_scope(identity, tenant))))


@router.get("/market-share", response_model=CategoryResponse)
def get_market_share(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> CategoryResponse:
    return _response("market-share", 20, category_domination_store.market_share, tenant, identity)


@router.get("/competitors", response_model=CategoryResponse)
def get_competitors(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> CategoryResponse:
    return _response("competitors", 20, category_domination_store.competitors, tenant, identity)


@router.get("/leaderboard", response_model=CategoryResponse)
def get_leaderboard(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> CategoryResponse:
    return _response("leaderboard", 20, category_domination_store.leaderboard, tenant, identity)


@router.get("/trust", response_model=CategoryResponse)
def get_trust(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> CategoryResponse:
    return _response("trust", 20, category_domination_store.trust, tenant, identity)


@router.get("/benchmark", response_model=CategoryResponse)
def get_benchmark(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> CategoryResponse:
    return _response("benchmark", 20, category_domination_store.benchmark, tenant, identity)


@router.get("/narrative", response_model=CategoryResponse)
def get_narrative(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> CategoryResponse:
    return _response("narrative", 20, category_domination_store.narrative, tenant, identity)


@router.get("/score", response_model=CategoryResponse)
def get_score(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> CategoryResponse:
    return _response("score", 20, category_domination_store.score, tenant, identity)


@router.post("/run-pr-campaign", response_model=CategoryMutationResponse)
def post_pr_campaign(payload: CategoryMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> CategoryMutationResponse:
    _require_access(identity, tenant)
    result = category_domination_store.run_pr_campaign(_tenant_id(tenant))
    _clear(identity)
    _log(request, identity, tenant, "pr_campaign_launched", "Category PR campaign launched", str(result["action_id"]))
    return CategoryMutationResponse(ok=True, message="PR campaign launched", data=result)


@router.post("/run-competitive-analysis", response_model=CategoryMutationResponse)
def post_competitive_analysis(payload: CategoryMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> CategoryMutationResponse:
    _require_access(identity, tenant)
    result = category_domination_store.run_competitive_analysis(_tenant_id(tenant))
    _clear(identity)
    _log(request, identity, tenant, "competitive_analysis_run", "Competitive analysis executed", str(result["analysis_id"]))
    return CategoryMutationResponse(ok=True, message="Competitive analysis complete", data=result)


@router.post("/generate-board-story", response_model=CategoryMutationResponse)
def post_board_story(payload: CategoryMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> CategoryMutationResponse:
    _require_access(identity, tenant)
    result = category_domination_store.generate_board_story(_tenant_id(tenant))
    _clear(identity)
    _log(request, identity, tenant, "board_narrative_generated", "Board narrative generated", str(result["story_id"]))
    return CategoryMutationResponse(ok=True, message="Board story generated", data=result)


@router.post("/run-market-simulation", response_model=CategoryMutationResponse)
def post_market_simulation(payload: CategoryMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> CategoryMutationResponse:
    _require_access(identity, tenant)
    result = category_domination_store.run_market_simulation(_tenant_id(tenant), payload.scenario)
    _clear(identity)
    _log(request, identity, tenant, "market_simulation_executed", "Market simulation executed", str(result["simulation_id"]))
    return CategoryMutationResponse(ok=True, message="Market simulation complete", data=result)
