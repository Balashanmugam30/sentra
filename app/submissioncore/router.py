from __future__ import annotations

from fastapi import APIRouter, Depends, Request

from app.audit.engine import append_audit_event
from app.core.runtime_cache import cached_call, clear_runtime_cache
from app.rbac.guard import get_current_identity
from app.submissioncore.schemas import SubmissionMutationRequest, SubmissionMutationResponse, SubmissionResponse
from app.submissioncore.service import submission_service
from app.tenancy.context import get_tenant_context, identity_tenant_cache_key

router = APIRouter(prefix="/submission", tags=["Phase 29.B Pitch and Submission Engine"])


def _cache(identity: dict[str, object], name: str, builder, ttl: int = 15):
    return cached_call(identity_tenant_cache_key(identity, f"submission:{name}"), ttl, builder)


def _clear(identity: dict[str, object]) -> None:
    clear_runtime_cache(identity_tenant_cache_key(identity, "submission:"))


def _log(request: Request, identity: dict[str, object], tenant: dict[str, object], action: str, reason: str, risk_score: int = 20) -> None:
    append_audit_event(
        category="submission_engine",
        action=action,
        severity="low",
        target_module="submissioncore",
        status="success",
        reason=reason,
        request=request,
        identity=identity,
        tenant_id=str(tenant["tenant_id"]),
        risk_score=risk_score,
    )


@router.get("/summary", response_model=SubmissionResponse)
def get_submission_summary(identity: dict[str, object] = Depends(get_current_identity)) -> SubmissionResponse:
    return SubmissionResponse(data=_cache(identity, "summary", submission_service.summary))


@router.get("/deck", response_model=SubmissionResponse)
def get_submission_deck(template: str | None = None, identity: dict[str, object] = Depends(get_current_identity)) -> SubmissionResponse:
    return SubmissionResponse(data=_cache(identity, f"deck:{template or 'investor'}", lambda: submission_service.deck(template)))


@router.get("/docs", response_model=SubmissionResponse)
def get_submission_docs(identity: dict[str, object] = Depends(get_current_identity)) -> SubmissionResponse:
    return SubmissionResponse(data=_cache(identity, "docs", submission_service.docs))


@router.get("/judges", response_model=SubmissionResponse)
def get_submission_judges(identity: dict[str, object] = Depends(get_current_identity)) -> SubmissionResponse:
    return SubmissionResponse(data=_cache(identity, "judges", submission_service.judges))


@router.get("/impact", response_model=SubmissionResponse)
def get_submission_impact(identity: dict[str, object] = Depends(get_current_identity)) -> SubmissionResponse:
    return SubmissionResponse(data=_cache(identity, "impact", submission_service.impact))


@router.get("/score", response_model=SubmissionResponse)
def get_submission_score(identity: dict[str, object] = Depends(get_current_identity)) -> SubmissionResponse:
    return SubmissionResponse(data=_cache(identity, "score", submission_service.score))


@router.get("/architecture", response_model=SubmissionResponse)
def get_submission_architecture(identity: dict[str, object] = Depends(get_current_identity)) -> SubmissionResponse:
    return SubmissionResponse(data=_cache(identity, "architecture", submission_service.architecture))


@router.get("/demo-script", response_model=SubmissionResponse)
def get_submission_demo_script(identity: dict[str, object] = Depends(get_current_identity)) -> SubmissionResponse:
    return SubmissionResponse(data=_cache(identity, "demo_script", submission_service.demo_script))


@router.get("/team", response_model=SubmissionResponse)
def get_submission_team(identity: dict[str, object] = Depends(get_current_identity)) -> SubmissionResponse:
    return SubmissionResponse(data=_cache(identity, "team", submission_service.team))


@router.post("/generate", response_model=SubmissionMutationResponse)
def post_submission_generate(payload: SubmissionMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> SubmissionMutationResponse:
    result = submission_service.generate(str(tenant["tenant_id"]), payload.artifact or "submission_pack", payload.mode or "google_solution_challenge")
    _clear(identity)
    _log(request, identity, tenant, "submission_generate", payload.reason or "Submission pack generated")
    return SubmissionMutationResponse(ok=True, message="Submission pack generated", data=result)


@router.post("/export", response_model=SubmissionMutationResponse)
def post_submission_export(payload: SubmissionMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> SubmissionMutationResponse:
    result = submission_service.export(str(tenant["tenant_id"]), payload.artifact or "deck", payload.format or "pdf")
    _clear(identity)
    _log(request, identity, tenant, "submission_export", payload.reason or "Submission artifact exported")
    return SubmissionMutationResponse(ok=True, message="Submission export ready", data=result)
