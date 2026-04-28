from __future__ import annotations

from fastapi import APIRouter, Depends, Request, HTTPException, status

from app.audit.engine import append_audit_event
from app.core.runtime_cache import cached_call, clear_runtime_cache
from app.investor.schemas import (
    BoardResponse,
    BoardPackResponse,
    CapTableResponse,
    CopilotResponse,
    DataRoomResponse,
    FundsResponse,
    InvestorLiveResponse,
    InvestorMutationRequest,
    InvestorMutationResponse,
    InvestorSummaryResponse,
    InvestorsResponse,
    IpoResponse,
    MetricsResponse,
    MnaResponse,
    ReadinessResponse,
    RunwayResponse,
    ValuationResponse,
)
from app.investor.service import investor_store, tenant_scope
from app.rbac.guard import get_current_identity
from app.tenancy.context import get_tenant_context, identity_tenant_cache_key

router = APIRouter(prefix="/investor", tags=["Investor OS"])

INVESTOR_APP_ROLES = {"super_admin", "admin", "security_manager", "executive", "operations_commander"}
INVESTOR_ORG_ROLES = {"owner", "org_admin", "billing_admin", "executive"}


def _require_access(identity: dict[str, object], tenant: dict[str, object]) -> None:
    if str(identity.get("role")) in INVESTOR_APP_ROLES or str(tenant.get("org_role") or "") in INVESTOR_ORG_ROLES:
        return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Investor operating system access required")


def _scope(identity: dict[str, object], tenant: dict[str, object]) -> list[str]:
    return tenant_scope(identity, tenant)


def _clear(identity: dict[str, object]) -> None:
    clear_runtime_cache(identity_tenant_cache_key(identity, "investor:"))


def _log(request: Request, identity: dict[str, object], tenant: dict[str, object], action: str, reason: str, target_id: str | None = None) -> None:
    append_audit_event(
        category="investor",
        action=action,
        severity="medium",
        target_module="investor",
        target_id=target_id,
        status="success",
        reason=reason,
        request=request,
        identity=identity,
        tenant_id=str(tenant["tenant_id"]),
        risk_score=32,
    )


@router.get("/live", response_model=InvestorLiveResponse)
def get_investor_live(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> InvestorLiveResponse:
    _require_access(identity, tenant)
    return InvestorLiveResponse(**cached_call(identity_tenant_cache_key(identity, "investor:live"), 10, lambda: investor_store.live(_scope(identity, tenant))))


@router.get("/summary", response_model=InvestorSummaryResponse)
def get_investor_summary(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> InvestorSummaryResponse:
    _require_access(identity, tenant)
    return InvestorSummaryResponse(summary=cached_call(identity_tenant_cache_key(identity, "investor:summary"), 10, lambda: investor_store.summary(_scope(identity, tenant))))


@router.get("/metrics", response_model=MetricsResponse)
def get_investor_metrics(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MetricsResponse:
    _require_access(identity, tenant)
    return MetricsResponse(metrics=cached_call(identity_tenant_cache_key(identity, "investor:metrics"), 12, lambda: investor_store.metrics(_scope(identity, tenant))))


@router.get("/valuation", response_model=ValuationResponse)
def get_investor_valuation(request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> ValuationResponse:
    _require_access(identity, tenant)
    valuation = cached_call(identity_tenant_cache_key(identity, "investor:valuation"), 12, lambda: investor_store.valuation(_scope(identity, tenant)))
    _log(request, identity, tenant, "valuation_recalculated", "Investor valuation model opened")
    return ValuationResponse(valuation=valuation)


@router.get("/runway", response_model=RunwayResponse)
def get_investor_runway(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> RunwayResponse:
    _require_access(identity, tenant)
    return RunwayResponse(runway=investor_store.runway(_scope(identity, tenant)))


@router.get("/captable", response_model=CapTableResponse)
def get_investor_captable(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> CapTableResponse:
    _require_access(identity, tenant)
    return CapTableResponse(captable=investor_store.captable())


@router.get("/readiness", response_model=ReadinessResponse)
def get_investor_readiness(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> ReadinessResponse:
    _require_access(identity, tenant)
    return ReadinessResponse(readiness=investor_store.readiness(_scope(identity, tenant)))


@router.get("/board", response_model=BoardResponse)
def get_investor_board(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> BoardResponse:
    _require_access(identity, tenant)
    return BoardResponse(board=investor_store.board(_scope(identity, tenant)))


@router.get("/boardpack", response_model=BoardPackResponse)
def get_investor_boardpack(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> BoardPackResponse:
    _require_access(identity, tenant)
    return BoardPackResponse(boardpack=cached_call(identity_tenant_cache_key(identity, "investor:boardpack"), 14, lambda: investor_store.boardpack(_scope(identity, tenant))))


@router.get("/dataroom", response_model=DataRoomResponse)
def get_investor_dataroom(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> DataRoomResponse:
    _require_access(identity, tenant)
    return DataRoomResponse(dataroom=investor_store.dataroom())


@router.get("/mna", response_model=MnaResponse)
def get_investor_mna(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MnaResponse:
    _require_access(identity, tenant)
    return MnaResponse(mna=investor_store.mna(_scope(identity, tenant)))


@router.get("/ma", response_model=MnaResponse)
def get_investor_ma(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MnaResponse:
    _require_access(identity, tenant)
    return MnaResponse(mna=investor_store.mna(_scope(identity, tenant)))


@router.get("/ipo", response_model=IpoResponse)
def get_investor_ipo(request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> IpoResponse:
    _require_access(identity, tenant)
    _log(request, identity, tenant, "ipo_model_opened", "IPO readiness model opened")
    return IpoResponse(ipo=investor_store.ipo(_scope(identity, tenant)))


@router.get("/investors", response_model=InvestorsResponse)
def get_investor_investors(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> InvestorsResponse:
    _require_access(identity, tenant)
    return InvestorsResponse(investors=investor_store.investors(_scope(identity, tenant)))


@router.get("/funds", response_model=FundsResponse)
def get_investor_funds(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> FundsResponse:
    _require_access(identity, tenant)
    return FundsResponse(funds=investor_store.investors(_scope(identity, tenant)))


@router.post("/fund/update", response_model=InvestorMutationResponse)
def post_investor_fund_update(payload: InvestorMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> InvestorMutationResponse:
    _require_access(identity, tenant)
    investor = investor_store.update_fund(_scope(identity, tenant), payload.model_dump(exclude_none=True))
    if investor is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Investor fund not found")
    _clear(identity)
    _log(request, identity, tenant, "investor_updated", f"Investor updated: {investor['fund_name']}", investor["investor_id"])
    return InvestorMutationResponse(ok=True, message="Investor fund updated", data={"investor": investor})


@router.get("/copilot", response_model=CopilotResponse)
def get_investor_copilot(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> CopilotResponse:
    _require_access(identity, tenant)
    return CopilotResponse(copilot=investor_store.copilot(_scope(identity, tenant)))


@router.post("/add-cash", response_model=InvestorMutationResponse)
def post_investor_add_cash(payload: InvestorMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> InvestorMutationResponse:
    _require_access(identity, tenant)
    runway = investor_store.add_cash(_scope(identity, tenant), payload.amount or 2_000_000)
    _clear(identity)
    _log(request, identity, tenant, "raise_planned", f"Cash added to runway model: {payload.amount or 2_000_000}")
    return InvestorMutationResponse(ok=True, message="Cash added to runway model", data={"runway": runway})


@router.post("/run-scenario", response_model=InvestorMutationResponse)
def post_investor_run_scenario(payload: InvestorMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> InvestorMutationResponse:
    _require_access(identity, tenant)
    result = investor_store.run_scenario(_scope(identity, tenant), payload.scenario)
    _clear(identity)
    _log(request, identity, tenant, "scenario_simulated", f"Investor scenario simulated: {result['scenario']}")
    return InvestorMutationResponse(ok=True, message="Investor scenario simulated", data=result)


@router.post("/add-investor", response_model=InvestorMutationResponse)
def post_investor_add_investor(payload: InvestorMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> InvestorMutationResponse:
    _require_access(identity, tenant)
    investor = investor_store.add_investor(str(tenant["tenant_id"]), payload.model_dump())
    _clear(identity)
    _log(request, identity, tenant, "investor_added", f"Investor added: {investor['fund_name']}", investor["investor_id"])
    return InvestorMutationResponse(ok=True, message="Investor added", data={"investor": investor})


@router.post("/update-cap-table", response_model=InvestorMutationResponse)
def post_investor_update_cap_table(request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> InvestorMutationResponse:
    _require_access(identity, tenant)
    captable = investor_store.update_cap_table(_scope(identity, tenant))
    _clear(identity)
    _log(request, identity, tenant, "cap_table_updated", "Cap table model updated")
    return InvestorMutationResponse(ok=True, message="Cap table updated", data={"captable": captable})


@router.post("/generate-board-pack", response_model=InvestorMutationResponse)
def post_investor_generate_board_pack(request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> InvestorMutationResponse:
    _require_access(identity, tenant)
    board_pack = investor_store.generate_board_pack(_scope(identity, tenant))
    _clear(identity)
    _log(request, identity, tenant, "board_pack_generated", "Board pack generated", board_pack["board_pack_id"])
    return InvestorMutationResponse(ok=True, message="Board pack generated", data={"board_pack": board_pack})


@router.post("/seed-demo", response_model=InvestorMutationResponse)
def post_investor_seed_demo(request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> InvestorMutationResponse:
    _require_access(identity, tenant)
    result = investor_store.seed_demo()
    _clear(identity)
    _log(request, identity, tenant, "seed_demo", "Investor demo data seeded")
    return InvestorMutationResponse(ok=True, message="Investor demo data seeded", data=result)
