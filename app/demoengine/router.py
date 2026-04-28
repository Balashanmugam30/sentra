from __future__ import annotations

from fastapi import APIRouter, Depends, Request

from app.audit.engine import append_audit_event
from app.core.runtime_cache import cached_call, clear_runtime_cache
from app.demoengine.schemas import DemoMutationRequest, DemoMutationResponse, DemoResponse
from app.demoengine.service import demo_service
from app.demoengine.store import demo_store
from app.rbac.guard import get_current_identity
from app.tenancy.context import get_tenant_context, identity_tenant_cache_key

router = APIRouter(prefix="/demo", tags=["Phase 20.X Demo Domination Engine"])


def _cache(identity: dict[str, object], name: str, builder, ttl: int = 6):
    return cached_call(identity_tenant_cache_key(identity, f"demo:{name}"), ttl, builder)


def _clear(identity: dict[str, object]) -> None:
    clear_runtime_cache(identity_tenant_cache_key(identity, "demo:"))


def _log(request: Request, identity: dict[str, object], tenant: dict[str, object], action: str, reason: str, target_id: str | None = None) -> None:
    append_audit_event(
        category="demo_engine",
        action=action,
        severity="medium",
        target_module="demoengine",
        target_id=target_id,
        status="success",
        reason=reason,
        request=request,
        identity=identity,
        tenant_id=str(tenant["tenant_id"]),
        risk_score=22,
    )


@router.get("/summary", response_model=DemoResponse)
def get_demo_summary(identity: dict[str, object] = Depends(get_current_identity)) -> DemoResponse:
    return DemoResponse(data=_cache(identity, "summary", demo_service.summary))


@router.get("/scenes", response_model=DemoResponse)
def get_demo_scenes(mode: str | None = None, identity: dict[str, object] = Depends(get_current_identity)) -> DemoResponse:
    return DemoResponse(data=_cache(identity, f"scenes:{mode or 'all'}", lambda: demo_service.scenes(mode)))


@router.post("/run", response_model=DemoMutationResponse)
def post_demo_run(payload: DemoMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> DemoMutationResponse:
    result = demo_store.run(str(tenant["tenant_id"]), payload.mode or "judge", payload.scenario or "fire")
    _clear(identity)
    _log(request, identity, tenant, "demo_run", payload.reason or "One-click guided demo started", str(result["run"]["run_id"]))
    return DemoMutationResponse(ok=True, message="Demo scenario running across Sentra systems", data=result)


@router.post("/run/{scenario}", response_model=DemoMutationResponse)
def post_demo_run_scenario(scenario: str, payload: DemoMutationRequest | None = None, request: Request = None, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> DemoMutationResponse:
    active_payload = payload or DemoMutationRequest()
    normalized = "multiincident" if scenario == "multi" else scenario
    result = demo_store.run(str(tenant["tenant_id"]), active_payload.mode or "judge", normalized)
    _clear(identity)
    if request is not None:
        _log(request, identity, tenant, f"demo_run_{normalized}", active_payload.reason or f"{normalized} demo injected", str(result["run"]["run_id"]))
    return DemoMutationResponse(ok=True, message=f"{normalized} demo injected", data=result)


@router.post("/next", response_model=DemoMutationResponse)
def post_demo_next(payload: DemoMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> DemoMutationResponse:
    snapshot = demo_store.snapshot()
    scenes = sorted(snapshot["scenes"], key=lambda row: int(row["order"]))
    index = int(snapshot["state"].get("active_scene_index", 0))
    next_index = min(len(scenes) - 1, index + 1)
    result = demo_store.update_state({"active_scene_index": next_index, "speed": payload.speed or snapshot["state"].get("speed", 1), "playing": True}, "demo_next_scene", str(tenant["tenant_id"]))
    _clear(identity)
    _log(request, identity, tenant, "demo_next_scene", payload.reason or "Advanced demo scene", scenes[next_index]["scene_id"])
    return DemoMutationResponse(ok=True, message="Demo advanced to next scene", data=result)


@router.post("/reset", response_model=DemoMutationResponse)
def post_demo_reset(payload: DemoMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> DemoMutationResponse:
    result = demo_store.reset(str(tenant["tenant_id"]))
    _clear(identity)
    _log(request, identity, tenant, "demo_reset", payload.reason or "Demo reset to baseline", "demo")
    return DemoMutationResponse(ok=True, message="Demo reset to calm baseline", data=result)


@router.get("/judge", response_model=DemoResponse)
def get_demo_judge(identity: dict[str, object] = Depends(get_current_identity)) -> DemoResponse:
    return DemoResponse(data=_cache(identity, "judge", demo_service.judge))


@router.get("/export", response_model=DemoResponse)
def get_demo_export(identity: dict[str, object] = Depends(get_current_identity)) -> DemoResponse:
    return DemoResponse(data=_cache(identity, "export", demo_service.export_center, 20))


@router.get("/polish", response_model=DemoResponse)
def get_demo_polish(identity: dict[str, object] = Depends(get_current_identity)) -> DemoResponse:
    return DemoResponse(data=_cache(identity, "polish", demo_service.polish, 20))

