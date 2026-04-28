from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.audit.engine import append_audit_event
from app.core.runtime_cache import cached_call, clear_runtime_cache
from app.crm.schemas import (
    ActivitiesResponse,
    ActivityLogRequest,
    CrmMutationResponse,
    DealCreateRequest,
    DealPatchRequest,
    DealsResponse,
    DemoBookRequest,
    DemosResponse,
    ForecastResponse,
    GrowthMetricsResponse,
    LeadCreateRequest,
    LeadImportRequest,
    LeadPatchRequest,
    LeadScoringResponse,
    LeadsResponse,
    MoveStageRequest,
)
from app.crm.service import crm_store, tenant_scope
from app.rbac.guard import get_current_identity
from app.tenancy.context import get_tenant_context, identity_tenant_cache_key

router = APIRouter(prefix="/crm", tags=["CRM"])

CRM_APP_ROLES = {"super_admin", "admin", "security_manager", "executive", "operations_commander"}
CRM_ORG_ROLES = {"owner", "org_admin", "billing_admin", "executive", "operator"}


def _require_crm_access(identity: dict[str, object], tenant: dict[str, object]) -> None:
    org_role = str(tenant.get("org_role") or "")
    if str(identity.get("role")) in CRM_APP_ROLES or org_role in CRM_ORG_ROLES:
        return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="CRM access required")


def _tenant_id(tenant: dict[str, object]) -> str:
    return str(tenant["tenant_id"])


def _scope(identity: dict[str, object], tenant: dict[str, object]) -> list[str]:
    return tenant_scope(identity, tenant)


def _clear_crm_cache(identity: dict[str, object]) -> None:
    clear_runtime_cache(identity_tenant_cache_key(identity, "crm:"))


def _log_crm_action(
    *,
    request: Request,
    identity: dict[str, object],
    tenant: dict[str, object],
    action: str,
    reason: str,
    target_id: str | None = None,
    before_state: dict[str, object] | None = None,
    after_state: dict[str, object] | None = None,
    risk_score: int = 30,
) -> None:
    append_audit_event(
        category="crm",
        action=action,
        severity="medium",
        target_module="crm",
        target_id=target_id,
        status="success",
        reason=reason,
        request=request,
        identity=identity,
        tenant_id=_tenant_id(tenant),
        before_state=before_state,
        after_state=after_state,
        risk_score=risk_score,
    )


@router.get("/leads", response_model=LeadsResponse)
def get_crm_leads(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> LeadsResponse:
    _require_crm_access(identity, tenant)
    leads = cached_call(
        identity_tenant_cache_key(identity, "crm:leads"),
        8,
        lambda: crm_store.list_leads(_scope(identity, tenant)),
    )
    return LeadsResponse(leads=leads)


@router.post("/leads/create", response_model=CrmMutationResponse)
def post_crm_lead_create(
    payload: LeadCreateRequest,
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> CrmMutationResponse:
    _require_crm_access(identity, tenant)
    lead = crm_store.create_lead(_tenant_id(tenant), payload.model_dump())
    _clear_crm_cache(identity)
    _log_crm_action(
        request=request,
        identity=identity,
        tenant=tenant,
        action="lead_created",
        reason=f"Lead created for {lead['company_name']}",
        target_id=str(lead["id"]),
        after_state=lead,
    )
    return CrmMutationResponse(ok=True, message="Lead created", data={"lead": lead})


@router.post("/leads/import", response_model=CrmMutationResponse)
def post_crm_leads_import(
    payload: LeadImportRequest,
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> CrmMutationResponse:
    _require_crm_access(identity, tenant)
    leads = crm_store.import_leads(_tenant_id(tenant), [lead.model_dump() for lead in payload.leads])
    _clear_crm_cache(identity)
    _log_crm_action(
        request=request,
        identity=identity,
        tenant=tenant,
        action="lead_imported",
        reason=f"Imported {len(leads)} CRM leads",
        risk_score=34,
    )
    return CrmMutationResponse(ok=True, message="Leads imported", data={"leads": leads})


@router.patch("/leads/{lead_id}", response_model=CrmMutationResponse)
def patch_crm_lead(
    lead_id: str,
    payload: LeadPatchRequest,
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> CrmMutationResponse:
    _require_crm_access(identity, tenant)
    before = next((lead for lead in crm_store.list_leads(_scope(identity, tenant)) if lead["id"] == lead_id), None)
    lead = crm_store.patch_lead(_scope(identity, tenant), lead_id, payload.model_dump(exclude_unset=True))
    if lead is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")
    _clear_crm_cache(identity)
    _log_crm_action(
        request=request,
        identity=identity,
        tenant=tenant,
        action="lead_changed",
        reason=f"Lead updated for {lead['company_name']}",
        target_id=lead_id,
        before_state=before,
        after_state=lead,
    )
    return CrmMutationResponse(ok=True, message="Lead updated", data={"lead": lead})


@router.delete("/leads/{lead_id}", response_model=CrmMutationResponse)
def delete_crm_lead(
    lead_id: str,
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> CrmMutationResponse:
    _require_crm_access(identity, tenant)
    deleted = crm_store.delete_lead(_scope(identity, tenant), lead_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")
    _clear_crm_cache(identity)
    _log_crm_action(
        request=request,
        identity=identity,
        tenant=tenant,
        action="lead_deleted",
        reason="CRM lead deleted",
        target_id=lead_id,
        risk_score=42,
    )
    return CrmMutationResponse(ok=True, message="Lead deleted", data={"lead_id": lead_id})


@router.get("/deals", response_model=DealsResponse)
def get_crm_deals(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> DealsResponse:
    _require_crm_access(identity, tenant)
    deals = cached_call(
        identity_tenant_cache_key(identity, "crm:deals"),
        8,
        lambda: crm_store.list_deals(_scope(identity, tenant)),
    )
    return DealsResponse(deals=deals)


@router.post("/deals/create", response_model=CrmMutationResponse)
def post_crm_deal_create(
    payload: DealCreateRequest,
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> CrmMutationResponse:
    _require_crm_access(identity, tenant)
    deal = crm_store.create_deal(_tenant_id(tenant), payload.model_dump(mode="json"))
    _clear_crm_cache(identity)
    _log_crm_action(
        request=request,
        identity=identity,
        tenant=tenant,
        action="deal_created",
        reason=f"Deal created for {deal['company_name']}",
        target_id=str(deal["id"]),
        after_state=deal,
    )
    return CrmMutationResponse(ok=True, message="Deal created", data={"deal": deal})


@router.patch("/deals/{deal_id}", response_model=CrmMutationResponse)
def patch_crm_deal(
    deal_id: str,
    payload: DealPatchRequest,
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> CrmMutationResponse:
    _require_crm_access(identity, tenant)
    before = next((deal for deal in crm_store.list_deals(_scope(identity, tenant)) if deal["id"] == deal_id), None)
    deal = crm_store.patch_deal(_scope(identity, tenant), deal_id, payload.model_dump(mode="json", exclude_unset=True))
    if deal is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deal not found")
    _clear_crm_cache(identity)
    _log_crm_action(
        request=request,
        identity=identity,
        tenant=tenant,
        action="deal_changed",
        reason=f"Deal updated for {deal['company_name']}",
        target_id=deal_id,
        before_state=before,
        after_state=deal,
    )
    return CrmMutationResponse(ok=True, message="Deal updated", data={"deal": deal})


@router.post("/deals/{deal_id}/move-stage", response_model=CrmMutationResponse)
def post_crm_deal_move_stage(
    deal_id: str,
    payload: MoveStageRequest,
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> CrmMutationResponse:
    _require_crm_access(identity, tenant)
    before = next((deal for deal in crm_store.list_deals(_scope(identity, tenant)) if deal["id"] == deal_id), None)
    deal = crm_store.move_deal(_scope(identity, tenant), deal_id, payload.stage)
    if deal is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deal not found")
    _clear_crm_cache(identity)
    action = "deal_won" if payload.stage == "closed_won" else "deal_lost" if payload.stage == "closed_lost" else "stage_moved"
    _log_crm_action(
        request=request,
        identity=identity,
        tenant=tenant,
        action=action,
        reason=f"Deal moved to {payload.stage}",
        target_id=deal_id,
        before_state=before,
        after_state=deal,
        risk_score=46 if payload.stage in {"closed_won", "closed_lost"} else 32,
    )
    return CrmMutationResponse(ok=True, message="Deal stage moved", data={"deal": deal})


@router.get("/activities", response_model=ActivitiesResponse)
def get_crm_activities(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> ActivitiesResponse:
    _require_crm_access(identity, tenant)
    return ActivitiesResponse(activities=crm_store.list_activities(_scope(identity, tenant)))


@router.post("/activity/log", response_model=CrmMutationResponse)
def post_crm_activity_log(
    payload: ActivityLogRequest,
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> CrmMutationResponse:
    _require_crm_access(identity, tenant)
    activity = crm_store.log_activity(_tenant_id(tenant), payload.model_dump())
    _clear_crm_cache(identity)
    _log_crm_action(
        request=request,
        identity=identity,
        tenant=tenant,
        action="activity_logged",
        reason=f"CRM activity logged: {payload.activity_type}",
        target_id=str(activity["id"]),
        after_state=activity,
    )
    return CrmMutationResponse(ok=True, message="Activity logged", data={"activity": activity})


@router.get("/demos", response_model=DemosResponse)
def get_crm_demos(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> DemosResponse:
    _require_crm_access(identity, tenant)
    return DemosResponse(demos=crm_store.list_demos(_scope(identity, tenant)))


@router.post("/demos/book", response_model=CrmMutationResponse)
def post_crm_demo_book(
    payload: DemoBookRequest,
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> CrmMutationResponse:
    _require_crm_access(identity, tenant)
    demo = crm_store.book_demo(_tenant_id(tenant), payload.model_dump(mode="json"))
    _clear_crm_cache(identity)
    _log_crm_action(
        request=request,
        identity=identity,
        tenant=tenant,
        action="demo_booked",
        reason=f"Demo booked for {demo['company_name']}",
        target_id=str(demo["id"]),
        after_state=demo,
    )
    return CrmMutationResponse(ok=True, message="Demo booked", data={"demo": demo})


@router.get("/forecast", response_model=ForecastResponse)
def get_crm_forecast(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> ForecastResponse:
    _require_crm_access(identity, tenant)
    forecast = cached_call(
        identity_tenant_cache_key(identity, "crm:forecast"),
        10,
        lambda: crm_store.forecast(_scope(identity, tenant)),
    )
    return ForecastResponse(**forecast)


@router.get("/scoring", response_model=LeadScoringResponse)
def get_crm_scoring(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> LeadScoringResponse:
    _require_crm_access(identity, tenant)
    scoring = cached_call(
        identity_tenant_cache_key(identity, "crm:scoring"),
        10,
        lambda: crm_store.scoring(_scope(identity, tenant)),
    )
    return LeadScoringResponse(**scoring)


@router.get("/metrics", response_model=GrowthMetricsResponse)
def get_crm_metrics(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> GrowthMetricsResponse:
    _require_crm_access(identity, tenant)
    metrics = cached_call(
        identity_tenant_cache_key(identity, "crm:metrics"),
        12,
        lambda: crm_store.metrics(_scope(identity, tenant)),
    )
    return GrowthMetricsResponse(**metrics)
