from __future__ import annotations

from fastapi import APIRouter, Request

from app.audit.engine import append_audit_event
from app.core.runtime_cache import cached_call, clear_runtime_cache
from app.prestige.schemas import PrestigeLeadRequest, PrestigeMutationResponse, PrestigeResponse
from app.prestige.service import prestige_service

router = APIRouter(prefix="/site", tags=["Phase 29.C Prestige and Global Showcase"])


def _cache(name: str, builder, ttl: int = 30):
    return cached_call(f"prestige:public:{name}", ttl, builder)


def _log(request: Request, action: str, reason: str, after_state: dict[str, object]) -> None:
    append_audit_event(
        category="public_site",
        action=action,
        severity="low",
        target_module="prestige",
        status="success",
        reason=reason,
        request=request,
        actor_email="public@sentra.site",
        actor_role="public",
        tenant_id="public",
        after_state=after_state,
        risk_score=12,
        is_demo=True,
    )


@router.get("/summary", response_model=PrestigeResponse)
def get_site_summary() -> PrestigeResponse:
    return PrestigeResponse(data=_cache("summary", prestige_service.summary))


@router.get("/global", response_model=PrestigeResponse)
def get_site_global() -> PrestigeResponse:
    return PrestigeResponse(data=_cache("global", prestige_service.global_showcase))


@router.get("/authority", response_model=PrestigeResponse)
def get_site_authority() -> PrestigeResponse:
    return PrestigeResponse(data=_cache("authority", prestige_service.authority))


@router.get("/status", response_model=PrestigeResponse)
def get_site_status() -> PrestigeResponse:
    return PrestigeResponse(data=_cache("status", prestige_service.status))


@router.get("/investors", response_model=PrestigeResponse)
def get_site_investors() -> PrestigeResponse:
    return PrestigeResponse(data=_cache("investors", prestige_service.investors))


@router.post("/request-demo", response_model=PrestigeMutationResponse)
def post_request_demo(payload: PrestigeLeadRequest, request: Request) -> PrestigeMutationResponse:
    result = prestige_service.request_demo(payload.model_dump())
    clear_runtime_cache("prestige:public:")
    _log(request, "site_request_demo", "Public demo request captured", result)
    return PrestigeMutationResponse(ok=True, message="Demo request captured", data=result)


@router.post("/waitlist", response_model=PrestigeMutationResponse)
def post_waitlist(payload: PrestigeLeadRequest, request: Request) -> PrestigeMutationResponse:
    result = prestige_service.waitlist(payload.model_dump())
    clear_runtime_cache("prestige:public:")
    _log(request, "site_waitlist", "Public waitlist request captured", result)
    return PrestigeMutationResponse(ok=True, message="Waitlist request captured", data=result)
